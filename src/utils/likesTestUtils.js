// Utilidades para probar los endpoints de likes
import { imageService } from '../images/services/imageService';
import { debugLog } from '../config';

export const testAllLikeEndpoints = async (imageId) => {
  const results = {};
  
  console.group(`🧪 Testing all like endpoints for image: ${imageId}`);
  
  try {
    // 1. Verificar estado inicial
    debugLog('1. Checking initial like status...');
    const initialStatus = await imageService.checkIfLiked(imageId);
    results.initialStatus = { success: true, data: { liked: initialStatus } };
    console.log('✅ Initial status:', initialStatus);
    
    // 2. Obtener conteo inicial
    debugLog('2. Getting initial like count...');
    const initialCount = await imageService.getLikeCount(imageId);
    results.initialCount = { success: true, data: initialCount };
    console.log('✅ Initial count:', initialCount);
    
    // 3. Dar like si no está liked, o quitar like si está liked
    if (!initialStatus) {
      debugLog('3. Adding like...');
      const likeResult = await imageService.likeImage(imageId);
      results.addLike = { success: true, data: likeResult };
      console.log('✅ Like added');
      
      // 4. Verificar nuevo estado
      debugLog('4. Checking status after like...');
      const statusAfterLike = await imageService.checkIfLiked(imageId);
      results.statusAfterLike = { success: true, data: { liked: statusAfterLike } };
      console.log('✅ Status after like:', statusAfterLike);
      
      // 5. Verificar nuevo conteo
      debugLog('5. Getting count after like...');
      const countAfterLike = await imageService.getLikeCount(imageId);
      results.countAfterLike = { success: true, data: countAfterLike };
      console.log('✅ Count after like:', countAfterLike);
      
      // 6. Quitar like
      debugLog('6. Removing like...');
      const unlikeResult = await imageService.removeLike(imageId);
      results.removeLike = { success: true, data: unlikeResult };
      console.log('✅ Like removed');
      
      // 7. Verificar estado final
      debugLog('7. Checking final status...');
      const finalStatus = await imageService.checkIfLiked(imageId);
      results.finalStatus = { success: true, data: { liked: finalStatus } };
      console.log('✅ Final status:', finalStatus);
      
      // 8. Verificar conteo final
      debugLog('8. Getting final count...');
      const finalCount = await imageService.getLikeCount(imageId);
      results.finalCount = { success: true, data: finalCount };
      console.log('✅ Final count:', finalCount);
    } else {
      // Si ya está liked, solo quitar el like
      debugLog('3. Removing existing like...');
      const unlikeResult = await imageService.removeLike(imageId);
      results.removeLike = { success: true, data: unlikeResult };
      console.log('✅ Existing like removed');
      
      // 4. Verificar nuevo estado
      debugLog('4. Checking status after unlike...');
      const statusAfterUnlike = await imageService.checkIfLiked(imageId);
      results.statusAfterUnlike = { success: true, data: { liked: statusAfterUnlike } };
      console.log('✅ Status after unlike:', statusAfterUnlike);
      
      // 5. Verificar nuevo conteo
      debugLog('5. Getting count after unlike...');
      const countAfterUnlike = await imageService.getLikeCount(imageId);
      results.countAfterUnlike = { success: true, data: countAfterUnlike };
      console.log('✅ Count after unlike:', countAfterUnlike);
    }
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    results.error = { success: false, error: error.message };
  }
  
  console.groupEnd();
  return results;
};

export const quickLikeTest = async (imageId) => {
  try {
    console.log(`🚀 Quick test for image ${imageId}`);
    
    // Status check using the /like/status endpoint
    const liked = await imageService.checkIfLiked(imageId);
    console.log(`💖 Currently liked: ${liked}`);
    
    // Count check using the /likes/count endpoint
    const count = await imageService.getLikeCount(imageId);
    console.log(`🔢 Like count: ${count.count}`);
    
    return { liked, count: count.count };
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return { error: error.message };
  }
};

// Test to verify all endpoints respond with correct formats
export const testEndpointFormats = async (imageId) => {
  console.group(`🔍 Testing endpoint response formats for image: ${imageId}`);
  
  const results = {};
  
  try {
    // Test GET /images/{image_id}/like/status
    console.log('Testing GET /like/status endpoint...');
    const statusResult = await imageService.checkIfLiked(imageId);
    results.statusEndpoint = {
      success: true,
      data: { liked: statusResult },
      format: typeof statusResult === 'boolean' ? 'boolean' : 'unexpected'
    };
    console.log(`✅ Status endpoint returns: ${statusResult} (${typeof statusResult})`);
    
    // Test GET /images/{image_id}/likes/count
    console.log('Testing GET /likes/count endpoint...');
    const countResult = await imageService.getLikeCount(imageId);
    results.countEndpoint = {
      success: true,
      data: countResult,
      format: typeof countResult.count === 'number' ? 'number' : 'unexpected'
    };
    console.log(`✅ Count endpoint returns: ${JSON.stringify(countResult)}`);
    
    console.log('🎉 All endpoint format tests passed!');
    
  } catch (error) {
    console.error('❌ Endpoint format test failed:', error);
    results.error = { success: false, error: error.message };
  }
  
  console.groupEnd();
  return results;
};

// Exportar para uso en la consola del navegador
if (typeof window !== 'undefined') {
  window.testLikes = testAllLikeEndpoints;
  window.quickLikeTest = quickLikeTest;
  window.testEndpointFormats = testEndpointFormats;
}
