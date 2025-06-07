import React, { useState } from "react";
import "../styles/auth.css";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    try {
      const res = await axios.post(`${baseURL}/auth/forgot-password`, {
        email,
      });
      setMsg(res.data.message || "Check your email for reset link.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {msg && <p className="message">{msg}</p>}
    </div>
  );
};

export default ForgotPassword;
