import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { handleLogin } from "./Auth/authentication"
import jwt from "./Auth/jwt"

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const Auth = (e) => {
    e.preventDefault()

    jwt.setCRToken()
    .then(res => {
      if(res && res.status === 204) {
        jwt.post('/login', {email: email, password: password})
        .then(response => {
          const data = response.data;
          console.log(data);
          if(response.status === 201) {
            handleLogin(data);
            navigate('/', { replace: true });
          }
        })
        .catch(err => console.log(err))
      }
    })
    .catch(err => console.log(err))
  };

  return (
    <div>

      <form onSubmit={Auth}>
        <br />
        <br />
        
        <label htmlFor="email">Email</label>
        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <br />
        <br />

        <label htmlFor="password">Password</label>
        <input type="text" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />

        <br />
        <br />

        <button className="btn login-btn">Login</button>

      </form>
    </div>
  )
}

export default Login