import authApi from './auth';

export const generateQuestions = async (text, type = 'mcq') => {
  const response = await authApi.post('/generator', { text, type });
  return response.data;
};
