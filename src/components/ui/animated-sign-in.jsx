import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";

const AnimatedSignIn = ({
  title = "Welcome Back",
  subtitle = "Please sign in to continue",
  onLogin,
  isRegisterPrompt = true,
  onRegisterClick,
  className = "",
  children
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Email validation
  const validateEmail = (emailStr) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(emailStr).toLowerCase());
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val) {
      setIsEmailValid(validateEmail(val));
    } else {
      setIsEmailValid(true);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    if (email && password && validateEmail(email)) {
      onLogin?.({ email, password, rememberMe });
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Initialize theme based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Create particle animation canvas
  useEffect(() => {
    const canvas = document.getElementById("animated-particles-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.25})`
          : `rgba(37, 99, 235, ${Math.random() * 0.25})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    const particleCount = Math.min(
      90,
      Math.floor((canvas.width * canvas.height) / 16000)
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animId;
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animId);
    };
  }, [isDarkMode]);

  return (
    <div className={`asi-container ${isDarkMode ? "dark" : "light"} ${className}`}>
      <canvas id="animated-particles-canvas" className="asi-particles-canvas" />

      <div className="asi-theme-toggle" onClick={toggleDarkMode} title="Toggle theme">
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="asi-login-card">
        <div className="asi-login-card-inner">
          <div className="asi-login-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {children ? (
            children
          ) : (
            <form className="asi-login-form" onSubmit={handleSubmit}>
              <div
                className={`asi-form-field ${
                  isEmailFocused || email ? "active" : ""
                } ${!isEmailValid && email ? "invalid" : ""}`}
              >
                <input
                  type="email"
                  id="asi-email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                />
                <label htmlFor="asi-email">Email Address</label>
                {!isEmailValid && email && (
                  <span className="asi-error-message">
                    Please enter a valid email
                  </span>
                )}
              </div>

              <div
                className={`asi-form-field ${
                  isPasswordFocused || password ? "active" : ""
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="asi-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                />
                <label htmlFor="asi-password">Password</label>
                <button
                  type="button"
                  className="asi-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="asi-form-options">
                <label className="asi-remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="asi-checkmark"></span>
                  Remember me
                </label>

                <a href="#" className="asi-forgot-password">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="asi-login-button"
                disabled={
                  isFormSubmitted && (!email || !password || !isEmailValid)
                }
              >
                Sign In
              </button>
            </form>
          )}

          {!children && (
            <>
              <div className="asi-separator">
                <span>or continue with</span>
              </div>

              <div className="asi-social-login">
                <button type="button" className="asi-social-button github" aria-label="Sign in with GitHub">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </button>
                <button type="button" className="asi-social-button twitter" aria-label="Sign in with Twitter">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/></svg>
                </button>
                <button type="button" className="asi-social-button linkedin" aria-label="Sign in with LinkedIn">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </button>
              </div>

              {isRegisterPrompt && (
                <p className="asi-signup-prompt">
                  Don't have an account?{" "}
                  <a href="/register" onClick={onRegisterClick}>
                    Sign up
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { AnimatedSignIn };
export default AnimatedSignIn;
