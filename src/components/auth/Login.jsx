import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { setShowAuth, register, login } = useAuth();
  const [activePanel, setActivePanel] = useState("signin");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordReg, setPasswordReg] = useState("");

  // Login fields
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    setFieldErrors({});
  }, [firstName, lastName, emailReg, phone, passwordReg, emailLogin, passwordLogin, activePanel]);

  const togglePanel = (panel) => {
    setActivePanel(panel);
    setError("");
    setFieldErrors({});
  };

  const bgImage = "https://www.serviceonwheel.com/images/banner-clean.png";

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !emailReg || !phone || !passwordReg) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    setFieldErrors({});
    try {
      await register({ firstName, lastName, email: emailReg, phone, password: passwordReg });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailLogin || !passwordLogin) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(emailLogin, passwordLogin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full fixed z-[2000] flex items-center justify-center p-4 font-sans overflow-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl border flex flex-col md:flex-row overflow-auto">
        {/* Left Panel */}
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

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col justify-center bg-white">
          {error && (
            <div className="mb-2 text-red-600 text-xs text-center bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          {activePanel === "signin" ? (
            <form onSubmit={handleLogin} className="animate-fadeIn">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Sign In</h2>
              <div className="space-y-2 md:space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <form onSubmit={handleRegister} className="animate-fadeIn">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-500">or use your email for registration</span></div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <input type="email" placeholder="Email" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <input type="password" placeholder="Password" value={passwordReg} onChange={(e) => setPasswordReg(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                </div>
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