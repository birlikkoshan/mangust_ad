import { useState } from 'react';
import { authAPI, RegisterData } from '../../api/auth';
import { getCurrentUserRole } from '../../api/Admin/client';

const AddAdmin = () => {
  const [form, setForm] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = getCurrentUserRole() === 'admin';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!isAdmin) {
        setError('Only admins can create new admins.');
        return;
      }

      // NOTE: Backend currently creates users with role="user".
      // This page is intended for admin-only use; role elevation
      // should be handled on the backend (e.g. dedicated endpoint).
      const response = await authAPI.registerAdmin(form);
      setSuccess(`Admin candidate created: ${response?.data?.user?.email}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create admin');
    } 
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Add New Admin</h2>
        {!isAdmin && (
          <div className="alert alert-error" style={{ marginBottom: '15px' }}>
            You do not have permission to view this page.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={!isAdmin || loading}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={!isAdmin || loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={!isAdmin || loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={!isAdmin || loading}
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;

