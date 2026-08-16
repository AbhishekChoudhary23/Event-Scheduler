import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToaster, Message } from 'rsuite';
import "../styles/Login.css";
import apiRequest from "../utils/apiRequest";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toaster = useToaster();

  const showToast = (type, message) => {
    toaster.push(
      <Message showIcon type={type}>
        {message}
      </Message>,
      { placement: 'topEnd', duration:4000}
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await apiRequest(import.meta.env.VITE_LOGIN_URL, 'POST', { email, password });

      if (data && data.data) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("email", data.data.user.email);
        localStorage.setItem("userId", data.data.user.userid); 
        showToast('success', 'Login successful!');
        navigate("/home", { replace: true });
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <p className="title">Login</p>
        <form className="form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            className="input" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            className="input" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <p className="page-link">
            <span className="page-link-label">Forgot Password?</span>
          </p>
          <button className="form-btn">Log in</button>
        </form>
        <p className="sign-up-label">
          Don't have an account?<span className="sign-up-link"><Link to="/signup">Sign up</Link></span>
        </p>
      </div>
    </div>
  );
}

export default Login;