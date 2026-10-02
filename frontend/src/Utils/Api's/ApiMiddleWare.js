import { SpringBackendInstance, NodeBackendInstance } from "../AxiosInstance"

const BackendService = async (url, body, contentType = 'application/json', config = {}) => {
  const headers = {};

  if (body instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
  } else {
    headers['Content-Type'] = contentType;
  }

  const response = await SpringBackendInstance.post(url, body, {
    headers: headers,
    ...config,
  });
  return response;
};

const NodeBackendService = async (url, body = {}, contentType = 'application/json') => {
  const response = await NodeBackendInstance.post(url, body, {
    headers: {
      'Content-Type': contentType,
    },
  });
  return response;
};

export { BackendService, NodeBackendService };