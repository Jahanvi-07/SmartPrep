import authApi from './auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000/api' 
  : 'http://localhost:5000/api';

/**
 * Upload a note file (PDF, DOCX, or TXT).
 * @param {Object} fileAsset - The file object from expo-document-picker
 * @returns {Promise<Object>} The created note
 */
export const uploadNote = async (fileAsset) => {
  const formData = new FormData();

  if (fileAsset.file) {
    // Web File object
    formData.append('file', fileAsset.file);
  } else {
    // React Native Mobile handling
    formData.append('file', {
      uri: fileAsset.uri,
      name: fileAsset.name || 'upload.pdf',
      type: fileAsset.mimeType || 'application/octet-stream',
    });
  }

  const token = await AsyncStorage.getItem('userToken');

  const response = await fetch(`${API_URL}/notes/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
      // Fetch automatically sets Content-Type with the correct boundary for FormData
    },
  });

  if (!response.ok) {
     let errMsg = 'Failed to upload file';
     try {
       const errData = await response.json();
       errMsg = errData.message || errMsg;
     } catch(e) {
       errMsg = await response.text();
     }
     throw new Error(errMsg);
  }

  return await response.json();
};

/**
 * Get all notes for the current user.
 * @returns {Promise<Array>} List of notes
 */
export const getNotes = async () => {
  const response = await authApi.get('/notes');
  return response.data;
};

/**
 * Get a single note by ID.
 * @param {string} noteId
 * @returns {Promise<Object>} The note
 */
export const getNoteById = async (noteId) => {
  const response = await authApi.get(`/notes/${noteId}`);
  return response.data;
};

/**
 * Delete a note by ID.
 * @param {string} noteId
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteNote = async (noteId) => {
  const response = await authApi.delete(`/notes/${noteId}`);
  return response.data;
};
