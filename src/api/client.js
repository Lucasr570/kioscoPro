import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Adjuntar el token de acceso si existe en localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas: Manejar la renovación transparente de tokens si expiran (401)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si la respuesta es 401 Unauthorized y la petición original no se ha reintentado aún
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Si el error ocurrió en el propio endpoint de login, rechazar inmediatamente
      if (originalRequest.url.includes('/token/')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Usamos una instancia limpia de axios para no disparar este interceptor
          const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';
          const response = await axios.post(`${baseUrl}token/refresh/`, {
            refresh: refreshToken
          });
          
          if (response.status === 200) {
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            if (refresh) {
              localStorage.setItem('refresh_token', refresh);
            }
            
            // Actualizamos la cabecera de la petición original y la reintentamos
            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // El token de refresco también expiró o es inválido, forzar logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.dispatchEvent(new Event('auth_logout'));
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth_logout'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

