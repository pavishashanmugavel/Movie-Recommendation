// Auth + DB shim for MongoDB-backed API (replacing Firebase usage)
// This file preserves the same exports: auth, db, signup, login, logout
// so the rest of the app can remain unchanged.

// Config: change via Vite env VITE_API_BASE; default to relative so dev proxy handles /api
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || "";

// ---- Lightweight auth state management ----
let currentUser = null; // { uid, name, email } or null
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

// Load from localStorage on init
try {
  const savedUser = localStorage.getItem(AUTH_USER_KEY);
  if (savedUser) currentUser = JSON.parse(savedUser);
} catch {}

const subscribers = new Set();
const notifyAuthSubscribers = () => {
  subscribers.forEach((cb) => {
    try { cb(currentUser); } catch {}
  });
};

const auth = {
  // Mimic Firebase's currentUser getter
  get currentUser() {
    return currentUser;
  },
  // Compatibility helper if any part of the app subscribes to auth changes
  onAuthStateChanged(callback) {
    subscribers.add(callback);
    // Fire immediately with current state
    try { callback(currentUser); } catch {}
    // Return unsubscribe
    return () => subscribers.delete(callback);
  },
};

// Simple db placeholder so existing imports of `db` keep working
const db = {
  provider: "mongodb",
  info: "MongoDB Atlas via backend API",
};

// ---- Helpers ----
const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data?.message || data?.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  // Try parse JSON, allow empty
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function setSession(token, user) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  currentUser = user || null;
  notifyAuthSubscribers();
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  currentUser = null;
  notifyAuthSubscribers();
}

// ---- Public API (preserving names/signatures) ----
// signup(name, email, password)
const signup = async (name, email, password) => {
  try {
    const data = await api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    // Expect backend to return: { token, user: { id/uid, name, email } }
    const token = data?.token;
    const user = data?.user && {
      uid: data.user.uid || data.user.id || data.user._id,
      displayName: data.user.name,
      email: data.user.email,
    };

    setSession(token, user);
  } catch (error) {
    console.error("Signup Error:", error.message);
    throw error;
  }
};

// login(email, password)
const login = async (email, password) => {
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const token = data?.token;
    const user = data?.user && {
      uid: data.user.uid || data.user.id || data.user._id,
      displayName: data.user.name,
      email: data.user.email,
    };

    setSession(token, user);
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

// logout()
const logout = async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch (error) {
    // Even if backend fails, clear local session
    console.warn("Logout warning:", error.message);
  } finally {
    clearSession();
  }
};

// Optional: try to refresh user from backend on load (if token exists)
(async function bootstrap() {
  const token = getAuthToken();
  if (!token) return;
  if (!API_BASE) return;
  try {
    const data = await api("/api/auth/me", { method: "GET" });
    if (data?.user) {
      setSession(token, {
        uid: data.user.uid || data.user.id || data.user._id,
        displayName: data.user.name,
        email: data.user.email,
      });
    }
  } catch {
    // Invalid token, clear
    clearSession();
  }
})();

export { auth, db, login, signup, logout, setSession, clearSession };