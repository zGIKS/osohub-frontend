import AppRouter from './router/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import ToastContainer from './shared/components/ToastContainer';
import './App.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRouter />
        <ToastContainer />
      </AuthProvider>
    </div>
  );
}

export default App;
