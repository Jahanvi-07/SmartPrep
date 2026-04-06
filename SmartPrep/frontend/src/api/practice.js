import authApi from './auth';

export const generateCodingProblem = async () => {
  const response = await authApi.get('/practice/coding');
  return response.data;
};

export const analyzeInterview = async (question, transcript) => {
  const response = await authApi.post('/practice/interview/analyze', { question, transcript });
  return response.data;
};
