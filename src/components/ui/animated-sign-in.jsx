import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Github,
  Twitter,
  Linkedin,
  Sun,
  Moon,
} from "lucide-react";

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
                <button className="asi-social-button github">
                  <Github size={18} />
                </button>
                <button className="asi-social-button twitter">
                  <Twitter size={18} />
                </button>
                <button className="asi-social-button linkedin">
                  <Linkedin size={18} />
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

      <style jsx>{`
        .asi-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg, #f8fafc);
          color: var(--text, #0f172a);
          overflow: hidden;
          padding: 2rem 1rem;
        }

        .asi-particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .asi-theme-toggle {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--surface, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .asi-theme-toggle:hover {
          transform: scale(1.1);
        }

        .asi-login-card {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 440px;
          background: var(--surface, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.04);
          backdrop-filter: blur(16px);
          transition: all 0.3s ease;
        }

        .asi-login-card-inner {
          padding: 2.5rem 2rem;
        }

        .asi-login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .asi-login-header h1 {
          font-size: 1.85rem;
          font-weight: 900;
          color: var(--text, #0f172a);
          margin: 0 0 0.4rem 0;
        }

        .asi-login-header p {
          color: var(--muted, #64748b);
          font-size: 0.9rem;
          margin: 0;
        }

        .asi-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .asi-form-field {
          position: relative;
          width: 100%;
        }

        .asi-form-field input {
          width: 100%;
          height: 52px;
          padding: 16px 16px 4px;
          border-radius: 12px;
          border: 1px solid var(--border, #cbd5e1);
          background: var(--surface-soft, #f8fafc);
          color: var(--text, #0f172a);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .asi-form-field label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted, #64748b);
          font-size: 0.9rem;
          pointer-events: none;
          transition: all 0.2s ease;
        }

        .asi-form-field.active label,
        .asi-form-field input:focus ~ label {
          top: 12px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #2563eb;
        }

        .asi-form-field input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .asi-form-field.invalid input {
          border-color: #ef4444;
        }

        .asi-error-message {
          font-size: 0.75rem;
          color: #ef4444;
          margin-top: 4px;
          display: block;
        }

        .asi-toggle-password {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted, #64748b);
          cursor: pointer;
        }

        .asi-form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .asi-remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--muted, #64748b);
        }

        .asi-forgot-password {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }

        .asi-login-button {
          height: 48px;
          border-radius: 12px;
          background: #2563eb;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
          transition: all 0.2s ease;
        }

        .asi-login-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .asi-separator {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: var(--muted, #94a3b8);
          font-size: 0.8rem;
        }

        .asi-separator::before,
        .asi-separator::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .asi-separator span {
          padding: 0 12px;
        }

        .asi-social-login {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .asi-social-button {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: 1px solid var(--border, #e2e8f0);
          background: var(--surface, #ffffff);
          color: var(--text, #0f172a);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .asi-social-button:hover {
          border-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .asi-signup-prompt {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.88rem;
          color: var(--muted, #64748b);
        }

        .asi-signup-prompt a {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export { AnimatedSignIn };
export default AnimatedSignIn;
