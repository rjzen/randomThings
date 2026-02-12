import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authAPI.getFullProfile();
      setProfileData(data);
      if (data.avatar) {
        setAvatarPreview(`http://localhost:8000${data.avatar}`);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('user_info.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        user_info: {
          ...(prev.user_info || {}),
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      
      // Only add profile fields that exist in your Django Profile model
      // Don't include user_info fields as they're typically read-only
      const profileFields = [
        'about', 'phone', 'address', 'city', 'state', 'postcode',
        'date_of_birth', 'national_id', 'title', 'hire_date'
      ];

      profileFields.forEach(field => {
        if (profileData[field] !== null && profileData[field] !== undefined) {
          formData.append(field, profileData[field]);
        }
      });

      // Add avatar if changed
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Debug: Log what you're sending
      console.log('Sending FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const updatedData = await authAPI.updateProfile(formData);
      setProfileData(updatedData);
      setEditMode(false);
      setAvatarFile(null);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please check the console for details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences.</p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={avatarPreview || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20" fill="%23999"%3EUser%3C/text%3E%3C/svg%3E'}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                />
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {editMode ? 'Click the camera icon to change your profile picture' : 'Your current profile picture'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Account Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="user_info.username"
                value={profileData?.user_info?.username || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Contact)</label>
              <input
                type="email"
                name="user_info.email"
                value={profileData?.user_info?.email || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="user_info.first_name"
                value={profileData?.user_info?.first_name || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="user_info.last_name"
                value={profileData?.user_info?.last_name || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">About</h3>
          </div>
          <div className="p-6">
            <textarea
              name="about"
              value={profileData?.about || ''}
              onChange={handleInputChange}
              disabled={!editMode}
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData?.phone || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Contact)</label>
              <input
                type="email"
                name="contact_email"
                value={profileData?.user_info?.email || ''}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={profileData?.address || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData?.city || ''}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={profileData?.state || ''}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                <input
                  type="text"
                  name="postcode"
                  value={profileData?.postcode || ''}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Personal Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={profileData?.date_of_birth || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
              <input
                type="text"
                name="national_id"
                value={profileData?.national_id || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={profileData?.title || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
              <input
                type="date"
                name="hire_date"
                value={profileData?.hire_date || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editMode ? 'bg-white' : 'bg-gray-50'} ${editMode ? 'focus:ring-indigo-500 focus:border-indigo-500' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {editMode && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setAvatarFile(null);
                fetchProfile();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;