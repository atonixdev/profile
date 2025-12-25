import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  // Pre-fill email from registration redirect if available
  const from = location.state?.email || '';

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Try to get JWT token
      const response = await axios.post(
        'http://localhost:8000/api/token/',
        {
          username: formData.username,
          password: formData.password,
        }
      );

      const { access, refresh } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Fetch user details
      try {
        const userResponse = await axios.get(
          'http://localhost:8000/api/accounts/profiles/',
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );

        // Get current user from profiles
        if (userResponse.data && userResponse.data.length > 0) {
          const currentUser = userResponse.data[0];
          setUser(currentUser);
        }
      } catch (err) {
        // If profile fetch fails, set user to basic info
        setUser({
          username: formData.username,
          email: formData.username,
        });
      }

      // Redirect to community or home
      const redirectPath = location.state?.from || '/community';
      navigate(redirectPath);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access the community
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username/Email */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                defaultValue={from}
                placeholder="Enter your username or email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/register"
            className="w-full py-3 px-4 rounded-lg font-semibold text-center text-primary-600 border-2 border-primary-600 hover:bg-primary-50 transition"
          >
            Create Account
          </Link>

          {/* Footer Text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            By signing in, you agree to our{' '}
            <button className="text-primary-600 hover:underline bg-transparent border-0 cursor-pointer p-0">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="text-primary-600 hover:underline bg-transparent border-0 cursor-pointer p-0">
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Need help?
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <button className="hover:text-primary-600 transition bg-transparent border-0 cursor-pointer text-left p-0">
                Reset your password
              </button>
            </li>
            <li>
              <button className="hover:text-primary-600 transition bg-transparent border-0 cursor-pointer text-left p-0">
                Contact support
              </button>
            </li>
            <li>
              <a href="/about" className="hover:text-primary-600 transition">
                Learn about the platform
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
