import { message } from 'antd';

export const handleApiError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const errorMessage = error.response.data?.message || 'Something went wrong';

    switch (status) {
      case 400:
        message.warning(errorMessage);
        break;
      case 401:
        message.error('Please login again');
        break;
      case 403:
        message.error('Access denied');
        break;
      case 404:
        message.warning('Resource not found');
        break;
      case 500:
        message.error('Server error. Please try again later.');
        break;
      default:
        message.error(errorMessage);
    }
  } else if (error.request) {
    message.error('Network error. Please check your connection.');
  } else {
    message.error(error.message || 'An unexpected error occurred');
  }
};

export const useApi = () => {
  const callApi = async (url, options = {}) => {
    try {
      const response = await api({
        url,
        ...options,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  return { callApi };
};