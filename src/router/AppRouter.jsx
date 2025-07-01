import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../shared/components/Layout';
import Feed from '../images/pages/Feed';
import Profile from '../auth/pages/Profile';
import Login from '../auth/pages/Login';
import SignUp from '../auth/pages/SignUp';
import Settings from '../auth/pages/Settings';
import PublicProfile from '../pages/PublicProfile';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? (
        <Layout>
          <Feed />
        </Layout>
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/profile',
      element: (
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/" replace /> : <Login />,
    },
    {
      path: '/signup',
      element: isAuthenticated ? <Navigate to="/" replace /> : <SignUp />,
    },
    {
      path: '/profile/:username',
      element: <PublicProfile />, // No authentication required for public profiles
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
