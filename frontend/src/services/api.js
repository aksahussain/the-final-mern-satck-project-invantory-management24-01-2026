import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5005/api', // Matches backend port
});

// Add a request interceptor to include JWT token
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) { 
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error); // error pass
});

// Add a response interceptor to handle 401 (Token Expiry)
API.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Auto logout
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default API;
