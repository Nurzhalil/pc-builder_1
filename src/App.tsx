import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ComponentDetailPage from './pages/ComponentDetailPage';
import BuilderPage from './pages/BuilderPage';
import SavedBuildsPage from './pages/SavedBuildsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminComponents from './pages/admin/Components';
import AdminUsers from './pages/admin/Users';
import AdminBuilds from './pages/admin/Builds';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Routes>
            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="components" element={<AdminComponents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="builds" element={<AdminBuilds />} />
            </Route>

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <MainLayout>
                    <LoginPage />
                  </MainLayout>
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <MainLayout>
                    <RegisterPage />
                  </MainLayout>
                </PublicOnlyRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved-builds"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SavedBuildsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Public routes */}
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/catalog" element={<MainLayout><CatalogPage /></MainLayout>} />
            <Route path="/catalog/:type/:id" element={<MainLayout><ComponentDetailPage /></MainLayout>} />
            <Route path="/builder" element={<MainLayout><BuilderPage /></MainLayout>} />
            <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
            <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
          </Routes>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;