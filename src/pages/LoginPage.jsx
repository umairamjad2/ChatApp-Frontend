import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    login(currState === "Sign up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#0a0614] overflow-hidden">
      {/* Premium Blurred Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "url('/bgImage.svg')" }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-8 w-full max-w-[420px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Logo Section */}
        <div className="flex justify-center">
          <div className="relative group flex flex-row items-center gap-4 sm:gap-5 cursor-default">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-500/40 blur-[40px] rounded-full group-hover:bg-violet-500/60 group-hover:w-40 transition-all duration-700" />
            
            {/* 3D App Icon */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 rounded-[1rem] sm:rounded-[1.2rem] flex flex-shrink-0 items-center justify-center shadow-[0_8px_32px_-4px_rgba(139,92,246,0.5)] transform group-hover:-translate-y-1 group-hover:shadow-[0_16px_40px_-4px_rgba(139,92,246,0.6)] transition-all duration-300 border border-white/20 z-10">
              {/* Inner glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[1rem] sm:rounded-[1.2rem]" />
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white/10 drop-shadow-md z-10" strokeWidth={2.5} />
              {/* Online indicator dot */}
              <div className="absolute top-[-2px] right-[-2px] sm:top-[-3px] sm:right-[-3px] w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#150f22] rounded-full flex items-center justify-center z-20">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
              </div>
            </div>

            {/* Premium Typography */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-0.5 group-hover:scale-[1.02] transition-transform duration-300 z-10">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm">Quick</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-violet-400 to-fuchsia-500 drop-shadow-sm">Chat</span>
            </h1>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#150f22]/80 backdrop-blur-2xl text-white border border-white/5 p-8 flex flex-col gap-6 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] w-full relative overflow-hidden">
          {/* Subtle shine effect on top edge */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-3xl tracking-tight text-white mb-1">
                {currState === "Sign up" ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-white/40 text-[14px]">
                {currState === "Sign up" ? "Sign up to get started" : "Please enter your details to sign in"}
              </p>
            </div>
            
            {isDataSubmitted && (
              <button 
                type="button"
                onClick={() => setIsDataSubmitted(false)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all group"
              >
                <img src={assets.arrow_icon} alt="Back" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
            
            {/* Full Name Input */}
            {currState === "Sign up" && !isDataSubmitted && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-violet-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-6 py-4 bg-[#251e36] border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-[#2a223e] text-white placeholder:text-white/30 text-[15px] transition-all"
                  placeholder="Full Name"
                />
              </div>
            )}

            {!isDataSubmitted && (
              <>
                {/* Email Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-violet-400 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-6 py-4 bg-[#251e36] border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-[#2a223e] text-white placeholder:text-white/30 text-[15px] transition-all"
                    placeholder="Email Address"
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-violet-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-4 bg-[#251e36] border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-[#2a223e] text-white placeholder:text-white/30 text-[15px] transition-all"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}

            {/* Bio Input */}
            {currState === "Sign up" && isDataSubmitted && (
              <div className="relative group">
                <textarea
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-[#251e36] border border-white/5 rounded-2xl focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-[#2a223e] text-white placeholder:text-white/30 text-[15px] transition-all resize-none custom-scrollbar"
                  placeholder="Tell us a little bit about yourself..."
                />
              </div>
            )}

            {/* Terms Checkbox */}
            <label className="flex items-center gap-3 mt-1 cursor-pointer group">
              <div className="relative flex items-center justify-center flex-shrink-0">
                <input 
                  type="checkbox" 
                  required
                  className="peer appearance-none w-5 h-5 bg-[#251e36] border border-white/10 rounded-lg checked:bg-violet-500 checked:border-violet-500 transition-all cursor-pointer" 
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 5.5L4.5 8.5L10.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[13px] text-white/50 leading-snug group-hover:text-white/70 transition-colors">
                I agree to the <span className="text-violet-400 hover:text-violet-300 transition-colors">terms of use</span> & <span className="text-violet-400 hover:text-violet-300 transition-colors">privacy policy</span>.
              </p>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full relative group overflow-hidden bg-[#251e36] rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
              <div className="relative px-6 py-4 font-semibold text-white tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all group-active:scale-[0.98]">
                {currState === "Sign up" ? "Create Account" : "Sign In"}
              </div>
            </button>

            {/* Toggle Login/Signup */}
            <div className="mt-4 text-center">
              <p className="text-[14px] text-white/50">
                {currState === "Sign up" ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCurrState(currState === "Sign up" ? "Login" : "Sign up");
                    setIsDataSubmitted(false);
                  }}
                  className="font-medium text-violet-400 hover:text-violet-300 transition-colors focus:outline-none focus:underline"
                >
                  {currState === "Sign up" ? "Log in here" : "Sign up now"}
                </button>
              </p>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
