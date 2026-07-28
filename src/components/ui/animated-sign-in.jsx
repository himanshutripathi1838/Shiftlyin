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
    </div>
  );
};

export { AnimatedSignIn };
export default AnimatedSignIn;
