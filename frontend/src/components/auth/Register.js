import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Login.css";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showconformPassword, setShowConformPassword] = useState(false);

  // ✅ Alert message state
  const [alertMsg, setAlert] = useState({ message: "", type: "" });

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setAlert({
        message: "Passwords do not match!",
        type: "error",
      });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      return;
    }

    try {
      const res = await API.post("/auth/register", form);

      // ✅ Show success alert first
      setAlert({
        message: res.data.msg || "Registration successful!",
        type: "success",
      });

      // Wait 1 second before redirecting
      setTimeout(() => {
        setAlert({ message: "", type: "" });
        navigate("/");
      }, 1000);
    } catch (err) {
      // ❌ Show error alert
      setAlert({
        message:
          err.response?.data?.msg ||
          err.response?.data?.error ||
          "Registration failed!",
        type: "error",
      });

      // Hide after 3 seconds
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
    }
  };

  return (
    <div
      className="bg-img d-flex align-items-center justify-content-center Register"
      style={{
        background: `url(${
          process.env.PUBLIC_URL + "/images/bg-chatapp.jpg"
        }) no-repeat center center / cover`,
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
          <div className="col-xl-6 col-lg-7 col-md-9">
            <div className="card o-hidden border-0 shadow-lg p-4">
              <div className="d-flex align-items-center justify-content-center login-brand pt-3">
                <div className="sidebar-brand-icon rotate-n-15">
                  <i className="fas fa-comments"></i>
                </div>
                <h4 className="text-center mb-4">ChatHub</h4>
              </div>

              {/* ✅ Alert Message */}
              {alertMsg.message && (
                <div
                  className={`alert ${
                    alertMsg.type === "success"
                      ? "alert-success"
                      : "alert-danger"
                  } py-2`}
                  role="alert"
                >
                  {alertMsg.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Full Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="form-control login-feild"
                    />
                  </div>

                  {/* Username */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                      className="form-control login-feild"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="form-control login-feild"
                    />
                  </div>

                  {/* Phone */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setForm({ ...form, phone: value });
                        }
                      }}
                      placeholder="Enter 10-digit number"
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      className="form-control login-feild"
                    />
                    {form.phone.length > 0 && form.phone.length < 10 && (
                      <small className="text-danger">
                        Phone number must be 10 digits
                      </small>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password</label>
                    <div className="form-group position-relative mb-4">
                      <span
                        className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={`fas ${
                            showPassword ? "fa-unlock" : "fa-lock"
                          }`}
                        ></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="form-control login-feild ps-5"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirm Password</label>
                    <div className="form-group position-relative mb-4">
                      <span
                        className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setShowConformPassword(!showconformPassword)
                        }
                      >
                        <i
                          className={`fas ${
                            showconformPassword ? "fa-unlock" : "fa-lock"
                          }`}
                        ></i>
                      </span>
                      <input
                        type={showconformPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        className="form-control login-feild ps-5"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-4">
                  <label className="form-label d-block">Gender</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        onChange={handleChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Male</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        onChange={handleChange}
                        required
                        className="form-check-input"
                      />
                      <label className="form-check-label">Female</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        name="gender"
                        value="prefer_not"
                        onChange={handleChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">
                        Prefer not to say
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn login-feild w-100">
                  Register
                </button>
              </form>

              <div className="text-center mt-3">
                <a href="/" className="small text-muted">
                  Already have an account? Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
