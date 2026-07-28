import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/hustlr-cafe-hero.png";

/* ── Scroll Reveal Hook ── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Reveal Wrapper ── */
function Reveal({ children, className = "", delay = 0, direction = "" }) {
  const ref = useScrollReveal();
  const dirClass = direction === "left" ? "fade-left" : direction === "right" ? "fade-right" : "";
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${dirClass} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ── Data ── */
const ROLES = [
  {
    key: "student",
    cls: "student-role",
    icon: "🎓",
    title: "For Students",
    desc: "Discover flexible part-time shifts near your campus. Apply instantly & build your career.",
    features: ["Smart Job Feed", "One-Tap Apply", "Digital Wallet", "Reputation Index", "GPS Attendance"],
  },
  {
    key: "business",
    cls: "business-role",
    icon: "🏪",
    title: "For Business Owners",
    desc: "Post shifts and find verified student workforce ready to work within hours.",
    features: ["Post a Shift", "Applicant Manager", "Location Picker", "Business Wallet", "Payouts Dashboard"],
  },
  {
    key: "admin",
    cls: "admin-role",
    icon: "🛡️",
    title: "Platform Admin",
    desc: "Moderate registrations, verify documents, manage settlements, and keep the platform safe.",
    features: ["Registration Verification", "Listing Moderation", "Payment Settlements", "Audit Logs"],
  },
];

const FEATURES = [
  {
    icon: "📍",
    title: "GPS Geofenced Attendance",
    desc: "Students can only clock in when they're within 100 meters of the shift location. No proxy, no time-theft — guaranteed authentic attendance via Haversine distance checks.",
    tag: "Anti-Fraud",
    bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    color: "#10b981",
  },
  {
    icon: "🔒",
    title: "Secure Match Transactions",
    desc: "When a shift is accepted, our system runs conflict-free database transactions to ensure vacancy counts stay accurate — even when multiple businesses approve candidates simultaneously.",
    tag: "Real-Time Safe",
    bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    color: "#2563eb",
  },
  {
    icon: "💬",
    title: "Live Chat Room",
    desc: "Instant private chat unlocks the moment a business accepts a student's application. Coordinate shift details, share instructions, and stay connected in real-time.",
    tag: "Instant Connect",
    bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
    color: "#8b5cf6",
  },
  {
    icon: "💳",
    title: "Wallet & Payment Settlements",
    desc: "Students and businesses get secure digital wallets. Earnings are calculated based on verified hours and deposited directly — transparent, instant, and hassle-free.",
    tag: "Instant Payout",
    bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    color: "#f59e0b",
  },
  {
    icon: "📄",
    title: "Verified Document Uploads",
    desc: "Aadhaar, PAN, college IDs, and business licenses are uploaded securely via Cloudinary and verified by admin moderators before account activation.",
    tag: "Trust Layer",
    bg: "linear-gradient(135deg, #fef2f2, #fecaca)",
    color: "#ef4444",
  },
  {
    icon: "🌐",
    title: "Multi-Lingual Help Center",
    desc: "Toggle between English, Hindi, and local languages in our comprehensive FAQ & help portal. Designed to be accessible for every user across India.",
    tag: "Accessible",
    bg: "linear-gradient(135deg, #f0fdfa, #ccfbf1)",
    color: "#14b8a6",
  },
];

const STEPS = [
  { num: "1", icon: "✍️", title: "Sign Up", desc: "Create your student or business account in under 2 minutes." },
  { num: "2", icon: "🔍", title: "Browse / Post", desc: "Students browse shifts. Businesses post vacancies with pay & location." },
  { num: "3", icon: "🤝", title: "Get Matched", desc: "Apply or accept candidates. Chat unlocks instantly upon match." },
  { num: "4", icon: "💰", title: "Work & Get Paid", desc: "Clock in via GPS, complete the shift, and get paid to your wallet." },
];

const TESTIMONIALS = [
  {
    name: "Aman Sharma",
    role: "B.Com Student, Delhi University",
    quote: "Shiftlyin helped me find a weekend barista gig at a café just 10 minutes from my college. I earned ₹12,000 in my first month without missing a single class!",
    stars: 5,
    avatar: "AS",
    color: "#10b981",
  },
  {
    name: "Rajesh Mehra",
    role: "Owner, Mehra's Kitchen",
    quote: "Finding reliable part-time staff used to take days. With Shiftlyin, I post a shift and get verified candidates within hours. The GPS attendance feature is a game-changer.",
    stars: 5,
    avatar: "RM",
    color: "#f59e0b",
  },
  {
    name: "Priya Patel",
    role: "MBA Student, NMIMS Mumbai",
    quote: "The wallet system makes payments so smooth — no more chasing shop owners for my daily earnings. Plus, my reputation score unlocked higher-paying shifts!",
    stars: 5,
    avatar: "PP",
    color: "#8b5cf6",
  },
];

const BRANDS = ["Café Coffee Day", "Domino's", "Barista", "McDonald's", "Zomato", "Swiggy", "Radisson Hotels"];

/* ════════════════════════════════════════
   HOME COMPONENT
   ════════════════════════════════════════ */
export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="landing-page">
      {/* ═══ HERO ═══ */}
      <section className="landing-hero" id="hero">
        <div className="hero-content-wrapper">
          <div className="hero-text-col">
            <span className="hero-badge">🚀 India's #1 Student Shift Platform</span>

            <h1 className="hero-title">
              Earn While You{" "}
              <span className="gradient-word">Learn</span>
            </h1>

            <p className="hero-subtitle">
              Shiftlyin connects college students with local businesses for flexible hourly shifts.
              Find part-time jobs near your campus, build your skills, and get paid instantly.
            </p>

            <div className="hero-cta-row">
              <Link to="/register" className="hero-cta student">🎓 I'm a Student</Link>
              <Link to="/register" className="hero-cta business">🏪 I'm a Business</Link>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat">
                <strong>5,000+</strong>
                <span>Verified Students</span>
              </div>
              <div className="hero-stat">
                <strong>500+</strong>
                <span>Local Businesses</span>
              </div>
              <div className="hero-stat">
                <strong>1,000+</strong>
                <span>Shifts Completed</span>
              </div>
            </div>
          </div>

          <div className="hero-img-col">
            <img
              src={heroImage}
              alt="Student working at a café — Shiftlyin platform"
              loading="eager"
              width="480"
              height="360"
            />
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED BRANDS CAROUSEL ═══ */}
      <div className="logo-track-wrap">
        <div className="logo-track">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span className="logo-track-item" key={i}>{b}</span>
          ))}
        </div>
      </div>

      {/* ═══ THREE ROLES ═══ */}
      <section className="landing-section" id="features">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-eyebrow">Who Is It For?</span>
            <h2 className="section-heading">Built for Everyone in the Ecosystem</h2>
            <p className="section-desc" style={{ margin: "0.75rem auto 0" }}>
              Whether you're a student looking for flexible work, a business needing reliable staff, or an admin managing the platform — Shiftlyin has you covered.
            </p>
          </div>
        </Reveal>

        <div className="roles-grid">
          {ROLES.map((role, i) => (
            <Reveal key={role.key} delay={i * 120}>
              <div className={`role-card ${role.cls}`}>
                <div className="role-icon">{role.icon}</div>
                <h3>{role.title}</h3>
                <p>{role.desc}</p>
                <ul className="role-features">
                  {role.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS — CORE FEATURES ═══ */}
      <section className="landing-section" id="how-it-works" style={{ background: "var(--surface-soft)", borderRadius: "32px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-eyebrow">Core Technology</span>
            <h2 className="section-heading">How Shiftlyin Works Under the Hood</h2>
            <p className="section-desc" style={{ margin: "0.75rem auto 0" }}>
              Enterprise-grade technology powering every shift — from location verification to instant payouts.
            </p>
          </div>
        </Reveal>

        <div className="features-list">
          {FEATURES.map((feat, i) => (
            <Reveal key={feat.title} direction={i % 2 === 0 ? "left" : "right"}>
              <div className={`feature-block ${i % 2 !== 0 ? "reverse" : ""}`}>
                <div className="feature-icon-box">
                  <div
                    className="feature-icon-visual"
                    style={{ background: feat.bg, color: feat.color }}
                  >
                    {feat.icon}
                  </div>
                </div>
                <div className="feature-text">
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                  <span className="feature-tag">⚡ {feat.tag}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ STEP-BY-STEP PROCESS ═══ */}
      <section className="landing-section" id="students">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-eyebrow">Getting Started</span>
            <h2 className="section-heading">From Sign Up to Payday in 4 Steps</h2>
          </div>
        </Reveal>

        <div className="steps-track">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 150}>
              <div className="step-item">
                <div className="step-number">{s.icon}</div>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="landing-section" id="businesses">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-eyebrow">Real Stories</span>
            <h2 className="section-heading">Loved by Students & Businesses</h2>
          </div>
        </Reveal>

        <div className="testimonials-track">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <div className="testimonial-card">
                <div className="testimonial-stars">
                  {"★".repeat(t.stars)}
                </div>
                <blockquote>"{t.quote}"</blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="landing-section">
        <Reveal>
          <div className="cta-banner">
            <h2>Ready to Start Earning?</h2>
            <p>
              Join thousands of students and businesses already using Shiftlyin.
              Sign up in 2 minutes — no fees, no commitments.
            </p>
            <div className="cta-btns">
              <Link to="/register" className="hero-cta student">🎓 Student Sign Up</Link>
              <Link to="/register" className="hero-cta business">🏪 Business Sign Up</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer" id="contact">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <strong style={{ color: "#fff", fontSize: "1.2rem" }}>Shiftlyin</strong>
              <p>India's first student shift platform. Connecting campus talent with local businesses for flexible, verified part-time work.</p>
              <div className="footer-social">
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="GitHub">⌨</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>For Students</h4>
              <ul>
                <li><Link to="/register">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/help">Help Center</Link></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>For Businesses</h4>
              <ul>
                <li><Link to="/register">Register Business</Link></li>
                <li><Link to="/login">Business Login</Link></li>
                <li><a href="#features">Features</a></li>
                <li><Link to="/help">Support</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#hero">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Shiftlyin. All rights reserved.</span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
