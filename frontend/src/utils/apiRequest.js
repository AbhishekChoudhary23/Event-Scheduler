async function apiRequest(url, method, data = {}, token = null) {
    const headers = {
      "Content-Type": "application/json",
    };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    const options = {
      method,
      headers,
    };
  
    if (method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(data);
    }
  
    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      throw new Error("SOMETHING WENT WRONG !");
    }
  }

export default apiRequest;