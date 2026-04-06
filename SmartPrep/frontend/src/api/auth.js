import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your local machine's IP address if testing on a real device
// e.g., http://192.168.1.5:5000/api
import { Platform } from 'react-native';

// Dynamically handle Android Emulator vs Web/iOS mapping
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000/api' 
  : 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: API_URL,
});

authApi.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (name, email, password) => {
  const response = await authApi.post('/auth/register', { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await authApi.post('/auth/login', { email, password });
  return response.data;
};

export default authApi;
