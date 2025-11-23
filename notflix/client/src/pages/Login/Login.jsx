import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/logo1.png';
import { loginWithFirebaseEmailPassword, signupWithFirebaseEmailPassword } from '../../firebaseMulti';
import netflix_spinner from '../../assets/netflix_spinner.gif';

const Login = ({ adminMode = false }) => {
  const navigate = useNavigate();
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user_auth = async (event) => {
    event.preventDefault(); 
    setLoading(true);
    setError("");

    try {
      if (signState === "Sign In") {
        await loginWithFirebaseEmailPassword(adminMode ? 'admin' : 'user', email, password);
      } else {
        await signupWithFirebaseEmailPassword(adminMode ? 'admin' : 'user', name, email, password);
      }
      // Force redirect after successful auth; App-level subscriber will also navigate
      navigate('/');
    } catch (err) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    loading ? (
      <div className='login-spinner'>
        <img src={netflix_spinner} alt="Loading" />
      </div>
    ) : (
      <div className='login'>
        <img src={logo} className='login-logo' alt="Netflix" />
        <div className="login-form">
          <h1>{adminMode ? 'Admin ' : ''}{signState}</h1>

          <form>
            {signState === "Sign Up" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder='Name'
              />
            )}

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder='Email'
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder='Password'
            />

            {error && <div className="error-text">{error}</div>}

            <button onClick={user_auth} type='submit' disabled={loading}>{signState}</button>

            <div className="form-help">
              <div className="remember">
                <input type="checkbox" />
                <label htmlFor="">Remember Me</label>
              </div>
              <p>Need Help?</p>
            </div>
          </form>

          <div className="form-switch">
            {signState === "Sign In" ? (
              <p>
                New to Netflix?{" "}
                <span onClick={() => { setSignState("Sign Up"); setError(""); }}>Sign Up Now</span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span onClick={() => { setSignState("Sign In"); setError(""); }}>Sign In Now</span>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Login;