import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth'
import { setSession } from './firebase'

// Initialize two Firebase apps (user and admin) from Vite env
function initApp(name, cfg) {
  const apps = getApps()
  const exists = apps.find(a => a.name === name)
  if (exists) return exists
  return initializeApp(cfg, name)
}

const userApp = initApp('userApp', {
  apiKey: import.meta.env.VITE_FB_USER_API_KEY,
  authDomain: import.meta.env.VITE_FB_USER_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_USER_PROJECT_ID,
  appId: import.meta.env.VITE_FB_USER_APP_ID,
})

const adminApp = initApp('adminApp', {
  apiKey: import.meta.env.VITE_FB_ADMIN_API_KEY,
  authDomain: import.meta.env.VITE_FB_ADMIN_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_ADMIN_PROJECT_ID,
  appId: import.meta.env.VITE_FB_ADMIN_APP_ID,
})

const userAuth = getAuth(userApp)
const adminAuth = getAuth(adminApp)

// Use central session manager from ./firebase so subscribers are notified

export async function loginWithFirebaseEmailPassword(role, email, password) {
  const auth = role === 'admin' ? adminAuth : userAuth
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const idToken = await cred.user.getIdToken()
  const backendBase = import.meta.env.VITE_BACKEND_URL
  let token
  let user

  try {
    if (!backendBase) throw new Error('NO_BACKEND_CONFIGURED')

    const res = await fetch(`${backendBase}/api/auth/firebase/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, role }),
    })

    if (!res.ok) {
      let msg = 'Login failed'
      try { const d = await res.json(); msg = d?.message || msg } catch {}
      throw new Error(msg)
    }

    const data = await res.json()
    token = data?.token
    user = data?.user && {
      uid: data.user.uid || data.user.id || data.user._id,
      displayName: data.user.name,
      email: data.user.email,
      role: data.user.role,
    }
  } catch {
    // Fallback: use Firebase user directly when backend is unavailable (e.g. static hosting)
    const fbUser = cred.user
    token = idToken
    user = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email,
      role,
    }
  }

  setSession(token, user)
  return { token, user }
}

export async function signupWithFirebaseEmailPassword(role, name, email, password) {
  const auth = role === 'admin' ? adminAuth : userAuth
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  try {
    if (name) await updateProfile(cred.user, { displayName: name })
  } catch {}
  const idToken = await cred.user.getIdToken()
  const backendBase = import.meta.env.VITE_BACKEND_URL
  let token
  let user

  try {
    if (!backendBase) throw new Error('NO_BACKEND_CONFIGURED')

    const res = await fetch(`${backendBase}/api/auth/firebase/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, role }),
    })

    if (!res.ok) {
      let msg = 'Signup failed'
      try { const d = await res.json(); msg = d?.message || msg } catch {}
      throw new Error(msg)
    }

    const data = await res.json()
    token = data?.token
    user = data?.user && {
      uid: data.user.uid || data.user.id || data.user._id,
      displayName: data.user.name,
      email: data.user.email,
      role: data.user.role,
    }
  } catch {
    // Fallback: use Firebase user directly when backend is unavailable (e.g. static hosting)
    const fbUser = cred.user
    token = idToken
    user = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      email: fbUser.email,
      role,
    }
  }

  setSession(token, user)
  return { token, user }
}

export async function firebaseSignOut(role) {
  const auth = role === 'admin' ? adminAuth : userAuth
  await signOut(auth)
  // Do not clear local session here; reuse existing logout flow if needed
}

export { userAuth, adminAuth }
