import authApi from './auth';

export const getDashboardData = async () => {
  const response = await authApi.get('/dashboard');
  return response.data;
};

export const recordPractice = async (score, topic) => {
  const response = await authApi.post('/dashboard/practice', { score, topic });
  return response.data;
};
