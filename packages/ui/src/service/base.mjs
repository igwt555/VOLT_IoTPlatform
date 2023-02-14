import http from '../plugins/axios.mjs';

export class HttpService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' ? '/api/' : `${import.meta.env.VITE_APP_BASE_URL}/api/`;
  }

  /**
   * Set Token On Header
   * @param token
   */
  static setToken(token) {
    http.defaults.headers.Authorization = `${token}`;
  }

  /**
   * Fetch data from server
   * @param url Endpoint link
   * @return Promise
   */
  get = (url, params) => http.get(`${url}`, {
    params,
  });

  /**
   * Write data over server
   * @param url Endpoint link
   * @param body Data to send over server
   * @return Promise
   */
  post = (url, body, options = {}) => http.post(`${url}`, body, {
    ...options,
  });

  /**
   * Delete Data From Server
   * @param url Endpoint link
   * @param params Embed as query params
   * @return Promise
   */
  delete = (url, params, data) => http.delete(`${url}`, { params, data });

  /**
   * Update data on server
   * @param url Endpoint link
   * @param body Data to send over server
   * @param params Embed as query params
   * @return Promise
   */
  put = (url, body, params) => http.put(`${url}`, body, {
    ...params,
  });

  cancel = () => {

  };
}
