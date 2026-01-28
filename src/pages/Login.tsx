import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { notifyAuthChanged } from '../api/Admin/client';

function getErrorMessage(err: unknown): string {
  // Axios-like error shape
  const anyErr = err as any;
  const apiMessage = anyErr?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) return apiMessage;

  if (anyErr?.response?.status) {
    return `Request failed (${anyErr.response.status})`;
  }

  if (err instanceof Error && err.message) return err.message;

  return 'Login failed';
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      // Backend returns { access_token, user } directly (flat structure)
      // authAPI.login already returns response.data, so response is the flat object
      const access_token = response?.access_token;
      const user = response?.user;

      if (typeof access_token !== 'string' || !access_token) {
        throw new Error('Login succeeded but token is missing in response');
      }
      if (!user || typeof user !== 'object') {
        throw new Error('Login succeeded but user is missing in response');
      }

      try {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch {
        // If storage is blocked/quota exceeded, show clear info instead of "Login failed"
        setSuccess('Logged in, but browser blocked saving session. Please allow storage/cookies.');
        notifyAuthChanged();
        return;
      }

      notifyAuthChanged();
      setSuccess('Login successful');

      // If your app is admin-only after login, you can redirect all users here.
      navigate('/products');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Login</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
