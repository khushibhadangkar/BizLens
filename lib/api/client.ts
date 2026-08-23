/**
 * API Client Configuration
 * 
 * Prepares the frontend to integrate with the FastAPI backend.
 * Currently stubbed out, but designed to easily plug into the
 * real backend once Phase 1 UI/UX is finalized.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
  /**
   * Uploads a file to the backend
   * @param file File to upload
   */
  uploadFile: async (file: File) => {
    // This will connect to the real backend later.
    // For now, it returns a simulated successful response.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: {
            id: `file_${Math.random().toString(36).substr(2, 9)}`,
            filename: file.name,
            size: file.size,
            status: 'processing',
          }
        });
      }, 1500);
    });
    
    /* 
    // Future implementation:
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'POST',
      body: formData,
      // headers: {
      //   'Authorization': `Bearer ${token}`
      // }
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    return response.json();
    */
  },
};
