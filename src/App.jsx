import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load components for code splitting
const Topbar = lazy(() => import('./components/Topbar/Topbar'));
const Navbar = lazy(() => import('./components/Navbar/Navbar'));
const Footer = lazy(() => import('./components/Footer/Footer'));
const Loader = lazy(() => import('./components/Loader/Loader'));
const Home = lazy(() => import('./pages/Home/Home'));
const Marketplace = lazy(() => import('./pages/Marketplace/Marketplace'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const About = lazy(() => import('./pages/About/About'));
const UserProfile = lazy(() => import('./pages/UserProfile/UserProfile'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation/OrderConfirmation'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Admin
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const ListUsers = lazy(() => import('./pages/Admin/ListUsers'));
const EditUser = lazy(() => import('./pages/Admin/EditUser'));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return <Loader />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((reg) => {
            console.log('SW registered:', reg.scope);
          })
          .catch((err) => {
            console.log('SW registration failed:', err);
          });
      });
    }
  }, []);

  return (
    <HelmetProvider>
      <div className="App">
        <Suspense fallback={<Loader />}>
          <Topbar />
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />

              {/* Protected Routes */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:email?"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditUser />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute adminOnly>
                    <ListUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/edit/:email"
                element={
                  <ProtectedRoute adminOnly>
                    <EditUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </Suspense>
      </div>
    </HelmetProvider>
  );
}

export default App;
