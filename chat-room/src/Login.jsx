import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "./Auth/authentication";
import jwt from "./Auth/jwt";
import { FiEye } from "react-icons/fi";
import Register from "./Register";

const Login = () => {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFields((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const Auth = (e) => {
    e.preventDefault();

    jwt
      .setCRToken()
      .then((res) => {
        if (res && res.status === 204) {
          jwt
            .post("/login", { email: fields.email, password: fields.password })
            .then((response) => {
              const data = response.data;
              console.log(response);
              if (response.status === 201) {
                handleLogin(data);
                navigate("/", { replace: true });
              }
              if (response.status === 203) {
                setErrors({
                  email: response.data.errors.email,
                  password: response.data.errors.password,
                });
              }
            })
            .catch((err) => {
              if (err.response.status === 422) {
                setErrors({
                  email: err.response.data.errors.email,
                  password: err.response.data.errors.password,
                });
              } else {
                console.log(err);
              }
            });
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="login">
      <div className="log-bg">
        {showRegister ? (
          <Register setShowRegister={setShowRegister} />
        ) : (
          <form onSubmit={Auth}>
            <div className="title">
              <h2>LOGIN</h2>
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="input"
                placeholder="Email here..."
                value={fields.email}
                name="email"
                onChange={handleChange}
              />
              {errors?.email && <p className="error">{errors?.email}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  className="input"
                  placeholder="........."
                  value={fields.password}
                  name="password"
                  onChange={handleChange}
                />
                <span onClick={() => setVisible(!visible)} className="toggler">
                  <FiEye />
                </span>
              </div>
              {errors?.password && <p className="error">{errors?.password}</p>}
            </div>
            <p className="no-acc">
              Don't have an account?
              <br />
              <span onClick={() => setShowRegister(true)}>
                Create Account Here
              </span>
            </p>
            <button type="submit" className="btn login-btn">
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
