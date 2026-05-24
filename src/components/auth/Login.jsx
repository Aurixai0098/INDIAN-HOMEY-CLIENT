// src/components/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Password input with eye toggle
const PasswordInput = ({ value, onChange, placeholder, show, toggleShow, error }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full pl-11 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm ${
        error ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
      }`}
    />
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <button
      type="button"
      onClick={toggleShow}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      {...props}
      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm ${
        props.error ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
      }`}
    />
    {props.error && <p className="text-red-500 text-xs mt-1 ml-1">{props.error}</p>}
  </div>
);

const Login = ({ initialPanel = "signin" }) => {
  const { setShowAuth, register, login } = useAuth();
  const [activePanel, setActivePanel] = useState(initialPanel);

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

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Password strength for registration
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: "" });

  // Reset active panel when initialPanel changes (modal reopened)
  useEffect(() => {
    setActivePanel(initialPanel);
  }, [initialPanel]);

  useEffect(() => {
    if (generalError) {
      const timer = setTimeout(() => setGeneralError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [generalError]);

  useEffect(() => {
    setFieldErrors({});
  }, [firstName, lastName, emailReg, phone, passwordReg, confirmPassword, emailLogin, passwordLogin, activePanel]);

  useEffect(() => {
    if (!passwordReg) {
      setPasswordStrength({ score: 0, message: "" });
      return;
    }
    let score = 0;
    if (passwordReg.length >= 8) score++;
    if (passwordReg.length >= 12) score++;
    if (/[A-Z]/.test(passwordReg)) score++;
    if (/[0-9]/.test(passwordReg)) score++;
    if (/[^A-Za-z0-9]/.test(passwordReg)) score++;
    let message = "";
    if (score <= 2) message = "Weak";
    else if (score <= 4) message = "Medium";
    else message = "Strong";
    setPasswordStrength({ score, message });
  }, [passwordReg]);

  const parseBackendError = (err, isRegistration) => {
    let fieldErrs = {};
    let general = null;
    if (!err.data) {
      general = err.message === "Failed to fetch" 
        ? "Cannot connect to server. Please check your internet." 
        : err.message || "Something went wrong.";
      return { fieldErrors: fieldErrs, generalError: general };
    }
    const errorData = err.data;
    if (errorData.errors && Array.isArray(errorData.errors)) {
      errorData.errors.forEach(item => {
        const backendField = item.field;
        const message = item.message;
        if (!backendField || !message) return;
        let frontendField = null;
        if (isRegistration) {
          if (backendField === "firstName") frontendField = "firstName";
          else if (backendField === "lastName") frontendField = "lastName";
          else if (backendField === "email") frontendField = "emailReg";
          else if (backendField === "phone") frontendField = "phone";
          else if (backendField === "password") frontendField = "passwordReg";
          else if (backendField === "confirmPassword") frontendField = "confirmPassword";
        } else {
          if (backendField === "email") frontendField = "emailLogin";
          else if (backendField === "password") frontendField = "passwordLogin";
        }
        if (frontendField) fieldErrs[frontendField] = message;
        else general = message;
      });
      if (Object.keys(fieldErrs).length) return { fieldErrors: fieldErrs, generalError: null };
      if (errorData.errors[0]?.message) general = errorData.errors[0].message;
      return { fieldErrors: fieldErrs, generalError: general };
    }
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
    general = "Something went wrong. Please try again.";
    return { fieldErrors: fieldErrs, generalError: general };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!firstName) errors.firstName = "First name required";
    if (!lastName) errors.lastName = "Last name required";
    if (!emailReg) errors.emailReg = "Email required";
    else if (!/\S+@\S+\.\S+/.test(emailReg)) errors.emailReg = "Invalid email";
    if (!phone) errors.phone = "Phone required";
    else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "10-digit Indian mobile number";
    if (!passwordReg) errors.passwordReg = "Password required";
    else if (passwordReg.length < 8) errors.passwordReg = "Minimum 8 characters";
    if (!confirmPassword) errors.confirmPassword = "Confirm password";
    else if (passwordReg !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    setGeneralError("");
    setFieldErrors({});
    try {
      await register({ firstName, lastName, email: emailReg, phone, password: passwordReg });
    } catch (err) {
      const { fieldErrors, generalError } = parseBackendError(err, true);
      setFieldErrors(fieldErrors);
      if (generalError) setGeneralError(generalError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!emailLogin) errors.emailLogin = "Email required";
    if (!passwordLogin) errors.passwordLogin = "Password required";
    if (Object.keys(errors).length) {
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

  const togglePanel = (panel) => {
    setActivePanel(panel);
    setGeneralError("");
    setFieldErrors({});
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn  overflow-auto">
      <div className="relative w-full max-w-4xl mt-32 md:mt-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setShowAuth(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* LEFT PANEL - Branding */}
          <div className="w-full md:w-2/5  p-8 md:p-10 flex flex-col items-center justify-center text-gray-500">
            <div className="mb-6">
              <div className="flex flex-col items-center  mb-4">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center">
                  <img src="https://res.cloudinary.com/dfqsa6hoc/image/upload/v1779533276/PhotoshopExtension_Image__1_-removebg-preview_fzvzvy.png" alt="logo"
                  className="h-full"
                  />
                </div>
                <span className="text-xl font-semibold">
                  <img src="https://res.cloudinary.com/dfqsa6hoc/image/upload/v1779533121/PhotoshopExtension_Image-removebg-preview_pbe76a.png" alt="logo name"
                  className=" h-20"
                  />
                </span>
              </div>
              {activePanel === "signin" ? (
                <>
                  <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                  <p className="text-blue-500 mb-6">Login to access your account</p>
                  <div className="space-y-2 text-sm text-blue-300">
                    <div className="flex items-center gap-2"><CheckCircle size={14} /> Manage bookings</div>
                    <div className="flex items-center gap-2"><CheckCircle size={14} /> Track service professionals</div>
                    <div className="flex items-center gap-2"><CheckCircle size={14} /> Get exclusive offers</div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-2">Join us today!</h2>
                  <p className="text-blue-800 mb-6">Create your account in seconds</p>
                  <div className="space-y-2 text-sm text-blue-500">
                    <div className="flex items-center gap-2"><CheckCircle size={14} /> Book trusted professionals</div>
                    <div className="flex items-center gap-2"><CheckCircle size={14} /> Pay after service</div>
                    <div className="flex items-center gap-2"><CheckCircle size={14} /> 24/7 customer support</div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => togglePanel(activePanel === "signin" ? "signup" : "signin")}
              className="mt-4 text-sm font-medium text-gray-500 hover:text-blue-800 transition-colors"
            >
              {activePanel === "signin" ? "Don't have an account? Sign Up →" : "Already have an account? Sign In →"}
            </button>
          </div>

          {/* RIGHT PANEL - Forms */}
          <div className="w-full md:w-3/5 p-6 md:p-8 bg-white">
            {generalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={16} />
                <span>{generalError}</span>
              </div>
            )}

            {activePanel === "signin" ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
                <InputField
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  error={fieldErrors.emailLogin}
                />
                <PasswordInput
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  placeholder="Password"
                  show={showLoginPassword}
                  toggleShow={() => setShowLoginPassword(!showLoginPassword)}
                  error={fieldErrors.passwordLogin}
                />
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-blue-600 hover:text-blue-700">Forgot password?</button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sign In"}
                  {!loading && <ArrowRight size={16} />}
                </button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">Or continue with</span></div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </button>
                
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    icon={User}
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={fieldErrors.firstName}
                  />
                  <InputField
                    icon={User}
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={fieldErrors.lastName}
                  />
                </div>
                <InputField
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={emailReg}
                  onChange={(e) => setEmailReg(e.target.value)}
                  error={fieldErrors.emailReg}
                />
                <InputField
                  icon={Phone}
                  type="tel"
                  placeholder="Mobile number (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={fieldErrors.phone}
                />
                <PasswordInput
                  value={passwordReg}
                  onChange={(e) => setPasswordReg(e.target.value)}
                  placeholder="Password (min 8 characters)"
                  show={showRegPassword}
                  toggleShow={() => setShowRegPassword(!showRegPassword)}
                  error={fieldErrors.passwordReg}
                />
                {passwordReg && (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${passwordStrength.score <= 2 ? "w-1/3 bg-red-500" : passwordStrength.score <= 4 ? "w-2/3 bg-yellow-500" : "w-full bg-green-500"}`} />
                      </div>
                      <span className="text-xs text-gray-500">{passwordStrength.message}</span>
                    </div>
                  </div>
                )}
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  show={showConfirmPassword}
                  toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={fieldErrors.confirmPassword}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sign Up"}
                  {!loading && <ArrowRight size={16} />}
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">Or sign up with</span></div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </button>
                 
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Login;