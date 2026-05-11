import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Shield,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  User,
  UserPlus,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { getOrganizations } from '../services/organizationApi';
import { getUsers, deleteUser } from '../services/userApi';
import { useAuth } from '../context/AuthContext';
import DeleteModal from '../components/DeleteModal';

const HomePage = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // New state to store user for deletion

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const orgsData = await getOrganizations();
      let organizationsArray = [];
      if (Array.isArray(orgsData)) {
        organizationsArray = orgsData;
      } else if (orgsData && typeof orgsData === 'object') {
        if (Array.isArray(orgsData.data)) {
          organizationsArray = orgsData.data;
        } else if (Array.isArray(orgsData.organizations)) {
          organizationsArray = orgsData.organizations;
        }
      }

      const usersData = await getUsers('all');
      let usersArray = [];
      if (usersData && usersData.admins && Array.isArray(usersData.admins)) {
        usersArray = usersData.admins;
      } else if (Array.isArray(usersData)) {
        usersArray = usersData;
      } else if (usersData && usersData.users && Array.isArray(usersData.users)) {
        usersArray = usersData.users;
      }

      setOrganizations(organizationsArray);
      setUsers(usersArray);

      const activeUsers = usersArray.filter(user => user.status === true || user.status === "active").length;
      const inactiveUsers = usersArray.length - activeUsers;

      setStats({
        totalOrganizations: organizationsArray.length,
        totalUsers: usersArray.length,
        activeUsers,
        inactiveUsers
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentUsers = users.slice(0, 5);
  const recentOrganizations = organizations.slice(0, 5);

  const handleMenuClick = (event, user) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
    console.log('Selected user for menu:', user);
    console.log('User ID:', user.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedUser here, we need it for delete
    // setSelectedUser(null);
  };

  const handleDeleteClick = () => {
    console.log('Delete clicked, selectedUser:', selectedUser);
    if (!selectedUser) {
      console.error('No user selected for deletion');
      return;
    }
    console.log('User to delete:', selectedUser.name, 'ID:', selectedUser.id);
    setUserToDelete(selectedUser); // Store user for deletion
    handleMenuClose();
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Delete confirm called');
    console.log('userToDelete:', userToDelete);
    
    // Use userToDelete instead of selectedUser
    const userForDeletion = userToDelete;
    
    if (!userForDeletion || !userForDeletion.id) {
      console.error('No user selected for deletion', { userForDeletion });
      setDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }

    console.log('Attempting to delete user:', userForDeletion.name, 'with ID:', userForDeletion.id);

    try {
      setDeleting(true);
      console.log('Calling deleteUser API with ID:', userForDeletion.id);
      
      // Test if deleteUser function exists
      if (typeof deleteUser !== 'function') {
        console.error('deleteUser is not a function! Check your import');
        return;
      }
      
      const result = await deleteUser(userForDeletion.id);
      console.log('Delete API response:', result);
      
      console.log('Delete successful, updating state');
      
      // Update users list
      setUsers(prevUsers => {
        const newUsers = prevUsers.filter(user => user.id !== userForDeletion.id);
        console.log('Users before:', prevUsers.length, 'Users after:', newUsers.length);
        return newUsers;
      });
      
      // Update stats
      setStats(prev => {
        const isActive = userForDeletion.status === true || userForDeletion.status === "active";
        const newStats = {
          ...prev,
          totalUsers: prev.totalUsers - 1,
          activeUsers: isActive ? prev.activeUsers - 1 : prev.activeUsers,
          inactiveUsers: isActive ? prev.inactiveUsers : prev.inactiveUsers - 1
        };
        console.log('Updated stats:', newStats);
        return newStats;
      });
      
      // Close modal and clear selections
      setDeleteModalOpen(false);
      setSelectedUser(null);
      setUserToDelete(null);
      setAnchorEl(null);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      console.error('Error details:', error.message, error.response);
      // Optionally show an error message to the user
      alert(`Failed to delete user: ${error.message}`);
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    console.log('Delete modal closed');
    setDeleteModalOpen(false);
    setUserToDelete(null);
    setSelectedUser(null);
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{change}</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin space-y-8">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          icon={Building2}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-gradient-to-br from-green-500 to-green-600"
          change="+8%"
          changeType="positive"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={CheckCircle}
          color="bg-gradient-to-br from-secondary-500 to-secondary-600"
          change="+5%"
          changeType="positive"
        />
        <StatCard
          title="Inactive Users"
          value={stats.inactiveUsers}
          icon={AlertCircle}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          change="-2%"
          changeType="negative"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-soft overflow-hidden">
          <div className="p-3 sm:p-6 border-b border-gray-200/50 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Recent Users</h2>
                <p className="text-xs sm:text-sm text-gray-500">Latest admin accounts</p>
              </div>
            </div>
            <Link to="/admins" className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              <span className="hidden sm:inline">View all</span>
              <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 rotate-45" />
            </Link>
          </div>
          <div className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {recentUsers.length > 0 ? recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center">
                      <span className="text-secondary-600 font-semibold text-sm sm:text-base">{user.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold rounded-full ${user.status === true || user.status === "active" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status === true || user.status === "active" ? 'Active' : 'Inactive'}
                    </span>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, user)}
                      className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      size="small"
                    >
                      <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    </IconButton>
                  </div>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedUser?.id === user.id}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      sx: {
                        minWidth: '160px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      }
                    }}
                  >
                    <MenuItem onClick={handleMenuClose}>View Profile</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                    <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>Delete</MenuItem>
                  </Menu>
                </div>
              )) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm sm:text-base">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-soft overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Recent Organizations</h2>
                <p className="text-xs sm:text-sm text-gray-500">Latest registered orgs</p>
              </div>
            </div>
            <Link to="/organizations" className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              <span className="hidden sm:inline">View all</span>
              <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 rotate-45" />
            </Link>
          </div>
          <div className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {recentOrganizations.length > 0 ? recentOrganizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                      <Building2 className="w-3 h-3 sm:w-5 sm:h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:font-semibold text-gray-900 truncate">{org.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{org.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold rounded-full ${org.status === true || org.status === "active" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {org.status === true || org.status === "active" ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm sm:text-base">No organizations found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200/50 shadow-soft p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-100 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Quick Actions</h2>
            <p className="text-xs sm:text-sm text-gray-500">Perform common tasks quickly</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            to="/create-org"
            className="group flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-5 border-2 border-gray-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm sm:font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">Create Organization</p>
              <p className="text-xs sm:text-sm text-gray-500">Add a new organization</p>
            </div>
          </Link>

          <Link
            to="/create-admin"
            className="group flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-5 border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all duration-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm sm:font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Create Admin</p>
              <p className="text-xs sm:text-sm text-gray-500">Add a new admin user</p>
            </div>
          </Link>

          <Link
            to="/create-role"
            className="group flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-5 border-2 border-gray-200 rounded-2xl hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm sm:font-semibold text-gray-900 group-hover:text-secondary-700 transition-colors">Create Role</p>
              <p className="text-xs sm:text-sm text-gray-500">Define user permissions</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-2xl border border-gray-200/50 shadow-soft p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Activity Overview</h2>
            <p className="text-xs sm:text-sm text-gray-500">Track your system activity</p>
          </div>
        </div>
        <div className="h-60 sm:h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-soft mx-auto mb-2 sm:mb-4">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-2">Activity Charts Coming Soon</p>
            <p className="text-xs sm:text-sm text-gray-500">We're working on bringing you detailed analytics</p>
          </div>
        </div>
      </div>

      <DeleteModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name || selectedUser?.name || 'this user'}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default HomePage;