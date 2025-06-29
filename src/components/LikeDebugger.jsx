import React, { useState } from 'react';
import { imageService } from '../images/services/imageService';
import { debugLog } from '../config';

const LikeDebugger = () => {
  const [imageId, setImageId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLike = async () => {
    if (!imageId) return;
    setLoading(true);
    try {
      debugLog('Testing LIKE operation...');
      const result = await imageService.likeImage(imageId);
      setResult({ type: 'like', success: true, data: result });
      debugLog('LIKE test completed:', result);
    } catch (error) {
      setResult({ type: 'like', success: false, error: error.message });
      debugLog('LIKE test failed:', error);
    }
    setLoading(false);
  };

  const testUnlike = async () => {
    if (!imageId) return;
    setLoading(true);
    try {
      debugLog('Testing UNLIKE operation...');
      const result = await imageService.removeLike(imageId);
      setResult({ type: 'unlike', success: true, data: result });
      debugLog('UNLIKE test completed:', result);
    } catch (error) {
      setResult({ type: 'unlike', success: false, error: error.message });
      debugLog('UNLIKE test failed:', error);
    }
    setLoading(false);
  };

  const testGetCount = async () => {
    if (!imageId) return;
    setLoading(true);
    try {
      debugLog('Testing GET COUNT operation...');
      const result = await imageService.getLikeCount(imageId);
      setResult({ type: 'count', success: true, data: result });
      debugLog('GET COUNT test completed:', result);
    } catch (error) {
      setResult({ type: 'count', success: false, error: error.message });
      debugLog('GET COUNT test failed:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 9999,
      minWidth: '300px'
    }}>
      <h3>Like Debugger</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Image ID"
          value={imageId}
          onChange={(e) => setImageId(e.target.value)}
          style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <button onClick={testLike} disabled={loading} style={{ flex: 1, padding: '5px' }}>
          Test Like
        </button>
        <button onClick={testUnlike} disabled={loading} style={{ flex: 1, padding: '5px' }}>
          Test Unlike
        </button>
        <button onClick={testGetCount} disabled={loading} style={{ flex: 1, padding: '5px' }}>
          Get Count
        </button>
      </div>

      {loading && <div>Loading...</div>}
      
      {result && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <strong>{result.type.toUpperCase()}</strong>: {result.success ? 'Success' : 'Failed'}
          <pre style={{ margin: '5px 0', fontSize: '12px' }}>
            {JSON.stringify(result.success ? result.data : result.error, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Open browser console to see debug logs
      </div>
    </div>
  );
};

export default LikeDebugger;
