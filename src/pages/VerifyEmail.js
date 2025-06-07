import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      try {
        const res = await axios.get(`${baseURL}/auth/verify-email/${token}`);
        const jwtToken = res.data.token;

        localStorage.setItem("token", jwtToken);
        setMsg("Verification successful! Redirecting to sigin page");
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      } catch (err) {
        setMsg(
          err.response?.data?.message || "Verification failed or link expired."
        );
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <h2>Email Verification</h2>
      <p className="message">{loading ? "Verifying your email..." : msg}</p>
    </div>
  );
};

export default VerifyEmail;
