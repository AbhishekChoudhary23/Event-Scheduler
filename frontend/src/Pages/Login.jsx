import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/AuthLayout';
import { useToast } from '../Components/Toast';
import { apiRequest } from '../utils/api';
import { getToken, saveSession } from '../utils/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  // Already logged in: skip the form.
  if (getToken()) return <Navigate to="/home" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      saveSession(await apiRequest('/user/login', 'POST', { email, password }));
      navigate('/home', { replace: true });
    } catch (error) {
      showToast(error.message, 'error');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      footer={<>New here? <Link to="/signup">Create an account</Link></>}
    >
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="button button-primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
