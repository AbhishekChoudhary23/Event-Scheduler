import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToaster, Message } from "rsuite";
import "../styles/Login.css";

function Signup() {
  const [firstname, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toaster = useToaster();

  const showToast = (type, message) => {
    toaster.push(
      <Message showIcon type={type}>
        {message}
      </Message>,
      { placement: "topCenter" }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstname, email, password }),
      });

      const data = await response.json();
      console.log("Raw response data:", data); // Log the entire response data

      if (response.ok) {
        // Use optional chaining to safely access properties
        localStorage.setItem("token", data.token ?? "");
        localStorage.setItem("email", data.email ?? data.user?.email ?? "");
        localStorage.setItem("userId", data.userId ?? data.user?.userid ?? "");

        showToast("success", "Signup successful!");
        navigate("/", { replace: true });
      } else {
        // Handle error responses from the server
        throw new Error(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showToast("error", err.message);
    }
  };

  return (
    <div className="form-container">
      <p className="title">Signup</p>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstName(e.target.value)}
        />
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
        <button className="form-btn">Signup</button>
      </form>
      <p className="sign-up-label">
        Already have an account?
        <span className="sign-up-link">
          <Link to="/">Log in</Link>
        </span>
      </p>
    </div>
  );
}

export default Signup;
