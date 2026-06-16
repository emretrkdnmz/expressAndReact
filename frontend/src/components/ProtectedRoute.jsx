import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Reusable, role-based Protected Route component for React Router v6.
 *
 * @param {Object} props
 * @param {Object} props.user - The current authenticated user object
 * @param {Array<string>} props.allowedRoles - The roles permitted to access the route (e.g. ['admin', 'premium', 'user'])
 * @param {string} [props.redirectPath='/login'] - The redirection target if unauthenticated
 */
const ProtectedRoute = ({ user, allowedRoles, redirectPath = '/login' }) => {
  const location = useLocation();

  // 1. Check if user is authenticated
  if (!user) {
    // Save original location in state so we can redirect back after login
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 2. Extract current user's roles
  const userRoles = ['user']; // All logged-in users have at least the 'user' role
  if (user.isAdmin) {
    userRoles.push('admin');
  }
  if (user.premiumStatus === 'Premium') {
    userRoles.push('premium');
  }

  // 3. Verify role matching
  // allowedRoles might be undefined or empty, meaning only standard login check is required
  const hasAccess = !allowedRoles || allowedRoles.length === 0 
    ? true 
    : allowedRoles.some(role => userRoles.includes(role));

  if (!hasAccess) {
    // User is logged in but unauthorized for this specific role, redirect to songs page
    return <Navigate to="/songs" replace />;
  }

  // 4. Authorized, render nested child routes
  return <Outlet />;
};

export default ProtectedRoute;
