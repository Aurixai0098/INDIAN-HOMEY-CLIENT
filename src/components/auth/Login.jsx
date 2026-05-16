import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

// Inline SVG Icons (No extra dependency needed)
const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const PhoneIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

const Login = () => {
  const { setShowAuth, register, login, forgotPassword } = useAuth(); // forgotPassword API se connect karna
  
  // Panels: 'signin' | 'signup' | 'forgot'
  const [activePanel, setActivePanel] = useState("signin");

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Login fields
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Auto clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear errors on input change
  useEffect(() => {
    setFieldErrors({});
    setError("");
  }, [firstName, lastName, emailReg, phone, passwordReg, confirmPassword, emailLogin, passwordLogin, forgotEmail, activePanel]);

  const togglePanel = (panel) => {
    setActivePanel(panel);
    setError("");
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowLoginPassword(false);
    setForgotSent(false);
    setForgotEmail("");
  };

  const bgImage = "https://www.serviceonwheel.com/images/banner-clean.png";

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(passwordReg);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-blue-500", "bg-green-500"];

  const validateRegister = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!emailReg.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailReg)) errors.email = "Invalid email format";
    if (!phone.trim()) errors.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Valid 10-digit Indian number required";
    if (!passwordReg) errors.password = "Password is required";
    else if (passwordReg.length < 8) errors.password = "Min 8 characters";
    if (passwordReg !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLogin = () => {
    const errors = {};
    if (!emailLogin.trim()) errors.emailLogin = "Email is required";
    if (!passwordLogin) errors.passwordLogin = "Password is required";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    
    setLoading(true);
    setError("");
    try {
      await register({ firstName, lastName, email: emailReg, phone, password: passwordReg });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    setError("");
    try {
      await login(emailLogin, passwordLogin, rememberMe);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setFieldErrors({ forgotEmail: "Please enter a valid email" });
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      // API call — apna forgotPassword function yahan use karo
      if (forgotPassword) {
        await forgotPassword(forgotEmail);
      }
      setForgotSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  // Input wrapper with icon
  const InputField = ({ icon: Icon, type, placeholder, value, onChange, error, name, rightElement }) => (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-${rightElement ? '12' : '4'} py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
          error ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
        }`}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen w-full fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto bg-gray-900/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-scaleIn">
        
        {/* Close Button */}
        <button 
          onClick={() => setShowAuth(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 transition-all shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Left Panel */}
        <div
          className="w-full md:w-5/12 relative flex flex-col justify-center items-center text-white p-8 md:p-10 min-h-[200px] md:min-h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-[2px]"></div>
          
          <div className="relative z-10 text-center w-full max-w-xs">
            {activePanel === "forgot" ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                  <LockIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Reset Password</h1>
                <p className="mb-6 text-sm text-gray-300 leading-relaxed">Enter your email and we'll send you a link to reset your password.</p>
                <button onClick={() => togglePanel("signin")} className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                  <ArrowLeftIcon className="h-4 w-4" /> Back to Sign In
                </button>
              </>
            ) : activePanel === "signin" ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Welcome Back!</h1>
                <p className="mb-8 text-sm text-gray-300 leading-relaxed">Don't have an account? Start your journey with us today.</p>
                <button 
                  onClick={() => togglePanel("signup")} 
                  className="w-full border-2 border-white/30 bg-white/10 backdrop-blur text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg"
                >
                  CREATE ACCOUNT
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                  <CheckIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Hello, Friend!</h1>
                <p className="mb-8 text-sm text-gray-300 leading-relaxed">Already have an account? Sign in to access your dashboard.</p>
                <button 
                  onClick={() => togglePanel("signin")} 
                  className="w-full border-2 border-white/30 bg-white/10 backdrop-blur text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg"
                >
                  SIGN IN
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-center bg-white">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 animate-shake">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* FORGOT PASSWORD PANEL */}
          {activePanel === "forgot" && (
            <div className="animate-fadeIn max-w-md mx-auto w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
              <p className="text-sm text-gray-500 mb-6">No worries, we'll send you reset instructions.</p>
              
              {forgotSent ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                  <p className="text-sm text-gray-500 mb-6">We sent a password reset link to {forgotEmail}</p>
                  <button 
                    onClick={() => togglePanel("signin")}
                    className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <InputField
                    icon={MailIcon}
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    error={fieldErrors.forgotEmail}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg text-sm disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-b-transparent animate-spin"></div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SIGN IN PANEL */}
          {activePanel === "signin" && (
            <form onSubmit={handleLogin} className="animate-fadeIn max-w-md mx-auto w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <p className="text-sm text-gray-500 mt-1">Please enter your details to continue</p>
              </div>
              
              <div className="space-y-4">
                <InputField
                  icon={MailIcon}
                  type="email"
                  placeholder="Email Address"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  error={fieldErrors.emailLogin}
                />
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <LockIcon className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
                      fieldErrors.passwordLogin ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showLoginPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                  {fieldErrors.passwordLogin && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.passwordLogin}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                      <CheckIcon className="absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => togglePanel("forgot")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-200 text-sm disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-b-transparent animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => togglePanel("signup")} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SIGN UP PANEL */}
          {activePanel === "signup" && (
            <form onSubmit={handleRegister} className="animate-fadeIn max-w-md mx-auto w-full">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    icon={UserIcon}
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={fieldErrors.firstName}
                  />
                  <InputField
                    icon={UserIcon}
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={fieldErrors.lastName}
                  />
                </div>

                <InputField
                  icon={MailIcon}
                  type="email"
                  placeholder="Email Address"
                  value={emailReg}
                  onChange={(e) => setEmailReg(e.target.value)}
                  error={fieldErrors.email}
                />

                <InputField
                  icon={PhoneIcon}
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={fieldErrors.phone}
                />

                {/* Password with strength */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <LockIcon className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min 8 chars)"
                    value={passwordReg}
                    onChange={(e) => setPasswordReg(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
                      fieldErrors.password ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                  {fieldErrors.password && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.password}</p>}
                  
                  {/* Strength Meter */}
                  {passwordReg && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1.5 mb-1">
                        {[1,2,3,4].map((level) => (
                          <div 
                            key={level} 
                            className={`flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Strength: <span className={`font-semibold ${passwordStrength > 0 ? 'text-gray-700' : ''}`}>
                          {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too short'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <LockIcon className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
                      fieldErrors.confirmPassword ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                  {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.confirmPassword}</p>}
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <div className="relative mt-0.5">
                    <input type="checkbox" className="peer sr-only" required />
                    <div className="h-4 w-4 rounded border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                    <CheckIcon className="absolute inset-0 m-auto h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    I agree to the <span className="text-blue-600 font-medium cursor-pointer hover:underline">Terms of Service</span> and <span className="text-blue-600 font-medium cursor-pointer hover:underline">Privacy Policy</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-200 text-sm disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-b-transparent animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => togglePanel("signin")} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes scaleIn { 
          from { opacity: 0; transform: scale(0.96); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
};

export default Login;