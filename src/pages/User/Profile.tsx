import { useState, useEffect } from 'react';
import { profileAPI, type Profile, type UpdateProfileData } from '../../api/profile';

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await profileAPI.get();
      setProfile(data);
      setFormData({ name: data.name, email: data.email, password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const payload: UpdateProfileData = { name: formData.name, email: formData.email };
      if (formData.password && formData.password.trim().length > 0) {
        payload.password = formData.password;
      }
      const updated = await profileAPI.update(payload);
      setProfile(updated);
      setFormData((prev) => ({ ...prev, password: '' }));
      setSuccess('Profile updated');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>{error ? <div className="alert alert-error">{error}</div> : 'Profile not found'}</div>;

  return (
    <div>
      <h1>Profile</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name ?? ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email ?? ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password (leave blank to keep)</label>
            <input
              type="password"
              value={formData.password ?? ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
