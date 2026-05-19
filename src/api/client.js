import axios from 'axios';

// La URL base apuntará al servidor de Django local por ahora
// Puedes cambiarla luego cuando esté en producción usando variables de entorno
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
