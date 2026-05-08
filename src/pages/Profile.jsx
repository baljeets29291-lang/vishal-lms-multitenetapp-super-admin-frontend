import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Shield,
  Edit3,
  Camera,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { updateUser } from '../services/userApi';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Get user data from localStorage or API
  const [userData, setUserData] = useState({
    name: localStorage.getItem('userName') || 'Admin User',
    email: localStorage.getItem('userEmail') || 'admin@example.com',
    phone: localStorage.getItem('userPhone') || '+1 234 567 8900',
    address: localStorage.getItem('userAddress') || '123 Main St, City, State',
    role: localStorage.getItem('userRole') || 'Super Admin',
    organization: localStorage.getItem('userOrganization') || 'Main Organization',
    joinDate: localStorage.getItem('userJoinDate') || '2024-01-15',
    avatar: localStorage.getItem('userAvatar') || null
  });

  const [editForm, setEditForm] = useState({ ...userData });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Update editForm when userData changes
  useEffect(() => {
    setEditForm({ ...userData });
  }, [userData]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });

    // Validation
    const newErrors = {};
    if (!editForm.name.trim()) newErrors.name = 'Name is required';
    if (!editForm.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Update user data (you'll need to implement this API call)
      // await updateUser(userData.id, editForm);

      // Save to localStorage for now
      localStorage.setItem('userName', editForm.name);
      localStorage.setItem('userEmail', editForm.email);
      localStorage.setItem('userPhone', editForm.phone);
      localStorage.setItem('userAddress', editForm.address);

      setUserData({ ...userData, ...editForm });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });

    // Validation
    const newErrors = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Update password (you'll need to implement this API call)
      // await updatePassword(passwordForm);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatar = reader.result;
        setEditForm({ ...editForm, avatar });
        setUserData({ ...userData, avatar });
        localStorage.setItem('userAvatar', avatar);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6">
      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{userData.name}</h3>
              <p className="text-sm text-gray-500">{userData.role}</p>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${activeTab === 'profile'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${activeTab === 'security'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${activeTab === 'settings'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditForm({ ...userData });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleEditSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={isEditing ? editForm.name : userData.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={isEditing ? editForm.email : userData.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={isEditing ? editForm.phone : userData.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={isEditing ? editForm.address : userData.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{userData.role}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization
                      </label>
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{userData.organization}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Join Date
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{userData.joinDate}</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              </div>

              <div className="p-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className={`w-full pr-10 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className={`w-full pr-10 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email updates about your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Data Export</h3>
                    <p className="text-sm text-gray-500">Download your personal data</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Export Data
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-600">Delete Account</h3>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
