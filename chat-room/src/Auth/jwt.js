import axios from 'axios';

axios.defaults.withCredentials = true;

class Jwt {

  constructor() {
    // ** Request Interceptor
    axios.interceptors.request.use(
      config => {
        // ** Get token from localStorage
        const accessToken = this.getToken()

        // ** If token is present add it to request's Authorization Header
        if (accessToken) {
          // ** eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
      },
      error => Promise.reject(error)
    );

    // ** Add request/response interceptor
    axios.interceptors.response.use(
      response => response,
      error => {
        // ** const { config, response: { status } } = error
        const { config, response } = error;
        const originalRequest = config;

        if (response && response.status === 401) {
          this.logout();
        }
        else if(response && response.status === 419) {
          this.setCRToken()
          .then(res => {
            // axios(originalRequest);
          })
        }

        return Promise.reject(error);
      }
    )
  }

  logout() {
    localStorage.clear();
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  setCRToken() {
    return axios.get('http://localhost:8000/sanctum/csrf-cookie');
  }

  post(url, ...args) {
    return axios.post(`http://localhost:8000/api${url}`, ...args);
  }

  put(url, ...args) {
    return axios.put(`http://localhost:8000/api${url}`, ...args);
  }

  patch(url, ...args) {
    return axios.patch(`http://localhost:8000/api${url}`, ...args);
  }
  
  get(url) {
    return axios.get(`http://localhost:8000/api${url}`);
  }

  delete(url) {
    return axios.delete(`http://localhost:8000/api${url}`);
  }

}


export default new Jwt()