import AppRouter from './router/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </div>
  );
}

export default App;
