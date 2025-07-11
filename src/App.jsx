import AppRouter from './router/AppRouter';
import { AuthProvider } from './auth/contexts/AuthContext';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import ToastContainer from './shared/components/ToastContainer';
import './App.css';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
