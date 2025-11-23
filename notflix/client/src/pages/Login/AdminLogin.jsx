import React from 'react'
import Login from './Login'

// Admin login uses the same UI but sets adminMode to true.
// This route is intentionally not linked in the public UI. Navigate to /admin/login.
export default function AdminLogin() {
  return <Login adminMode={true} />
}
