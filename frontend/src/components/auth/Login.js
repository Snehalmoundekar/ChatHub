import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Login.css";
import API from "../../api/api";

function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetData, setResetData] = useState({ username: "", newPassword: "" });
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [alertreset, setAlertset] = useState({ message: "", type: "" });


  const navigate = useNavigate();

  // Handle login input
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle reset input
  const handleResetChange = (e) =>
    setResetData({ ...resetData, [e.target.name]: e.target.value });

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ STEP 1: Create/Persist unique device ID
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = crypto.randomUUID(); // generates unique ID
        localStorage.setItem("deviceId", deviceId);
      }

      const res = await API.post("/auth/login", {
        ...form,
        deviceId  // 👈 send deviceId to backend
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setAlert({
        message: res.data.msg || "Login successful!",
        type: "success",
      });

      setTimeout(() => {
        setAlert({ message: "", type: "" });
        navigate("/chat");
      }, 1000);

    } catch (err) {
      setAlert({
        message:
          err.response?.data?.msg ||
          err.response?.data?.error ||
          "Invalid credentials!",
        type: "error",
      });

      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
    }
  };



  // Handle password reset submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/reset-password", resetData);

      // ✅ Show success alert
      setAlertset({
        message: res.data.msg || "Password reset successfully!",
        type: "success",
      });

      // Wait 2 seconds before closing popup
      setTimeout(() => {
        setAlertset({ message: "", type: "" });
        setShowReset(false);
      }, 2000);
    } catch (err) {
      // ❌ Show error alert
      setAlertset({
        message:
          err.response?.data?.msg ||
          err.response?.data?.error ||
          "Something went wrong!",
        type: "error",
      });

      setTimeout(() => setAlertset({ message: "", type: "" }), 3000);
    }
  };


  return (
    <div
      className="bg-img d-flex align-items-center justify-content-center"
      style={{
        background: `url(${process.env.PUBLIC_URL + "/images/bg-chatapp.jpg"}) no-repeat center center / cover`,
        height: "100vh",
        position: "relative",
      }}
    >
      <div className="bg-overlay"></div>

      <div className="container login-card">
        <div
          className="row justify-content-center"
          style={{ position: "relative", zIndex: "2" }}
        >
          <div className="col-xl-5 col-lg-6 col-md-8">
            <div className="card o-hidden border-0 shadow-lg">
              <div className="card-body p-0">
                <div className="col p-5">
                  <div className="d-flex align-items-center justify-content-center login-brand mb-4">
                    <div className="sidebar-brand-icon rotate-n-15">
                      <i className="fas fa-comments"></i>
                    </div>
                    <h4 className="text-center ms-2">ChatHub</h4>
                  </div>

                  {/* ✅ Custom Alert */}
                  {alert.message && (
                    <div className={`custom-alert ${alert.type}`}>
                      {alert.message}
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="form-group position-relative mb-4">
                      <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Username"
                        autoComplete="username"
                        required
                        className="form-control login-feild ps-5"
                      />
                    </div>

                    <div className="form-group position-relative mb-3">
                      <span
                        className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={`fas ${showPassword ? "fa-unlock" : "fa-lock"
                            }`}
                        ></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        className="form-control login-feild ps-5"
                      />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-end mb-3 text-muted">
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowReset(true)}
                      >
                        Forgot Password?
                      </span>
                    </div>

                    <button type="submit" className="btn login-feild w-100">
                      Login
                    </button>
                  </form>

                  <div className="text-center mt-3">
                    <a href="/register" className="small text-muted">
                      Don’t have an account? Register
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Popup Reset Password ---------------- */}
      {showReset && (
        <div className="reset-overlay">
          <div className="reset-popup card shadow-lg p-4 justify-content-center">
            <h5 className="mb-3 text-center">Reset Password</h5>
            {/* ✅ Custom Alert */}
            {alertreset.message && (
              <div className={`custom-alert ${alertreset.type}`}>
                {alertreset.message}
              </div>
            )}
            <form onSubmit={handleResetSubmit}>
              <div className="form-group position-relative mb-4">
                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  name="username"
                  value={resetData.username}
                  onChange={handleResetChange}
                  placeholder="Enter your username"
                  className="form-control mb-4 ps-5"
                  required
                />
              </div>
              <div className="form-group position-relative mb-4">
                <span
                  className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowResetPassword(!showResetPassword)}
                >
                  <i
                    className={`fas ${showResetPassword ? "fa-unlock" : "fa-lock"
                      }`}
                  ></i>
                </span>
                <input
                  type={showResetPassword ? "text" : "password"}
                  name="newPassword"
                  value={resetData.newPassword}
                  onChange={handleResetChange}
                  placeholder="Enter new password"
                  className="form-control mb-4 ps-5"
                  required
                />
              </div>
              <div className="d-flex justify-content-between">
                <button type="submit" className="btn reset-button w-50 me-2">
                  Reset
                </button>
                <button
                  type="button"
                  className="btn reset-cancel-button w-50"
                  onClick={() => setShowReset(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginForm;
