import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../shared/components/Layout';
import Feed from '../images/pages/Feed';
import Profile from '../auth/pages/Profile';
import Login from '../auth/pages/Login';
import SignUp from '../auth/pages/SignUp';
import Settings from '../auth/pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Feed />
      </Layout>
    ),
  },
  {
    path: '/profile',
    element: (
      <Layout>
        <Profile />
      </Layout>
    ),
  },
  {
    path: '/settings',
    element: (
      <Layout>
        <Settings />
      </Layout>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
