import Jwt from './jwt';

export const handleLogout = () => {
  Jwt.post('/logout')
  .then(res => {
    console.log(res);
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
  })
  .catch(err => console.log(err));
}

export const handleLogin = (payload) => {
  localStorage.setItem('userData', JSON.stringify(payload));
  localStorage.setItem('accessToken', payload.accessToken);
}