// src/components/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

// Reusable password input with eye button (defined outside to prevent focus loss)
const PasswordInput = ({ value, onChange, placeholder, show, toggleShow, error }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm pr-10 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    <button
      type="button"
      onClick={toggleShow}
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
    >
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65" />
        </svg>
      )}
    </button>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Login = () => {
  const { setShowAuth, register, login } = useAuth();
  const [activePanel, setActivePanel] = useState("signin");

  // Registration fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Login fields
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Auto‑clear general error after 5 seconds
  useEffect(() => {
    if (generalError) {
      const timer = setTimeout(() => setGeneralError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [generalError]);

  // Clear field errors when user starts typing or switches panel
  useEffect(() => {
    setFieldErrors({});
  }, [
    firstName, lastName, emailReg, phone, passwordReg, confirmPassword,
    emailLogin, passwordLogin, activePanel
  ]);

  const togglePanel = (panel) => {
    setActivePanel(panel);
    setGeneralError("");
    setFieldErrors({});
  };

  const bgImage = "https://www.serviceonwheel.com/images/banner-clean.png";

  // 🔥 Universal error parser (handles backend validation array, single messages, network errors)
  const parseBackendError = (err, isRegistration) => {
    // Log for debugging (remove in production)
    console.group("🔴 Error caught in Login");
    console.log("Error object:", err);
    if (err.data) console.log("Error.data:", err.data);
    console.groupEnd();

    let fieldErrs = {};
    let general = null;

    // Network / fetch failure
    if (!err.data) {
      if (err.message === "Failed to fetch") {
        general = "Cannot connect to server. Please check your internet or backend status.";
      } else {
        general = err.message || "An unexpected error occurred. Please try again.";
      }
      return { fieldErrors: fieldErrs, generalError: general };
    }

    const errorData = err.data;

    // Case 1: Validation errors array (your backend's 422 response)
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length) {
      errorData.errors.forEach(item => {
        const backendField = item.field;
        const message = item.message;
        if (!backendField || !message) return;

        let frontendField = null;
        if (isRegistration) {
          switch (backendField) {
            case "firstName": frontendField = "firstName"; break;
            case "lastName": frontendField = "lastName"; break;
            case "email": frontendField = "emailReg"; break;
            case "phone": frontendField = "phone"; break;
            case "password": frontendField = "passwordReg"; break;
            case "confirmPassword": frontendField = "confirmPassword"; break;
            default: frontendField = backendField;
          }
        } else {
          switch (backendField) {
            case "email": frontendField = "emailLogin"; break;
            case "password": frontendField = "passwordLogin"; break;
            default: frontendField = backendField;
          }
        }
        if (frontendField) fieldErrs[frontendField] = message;
        else general = message;
      });
      if (Object.keys(fieldErrs).length) return { fieldErrors: fieldErrs, generalError: null };
      if (errorData.errors[0]?.message) general = errorData.errors[0].message;
      return { fieldErrors: fieldErrs, generalError: general };
    }

    // Case 2: Single message (e.g., "Email already exists", "Invalid credentials")
    if (errorData.message) {
      const msg = errorData.message;
      const lower = msg.toLowerCase();
      if (isRegistration) {
        if (lower.includes("email")) fieldErrs.emailReg = msg;
        else if (lower.includes("phone")) fieldErrs.phone = msg;
        else if (lower.includes("password")) fieldErrs.passwordReg = msg;
        else if (lower.includes("first name")) fieldErrs.firstName = msg;
        else if (lower.includes("last name")) fieldErrs.lastName = msg;
        else general = msg;
      } else {
        if (lower.includes("email")) fieldErrs.emailLogin = msg;
        else if (lower.includes("password")) fieldErrs.passwordLogin = msg;
        else general = msg;
      }
      return { fieldErrors: fieldErrs, generalError: general };
    }

    // Fallback
    general = "Something went wrong. Please try again.";
    return { fieldErrors: fieldErrs, generalError: general };
  };

  // ----- Registration handler -----
  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend validation
    const errors = {};
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!emailReg) errors.emailReg = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailReg)) errors.emailReg = "Enter a valid email address";
    if (!phone) errors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number";
    if (!passwordReg) errors.passwordReg = "Password is required";
    else if (passwordReg.length < 8) errors.passwordReg = "Password must be at least 8 characters";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (passwordReg !== confirmPassword) errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setGeneralError("");
    setFieldErrors({});

    try {
      await register({ firstName, lastName, email: emailReg, phone, password: passwordReg });
      // Success → AuthContext closes modal / redirects
    } catch (err) {
      const { fieldErrors, generalError } = parseBackendError(err, true);
      setFieldErrors(fieldErrors);
      if (generalError) setGeneralError(generalError);
    } finally {
      setLoading(false);
    }
  };

  // ----- Login handler -----
  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!emailLogin) errors.emailLogin = "Email is required";
    if (!passwordLogin) errors.passwordLogin = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setGeneralError("");
    setFieldErrors({});

    try {
      await login(emailLogin, passwordLogin);
    } catch (err) {
      const { fieldErrors, generalError } = parseBackendError(err, false);
      setFieldErrors(fieldErrors);
      if (generalError) setGeneralError(generalError);
    } finally {
      setLoading(false);
    }
  };

  // ----- Render -----
  return (
    <div className="min-h-screen w-full fixed z-[2000] flex items-center justify-center p-4 font-sans overflow-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl border flex flex-col md:flex-row overflow-auto">
        {/* Left Panel – background image & toggle buttons */}
        <div
          className="w-full md:w-1/2 relative flex flex-col justify-center items-center text-white p-5 md:p-8 min-h-[140px] md:min-h-[260px] bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
          <div className="relative z-10 text-center px-2">
            {activePanel === "signin" ? (
              <>
                <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Hello, Friend!</h1>
                <p className="mb-3 md:mb-5 text-xs md:text-sm">Enter your personal details and start journey with us</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => togglePanel("signup")} className="border-2 border-white text-white px-5 md:px-8 py-2 rounded-full font-bold text-sm hover:bg-white hover:text-gray-800 transition-all duration-300">
                    SIGN UP
                  </button>
                  <button onClick={() => setShowAuth(false)} className="hover:underline text-xs">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Welcome Back!</h1>
                <p className="mb-3 md:mb-5 text-xs md:text-sm">To keep connected with us please login with your personal info</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => togglePanel("signin")} className="border-2 border-white text-white px-5 md:px-8 py-2 rounded-full font-bold text-sm hover:bg-white hover:text-gray-800 transition-all duration-300">
                    SIGN IN
                  </button>
                  <button onClick={() => setShowAuth(false)} className="hover:underline text-xs">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel – forms */}
        <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col justify-center bg-white">
          {generalError && (
            <div className="mb-4 text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
              {generalError}
            </div>
          )}

          {activePanel === "signin" ? (
            // LOGIN FORM
            <form onSubmit={handleLogin} className="animate-fadeIn">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Sign In</h2>
              <div className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                      fieldErrors.emailLogin ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.emailLogin && <p className="text-red-500 text-xs mt-1">{fieldErrors.emailLogin}</p>}
                </div>
                <PasswordInput
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  placeholder="Password"
                  show={showLoginPassword}
                  toggleShow={() => setShowLoginPassword(!showLoginPassword)}
                  error={fieldErrors.passwordLogin}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all transform active:scale-95 shadow-lg text-sm disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? <div className="h-3 w-3 rounded-full border-2 border-white border-b-transparent animate-spin"></div> : "LOGIN"}
                </button>
              </div>
            </form>
          ) : (
            // REGISTRATION FORM
            <form onSubmit={handleRegister} className="animate-fadeIn">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-500">or use your email for registration</span></div>
              </div>
              <div className="space-y-3">
                {/* First Name */}
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                      fieldErrors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>}
                </div>
                {/* Last Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                      fieldErrors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>}
                </div>
                {/* Email */}
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={emailReg}
                    onChange={(e) => setEmailReg(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                      fieldErrors.emailReg ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.emailReg && <p className="text-red-500 text-xs mt-1">{fieldErrors.emailReg}</p>}
                </div>
                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${
                      fieldErrors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                </div>
                {/* Password */}
                <PasswordInput
                  value={passwordReg}
                  onChange={(e) => setPasswordReg(e.target.value)}
                  placeholder="Password (min 8 chars)"
                  show={showRegPassword}
                  toggleShow={() => setShowRegPassword(!showRegPassword)}
                  error={fieldErrors.passwordReg}
                />
                {/* Confirm Password */}
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  show={showConfirmPassword}
                  toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={fieldErrors.confirmPassword}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition text-sm disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? <div className="h-3 w-3 rounded-full border-2 border-white border-b-transparent animate-spin"></div> : "SIGN UP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Login;