import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import Home from './Home';
import Login from './Login';

function App() {
  
  const fetchUser = () => {
    const info = window.localStorage.getItem('userData');
    // ** Parse stored json or if none return null
    return info ? JSON.parse(info) : localStorage.clear();
  }

  const navigate = useNavigate();

  useEffect(() => {
    const user = fetchUser();
    if(!user) navigate('/login');
  }, [])  

  return (
    <Routes>
      <Route path="/Login" element={ <Login /> } />
      <Route path="/*" element={ <Home /> } />
    </Routes>
  );
}

export default App;
