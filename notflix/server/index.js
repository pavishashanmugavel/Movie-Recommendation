import dotenv from 'dotenv';
dotenv.config();   // ✅ MUST be first

import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import admin from 'firebase-admin';

// Debug logs AFTER loading env
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("PORT:", process.env.PORT);

// Resolve __dirname and load env from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'Netflix users';
const jwtSecret = process.env.JWT_SECRET;

if (!uri) throw new Error('Missing MONGODB_URI');
if (!jwtSecret) throw new Error('Missing JWT_SECRET');

const client = new MongoClient(uri);
let usersCol;

async function init() {
  await client.connect();
  const db = client.db(dbName);
  usersCol = db.collection('users');

  // Indexes
  await usersCol.createIndex({ email: 1 }, { unique: true });

  const port = process.env.PORT || 5000;
  app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Auth server running on port ${port}`);
});
}
init().catch(err => {
  console.error('Failed to init server:', err);
  process.exit(1);
});

// Helpers
function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, jwtSecret, { expiresIn: '7d' });
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await usersCol.findOne({ _id: new ObjectId(payload.sub) }, { projection: { passwordHash: 0 } });
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exists = await usersCol.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await usersCol.insertOne({
      name,
      email,
      passwordHash,
      provider: 'local',
      createdAt: new Date()
    });

    const user = { _id: result.insertedId, name, email };
    const token = createToken(user);
    res.status(201).json({ token, user });
  } catch (e) {
    console.error('Signup error', e);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await usersCol.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const safe = { _id: user._id, name: user.name, email: user.email };
    const token = createToken(safe);
    res.json({ token, user: safe });
  } catch (e) {
    console.error('Login error', e);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // Stateless JWT: client just discards token
  res.status(204).end();
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: { _id: req.user._id, name: req.user.name, email: req.user.email } });
});

// Firebase Admin init (lazy and optional)
function ensureFirebaseAdmin() {
  if (admin.apps.length) return true;
  try {
    // Option 1: Use GOOGLE_APPLICATION_CREDENTIALS file path
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credPath) {
      const abs = path.resolve(__dirname, credPath);
      if (fs.existsSync(abs)) {
        const raw = fs.readFileSync(abs, 'utf8');
        const serviceAccount = JSON.parse(raw);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        return true;
      }
    }

    // Option 2: Use inline JSON via FIREBASE_CREDENTIALS_JSON
    const inlineJson = process.env.FIREBASE_CREDENTIALS_JSON;
    if (inlineJson) {
      const serviceAccount = JSON.parse(inlineJson);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      return true;
    }

    return false;
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e);
    return false;
  }
}

// Exchange Firebase ID token for app JWT and persist user/admin
app.post('/api/auth/firebase/login', async (req, res) => {
  try {
    const ok = ensureFirebaseAdmin();
    if (!ok) return res.status(503).json({ message: 'Firebase Admin not configured' });

    const { idToken, role } = req.body || {};
    if (!idToken || !role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'idToken and valid role required' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    const name = decoded.name || (email ? email.split('@')[0] : 'User');
    if (!email) return res.status(400).json({ message: 'Email missing on token' });

    const exists = await usersCol.findOne({ email });
    let userId;
    if (!exists) {
      const result = await usersCol.insertOne({
        name,
        email,
        role,
        provider: 'firebase',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      userId = result.insertedId;
    } else {
      userId = exists._id;
      await usersCol.updateOne(
        { _id: exists._id },
        { $set: { name, role, provider: 'firebase' }, $currentDate: { lastLoginAt: true } }
      );
    }

    const user = { _id: userId, name, email, role };
    const token = createToken(user);
    return res.json({ token, user });
  } catch (e) {
    const msg = e?.message || 'Invalid Firebase token';
    const code = e?.errorInfo?.code || e?.code;
    console.error('Firebase login error:', code || '', msg);
    return res.status(401).json({ message: `Invalid Firebase token${code ? ` (${code})` : ''}: ${msg}` });
  }
});

// Static frontend in production (only if build exists)
const distDir = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  // In development, Vite serves the client on port 5173
  app.get('/', (_req, res) => res.send('API server running'));
}