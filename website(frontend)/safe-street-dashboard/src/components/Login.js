import React, { useState, useContext } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { account } from './appwriteConfig';
import { AuthContext } from '../AuthContext';
import { IoEyeOffSharp, IoEyeSharp } from 'react-icons/io5';
import logo1 from '../logo1.jpg';

function Login() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await account.createEmailPasswordSession(email, password);
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('429')) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="login-page">
    <img src={logo1} alt="Logo" className="login-logo" />

    <div className="login-container">


      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />}
            </span>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn1" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <label className='pw'>Create an account or Forgot password?</label>
        
        <p className="adm">
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=admin.safestreet@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Contact administrator
          </a>
        </p>
      </form>
    </div>
  </div>
);

}

export default Login;
