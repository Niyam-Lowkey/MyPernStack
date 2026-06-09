import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth Guard
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Category from '../pages/Category';
import ProductDetails from '../pages/ProductDetails';
import Search from '../pages/Search';
import Login from '../pages/Login';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import Categories from '../pages/admin/Categories';
import Products from '../pages/admin/Products';
import Flavors from '../pages/admin/Flavors';
import Banners from '../pages/admin/Banners';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Login page - accessible without auth */}
      <Route path="/login" element={<MainLayout />}>
        <Route index element={<Login />} />
      </Route>

      {/* Customer Routes - login required */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="category/:slug" element={<ProtectedRoute><Category /></ProtectedRoute>} />
        <Route path="product/:slug" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      </Route>

      {/* Admin Protected Routes under AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="flavors" element={<Flavors />} />
        <Route path="banners" element={<Banners />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

