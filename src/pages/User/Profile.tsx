import { useState, useEffect } from 'react';
import { profileAPI, type Profile, type UpdateProfileData } from '../../api/profile';

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData & { phone?: string; address?: string }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
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
      setFormData({
        name: data.name,
        email: data.email,
        password: '',
        phone: data.phone ?? '',
        address: data.address ?? '',
      });
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
      if (formData.phone != null) payload.phone = formData.phone;
      if (formData.address != null) payload.address = formData.address;
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

  if (loading) return <div className="user-container" style={{ padding: '48px 20px', textAlign: 'center' }}>Loading...</div>;
  if (!profile) return <div className="user-container">{error ? <div className="user-alert-error">{error}</div> : <p style={{ color: 'var(--user-text-muted)' }}>Profile not found</p>}</div>;

  return (
    <div className="user-page">
      <div className="user-container">
        <h1 style={{ marginBottom: '24px', color: 'var(--user-text)' }}>Profile</h1>

        {error && <div className="user-alert-error">{error}</div>}
        {success && <div className="user-alert-success">{success}</div>}

        <div className="user-card">
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="user-profile-photo-skeleton">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--user-bg-alt)', borderRadius: '50%', color: 'var(--user-text-muted)', fontSize: '48px', fontWeight: 600 }}>
                  {profile.name?.charAt(0) || profile.email?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h2 style={{ marginBottom: '20px', color: 'var(--user-text)' }}>Edit Profile</h2>
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
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={formData.address ?? ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Address"
                    rows={3}
                    style={{ minHeight: '80px' }}
                  />
                </div>
                {/* <div className="form-group">
                  <label>New Password (leave blank to keep)</label>
                  <input
                    type="password"
                    value={formData.password ?? ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div> */}
                <button type="submit" className="user-btn user-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
