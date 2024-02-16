import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "./Auth/authentication";
import jwt from "./Auth/jwt";
import { FiEye } from "react-icons/fi";

const Register = ({ setShowRegister }) => {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFields((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const Auth = (e) => {
    e.preventDefault();
    setLoading(true);
    jwt
      .post("/register", fields)
      .then((response) => {
        const data = response.data;
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
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response.status === 422) {
          setErrors({
            name: err.response.data.errors.name,
            email: err.response.data.errors.email,
            password: err.response.data.errors.password,
            password_confirmation:
              err.response.data.errors.password_confirmation,
          });
        } else {
          console.log(err);
        }
      });
  };

  return (
    <form onSubmit={Auth}>
      <div className="title">
        <h2>REGISTER</h2>
      </div>
      <div className="input-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          className="input"
          placeholder="Your Name here..."
          value={fields.name}
          name="name"
          onChange={handleChange}
        />
        {errors?.name && <p className="error">{errors?.name}</p>}
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
      <div className="input-group">
        <label htmlFor="password_confirmation">Password Confirmation</label>
        <input
          type={visible ? "text" : "password"}
          className="input"
          placeholder="........."
          value={fields.password_confirmation}
          name="password_confirmation"
          onChange={handleChange}
        />
        {errors?.password_confirmation && (
          <p className="error">{errors?.password_confirmation}</p>
        )}
      </div>
      <p className="no-acc">
        Don't have an account?
        <br />
        <span onClick={() => setShowRegister(false)}>Create Account Here</span>
      </p>
      <button className="btn login-btn" type="submit">
        <span className={`${loading ? "btn-hide" : ""}`}>Send</span>
        <div className={`btn-loader ${loading ? "" : "hide"}`}>
          <div className="loader"></div>
        </div>
      </button>
    </form>
  );
};

export default Register;
