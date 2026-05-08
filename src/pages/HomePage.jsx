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
  UserPlus
} from 'lucide-react';
import { getOrganizations } from '../services/organizationApi';
import { getUsers } from '../services/userApi';

const HomePage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch organizations
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

      // Fetch users
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

      // Calculate stats
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

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          icon={Building2}
          color="bg-blue-500"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-green-500"
          change="+8%"
          changeType="positive"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={CheckCircle}
          color="bg-purple-500"
          change="+5%"
          changeType="positive"
        />
        <StatCard
          title="Inactive Users"
          value={stats.inactiveUsers}
          icon={AlertCircle}
          color="bg-orange-500"
          change="-2%"
          changeType="negative"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link to="/admins" className="text-sm text-purple-600 hover:text-purple-700">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.status === true || user.status === "active" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status === true || user.status === "active" ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Organizations</h2>
              <Link to="/organizations" className="text-sm text-purple-600 hover:text-purple-700">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrganizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{org.name}</p>
                      <p className="text-sm text-gray-500">{org.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${org.status === true || org.status === "active" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {org.status === true || org.status === "active" ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/create-org"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Organization</p>
              <p className="text-sm text-gray-500">Add a new organization</p>
            </div>
          </Link>

          <Link
            to="/create-admin"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Admin</p>
              <p className="text-sm text-gray-500">Add a new admin user</p>
            </div>
          </Link>

          <Link
            to="/create-role"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Role</p>
              <p className="text-sm text-gray-500">Define user permissions</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Activity charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;