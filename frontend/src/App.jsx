import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages import for the routing
import Login from './pages/Login';
import Signup from './pages/Signup';


import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Chat from './pages/Chat';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
           

            {/* Protected Routes inside Layout */}
            {/* Base Protection */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/reports" element={<Reports />} />

                {/* Role Specific Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'inventory_manager']} />}>
                  <Route path="/purchases" element={<Purchases />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin', 'sales', 'sales team', 'inventory_manager', 'staff']} />}>
                  <Route path="/sales" element={<Sales />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/users" element={<UserManagement />} />
                </Route>

              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
