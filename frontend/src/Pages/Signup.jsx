import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/AuthLayout';
import { useToast } from '../Components/Toast';
import { apiRequest } from '../utils/api';

function Signup() {
  const [form, setForm] = useState({ firstName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest('/user/signup', 'POST', form);
      showToast('Account created. Log in to continue.', 'success');
      navigate('/', { replace: true });
    } catch (error) {
      showToast(error.message, 'error');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      footer={<>Already have an account? <Link to="/">Log in</Link></>}
    >
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>First name</span>
          <input
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={50}
            value={form.firstName}
            onChange={handleChange}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
          />
          <small>At least 6 characters</small>
        </label>
        <button className="button button-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Signup;
