import axios from 'axios';
import { useToastService } from '../composables/useToast.mjs';

const http = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api/' : `${import.meta.env.VITE_APP_BASE_URL}/api/`,
});

http.interceptors.request.use(
  config => config,
  error => Promise.reject(error),
);

http.interceptors.response.use(
  response => {
    const { showToast } = useToastService();
    const { data } = response;
    const { toast, message } = data;

    if (toast) {
      showToast({ ...toast });
    } else if (message) {
      showToast({ detail: message });
    }

    return response;
  },
  error => {
    const { showToast } = useToastService();

    const { response = {}, message = '' } = error || {};
    const { status = null, data = {} } = response;
    const { toast } = data;

    if (status === 200 && !response.data.error?.message && message) {
      showToast({ severity: 'error', detail: message, summary: 'Error' });
    } else if (status === 400 && toast) {
      showToast({ ...toast });
    } else if (status === 422) {
      showToast({ severity: 'error', detail: 'This request could not be processed', summary: 'Error' });
    }

    return Promise.reject(error);
  },
);

export default http;
