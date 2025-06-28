import { useState } from 'react';

const DirectAPITest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const testWithFetch = async () => {
    if (!email || !password) {
      setResult('Please enter both email and password');
      return;
    }

    setLoading(true);
    setResult('Testing with fetch API...\n');
    
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      const data = await response.text();
      setResult(prev => prev + `\nFetch Result:\nStatus: ${response.status}\nResponse: ${data}\n`);
      
    } catch (error) {
      setResult(prev => prev + `\nFetch Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testWithAxios = async () => {
    if (!email || !password) {
      setResult('Please enter both email and password');
      return;
    }

    setLoading(true);
    setResult('Testing with Axios...\n');
    
    try {
      const axios = (await import('axios')).default;
      
      const response = await axios.post('http://localhost:8080/auth/login', {
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false
      });
      
      setResult(prev => prev + `\nAxios Result:\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}\n`);
      
    } catch (error) {
      setResult(prev => prev + `\nAxios Error: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      background: '#fff',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '15px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Direct API Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={testWithFetch} 
          disabled={loading} 
          style={{ 
            marginRight: '10px', 
            padding: '8px 12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Test Fetch
        </button>
        <button 
          onClick={testWithAxios} 
          disabled={loading}
          style={{ 
            padding: '8px 12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Test Axios
        </button>
      </div>
      <div>
        <pre style={{ 
          background: '#f8f9fa',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '10px',
          maxHeight: '300px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          margin: 0,
          border: '1px solid #dee2e6'
        }}>
          {loading ? 'Testing...' : result || 'Click a button to test'}
        </pre>
      </div>
    </div>
  );
};

export default DirectAPITest;
