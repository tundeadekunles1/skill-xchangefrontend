import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup-page.css";
import axios from "axios";

const Signup = ({ switchToSignIn }) => {
  const [shouldUnmount, setShouldUnmount] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError("");
    setSuccess("");
  };

  const validateInputs = () => {
    const { fullName, email, password, confirmPassword, agree } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      return "All fields are required.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (!agree) {
      return "You must agree to the Terms and Privacy Policy.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateInputs();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    console.log(baseURL);
    try {
      const response = await axios.post(`${baseURL}/auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess("Account created successfully! Check your email to verify.");
        setShouldUnmount(true);
        setTimeout(() => {
          navigate("/check-email");
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };
  if (shouldUnmount) return null;
  return (
    <div className="signup-modal">
      <div className="signup-header">
        <button className="active-tab">Sign Up</button>
      </div>

      <p className="switch-text">
        Already have an account?{" "}
        <span onClick={switchToSignIn} className="link">
          Log In
        </span>
      </p>

      <button className="google-signup">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="G"
        />
        Sign up with Google
      </button>

      <div className="divider">
        <hr />
        <span>Or</span>
        <hr />
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your fullname"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <label className="checkbox">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            required
          />
          I agree to the <a href="/">Terms of Service</a> and{" "}
          <a href="/">Privacy Policy</a>
        </label>

        <button type="submit" className="submit-btn">
          Get Started
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
    </div>
  );
};

export default Signup;
