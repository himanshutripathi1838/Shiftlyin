import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/hustlr-cafe-hero.png";
import fullLogoImg from "../../assets/shiftlyin-full-logo.png";
import LogoCloud from "@/components/ui/logo-cloud-15";

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
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ── Static Data ── */
const BRANDS = ["Café Coffee Day", "Domino's", "Barista", "McDonald's", "Zomato", "Swiggy", "Radisson"];

const INDIAN_CITIES = [
  "Delhi NCR", "Noida", "Gurgaon", "Faridabad", "Ghaziabad",
  "Mumbai", "Pune", "Thane", "Navi Mumbai", "Nagpur", "Nashik",
  "Bangalore", "Mysuru", "Hubli",
  "Hyderabad", "Warangal",
  "Chennai", "Coimbatore", "Madurai",
  "Kolkata", "Howrah", "Siliguri",
  "Ahmedabad", "Surat", "Vadodara", "Rajkot",
  "Jaipur", "Jodhpur", "Udaipur", "Kota",
  "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Bareilly", "Gorakhpur",
  "Indore", "Bhopal", "Gwalior", "Jabalpur",
  "Chandigarh", "Mohali", "Panchkula", "Ludhiana", "Amritsar", "Jalandhar",
  "Patna", "Gaya", "Muzaffarpur",
  "Ranchi", "Jamshedpur", "Dhanbad",
  "Bhubaneswar", "Cuttack",
  "Guwahati", "Dehradun", "Shimla", "Jammu", "Kochi", "Trivandrum", "Raipur", "Goa"
];

const STEPS = [
  { num: "1", icon: "👤", title: "Register", desc: "Sign up as a Student or Business." },
  { num: "2", icon: "🛡️", title: "Get Verified", desc: "Our team verifies your account." },
  { num: "3", icon: "💼", title: "Find or Post Jobs", desc: "Students find jobs. Businesses post jobs." },
  { num: "4", icon: "✈️", title: "Apply & Connect", desc: "Students apply. Businesses review." },
  { num: "5", icon: "💬", title: "Chat & Coordinate", desc: "Once accepted, chat opens." },
  { num: "6", icon: "📍", title: "Work & Earn", desc: "Check-in, complete work & get paid." },
];

const WHY_FEATURES = [
  { icon: "🛡️", title: "Verified Users", desc: "Every student and business is verified." },
  { icon: "📍", title: "GPS Attendance", desc: "Check-in and check-out with location." },
  { icon: "💬", title: "Real-time Chat", desc: "Communicate easily within the platform." },
  { icon: "📌", title: "Nearby Jobs", desc: "Find jobs near your location." },
  { icon: "⭐", title: "Ratings & Reviews", desc: "Build reputation with ratings." },
  { icon: "💳", title: "Secure Payments", desc: "Future-ready wallet and payments." },
];

const CATEGORIES = [
  { emoji: "🍳", label: "Restaurant" },
  { emoji: "☕", label: "Cafe" },
  { emoji: "🏨", label: "Hotel" },
  { emoji: "🛍️", label: "Retail" },
  { emoji: "🛵", label: "Delivery" },
  { emoji: "🎉", label: "Events" },
  { emoji: "📁", label: "Office Work" },
  { emoji: "📚", label: "Tutoring" },
];

const FAQS = [
  { q: "How do I register on Shiftlyin?", a: "Click 'Register', choose your role (Student or Business), fill in your details and upload verification documents. Our team will verify your profile within 24 hours." },
  { q: "Is Shiftlyin free to use?", a: "Shiftlyin is 100% free for students! Businesses pay a nominal settlement commission only on completed shifts." },
  { q: "How does verification work?", a: "We verify student IDs, Aadhaar/PAN, and business licenses via secure admin checks to keep the platform safe." },
  { q: "How does GPS attendance work?", a: "Students can clock in only when within 100 meters of the shift location verified by real-time geolocation checks." },
  { q: "How will I get paid?", a: "Earnings are credited directly to your Shiftlyin digital wallet after shift approval, which you can transfer to your bank account anytime." },
  { q: "Can I work in multiple jobs?", a: "Yes! Students can apply for and work multiple part-time shifts as long as the shift schedules do not overlap." },
];

const STUDENT_REVIEWS = [
  { name: "Rohit Sharma", title: "BCA Student", rating: 5, avatar: "RS", color: "#2563eb", quote: "Shiftlyin helped me find part-time work that fits my class schedule perfectly. The platform is easy to use and very reliable." },
  { name: "Priya Patel", title: "MBA Student", rating: 5, avatar: "PP", color: "#7c3aed", quote: "The wallet system and instant shift updates make earning so convenient while managing my studies." },
];

const BUSINESS_REVIEWS = [
  { name: "Amit Verma", title: "Restaurant Owner", rating: 5, avatar: "AV", color: "#f59e0b", quote: "We get verified and hardworking students within minutes. Shiftlyin has made hiring so simple and efficient for our restaurant." },
  { name: "Neha Gupta", title: "Retail Store Manager", rating: 5, avatar: "NG", color: "#16a34a", quote: "GPS clock-ins give complete transparency. Finding reliable staff for weekend rushes is now effortless." },
];

/* ════════════════════════════════════════
   HOME COMPONENT
   ════════════════════════════════════════ */
export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [studentIdx, setStudentIdx] = useState(0);
  const [bizIdx, setBizIdx] = useState(0);
  const [searchLocation, setSearchLocation] = useState("");
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const locationRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setIsLocDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    const term = searchLocation.trim().toLowerCase();
    if (!term) return INDIAN_CITIES;
    return INDIAN_CITIES.filter((c) => c.toLowerCase().includes(term));
  }, [searchLocation]);

  function detectCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSearchLocation("Nearby (Current GPS)");
        },
        () => setSearchLocation("Current Location")
      );
    }
  }

  return (
    <main className="landing-page">
      {/* ═══ 2. HERO SECTION ═══ */}
      <section className="hero-wrapper" id="hero">
        <div className="hero-grid">
          <div className="hero-text">
            <span className="hero-badge-pill">🎓 Earn While You Learn</span>

            <h1 className="hero-h1">
              Find Part-Time Jobs<br />Near You
            </h1>

            <p className="hero-p">
              Shiftlyin connects college students with trusted businesses for flexible, part-time opportunities.
            </p>

            <div className="hero-btns">
              <Link to="/register" className="btn-primary-blue">
                🔍 Find Jobs Near You
              </Link>
              <Link to="/register" className="btn-outline-dark">
                💼 Post a Job
              </Link>
            </div>

            <div className="hero-trust-row">
              <span className="trust-item"><span className="trust-check">✓</span> Verified Students</span>
              <span className="trust-item"><span className="trust-check">✓</span> Trusted Businesses</span>
              <span className="trust-item"><span className="trust-check">✓</span> Safe & Secure</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src={heroImage}
              alt="College students looking at a phone tablet"
              className="hero-img"
              loading="eager"
            />
            
            {/* 3 Cascading Floating Stat Cards */}
            <div className="float-stat-card students">
              <div className="float-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>👥</div>
              <div className="float-stat-info">
                <strong>5000+</strong>
                <span>Students</span>
              </div>
            </div>

            <div className="float-stat-card jobs">
              <div className="float-stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>📋</div>
              <div className="float-stat-info">
                <strong>1000+</strong>
                <span>Jobs Posted</span>
              </div>
            </div>

            <div className="float-stat-card biz">
              <div className="float-stat-icon" style={{ background: "#faf5ff", color: "#7c3aed" }}>🏪</div>
              <div className="float-stat-info">
                <strong>500+</strong>
                <span>Businesses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Rounded Search Bar */}
        <div className="hero-search-container" id="jobs">
          <form className="search-grid" onSubmit={(e) => e.preventDefault()}>
            <div className="search-field">
              <input type="text" placeholder="🔍 Search job title or keyword" />
            </div>
            <div className="search-field" style={{ position: "relative" }} ref={locationRef}>
              <input
                type="text"
                placeholder="📍 Type or Select Location..."
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  setIsLocDropdownOpen(true);
                }}
                onFocus={() => setIsLocDropdownOpen(true)}
              />
              <button
                type="button"
                onClick={detectCurrentLocation}
                title="Use Current GPS Location"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "4px 8px",
                  color: "#2563eb",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                📍 GPS
              </button>

              {isLocDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "105%",
                    left: 0,
                    right: 0,
                    maxHeight: "260px",
                    overflowY: "auto",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.2)",
                    zIndex: 999,
                    padding: "6px",
                    textAlign: "left"
                  }}
                >
                  <div
                    onClick={() => {
                      detectCurrentLocation();
                      setIsLocDropdownOpen(false);
                    }}
                    style={{
                      padding: "9px 12px",
                      fontSize: "0.83rem",
                      fontWeight: 800,
                      color: "#2563eb",
                      cursor: "pointer",
                      borderRadius: "8px",
                      background: "rgba(37, 99, 235, 0.08)",
                      marginBottom: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    📍 Use Current GPS Location
                  </div>

                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <div
                        key={city}
                        onClick={() => {
                          setSearchLocation(city);
                          setIsLocDropdownOpen(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--text)",
                          cursor: "pointer",
                          borderRadius: "8px",
                          transition: "background 0.15s"
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "var(--surface-soft)")}
                        onMouseLeave={(e) => (e.target.style.background = "transparent")}
                      >
                        📍 {city}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "10px 12px", fontSize: "0.82rem", color: "var(--muted)" }}>
                      Press search to use "{searchLocation}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="search-field">
              <select defaultValue="">
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.label} value={c.label.toLowerCase()}>{c.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-search-blue">
              Search Jobs →
            </button>
          </form>
        </div>
      </section>

      {/* ═══ 3. TRUSTED-BY LOGO STRIP ═══ */}
      <section id="trusted" className="w-full flex justify-center py-2">
        <Reveal className="w-full">
          <LogoCloud />
        </Reveal>
      </section>

      {/* ═══ 4. HOW SHIFTLYIN WORKS (6-STEP) ═══ */}
      <section className="land-section" id="how-it-works">
        <Reveal>
          <div className="land-center">
            <h2 className="land-heading">How Shiftlyin Works?</h2>
            <p className="land-subhead">Simple step-by-step process for students and business owners.</p>
          </div>
        </Reveal>

        <div className="steps-row">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="step-card-box">
                <div className="step-header">
                  <span className="step-badge">{s.num}</span>
                  <span className="step-icon-emoji">{s.icon}</span>
                </div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 5. WHY CHOOSE SHIFTLYIN? ═══ */}
      <section className="land-section" id="why-choose" style={{ background: "var(--surface-soft)", borderRadius: "24px" }}>
        <Reveal>
          <div className="land-center">
            <h2 className="land-heading">Why Choose Shiftlyin?</h2>
            <p className="land-subhead">Designed with security, speed, and reliability at its core.</p>
          </div>
        </Reveal>

        <div className="why-grid-layout">
          {WHY_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="why-feature-card">
                <div className="why-icon-badge">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 6. POPULAR CATEGORIES + IMPACT NUMBERS ═══ */}
      <section className="land-section">
        <Reveal>
          <div className="two-col-layout">
            <div>
              <h2 className="land-heading" style={{ fontSize: "1.35rem" }}>Popular Job Categories</h2>
              <div className="cat-chips-grid">
                {CATEGORIES.map((c) => (
                  <div className="cat-chip" key={c.label}>
                    <span className="cat-chip-icon">{c.emoji}</span>
                    <span className="cat-chip-name">{c.label}</span>
                  </div>
                ))}
              </div>
              <a href="#jobs" className="view-all-cats-link">View All Categories →</a>
            </div>

            <div>
              <h2 className="land-heading" style={{ fontSize: "1.35rem" }}>Our Impact in Numbers</h2>
              <div className="impact-blocks-grid">
                <div className="impact-block-card blue">
                  <strong>5000+</strong>
                  <span>Students</span>
                </div>
                <div className="impact-block-card green">
                  <strong>500+</strong>
                  <span>Businesses</span>
                </div>
                <div className="impact-block-card purple">
                  <strong>1000+</strong>
                  <span>Jobs Posted</span>
                </div>
                <div className="impact-block-card amber">
                  <strong>3000+</strong>
                  <span>Successful Hirings</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 7. TESTIMONIALS (TWO-COLUMN SPLIT) ═══ */}
      <section className="land-section">
        <Reveal>
          <div className="two-col-layout">
            {/* Student Testimonial */}
            <div>
              <h2 className="land-heading" style={{ fontSize: "1.25rem" }}>What Students Say</h2>
              <div className="testimonial-card-box">
                <div className="stars-row">
                  {"★".repeat(STUDENT_REVIEWS[studentIdx].rating)}
                </div>
                <blockquote>"{STUDENT_REVIEWS[studentIdx].quote}"</blockquote>
                <div className="test-user-row">
                  <div className="test-user-info">
                    <div className="test-avatar-circle" style={{ background: STUDENT_REVIEWS[studentIdx].color }}>
                      {STUDENT_REVIEWS[studentIdx].avatar}
                    </div>
                    <div>
                      <strong>— {STUDENT_REVIEWS[studentIdx].name}</strong>
                      <span>{STUDENT_REVIEWS[studentIdx].title}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setStudentIdx((p) => (p === 0 ? STUDENT_REVIEWS.length - 1 : p - 1))}
                      style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", width: "30px", height: "30px" }}
                    >‹</button>
                    <button
                      onClick={() => setStudentIdx((p) => (p + 1) % STUDENT_REVIEWS.length)}
                      style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", width: "30px", height: "30px" }}
                    >›</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Testimonial */}
            <div>
              <h2 className="land-heading" style={{ fontSize: "1.25rem" }}>What Businesses Say</h2>
              <div className="testimonial-card-box">
                <div className="stars-row">
                  {"★".repeat(BUSINESS_REVIEWS[bizIdx].rating)}
                </div>
                <blockquote>"{BUSINESS_REVIEWS[bizIdx].quote}"</blockquote>
                <div className="test-user-row">
                  <div className="test-user-info">
                    <div className="test-avatar-circle" style={{ background: BUSINESS_REVIEWS[bizIdx].color }}>
                      {BUSINESS_REVIEWS[bizIdx].avatar}
                    </div>
                    <div>
                      <strong>— {BUSINESS_REVIEWS[bizIdx].name}</strong>
                      <span>{BUSINESS_REVIEWS[bizIdx].title}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setBizIdx((p) => (p === 0 ? BUSINESS_REVIEWS.length - 1 : p - 1))}
                      style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", width: "30px", height: "30px" }}
                    >‹</button>
                    <button
                      onClick={() => setBizIdx((p) => (p + 1) % BUSINESS_REVIEWS.length)}
                      style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", width: "30px", height: "30px" }}
                    >›</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 8. FAQ + MOBILE APP TEASER ═══ */}
      <section className="land-section" id="faq">
        <Reveal>
          <div className="two-col-layout" style={{ gridTemplateColumns: "1.3fr 0.7fr" }}>
            <div>
              <h2 className="land-heading" style={{ fontSize: "1.35rem" }}>Frequently Asked Questions</h2>
              <div className="faq-grid-2col">
                {FAQS.map((faq, idx) => (
                  <div className={`faq-accordion-box ${openFaq === idx ? "open" : ""}`} key={idx}>
                    <button
                      className={`faq-question-btn ${openFaq === idx ? "open" : ""}`}
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    >
                      {faq.q}
                    </button>
                    <div className={`faq-answer-text ${openFaq === idx ? "open" : ""}`}>
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mobile-teaser-card">
                <div className="qr-placeholder-box">📱</div>
                <h4>Shiftlyin Coming Soon on Mobile</h4>
                <p>Scan the QR code to get the app when we launch!</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 9. FINAL CTA BANNER ═══ */}
      <section className="final-cta-container">
        <Reveal>
          <div className="cta-banner-navy">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of students and businesses already growing with Shiftlyin.</p>
            <div className="hero-btns" style={{ justifyContent: "center" }}>
              <Link to="/register" className="cta-btn-white">Register as Student</Link>
              <Link to="/register" className="btn-primary-blue">Register as Business</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 10. FOOTER (DARK NAVY #0B1437) ═══ */}
      <footer className="dark-navy-footer" id="contact">
        <div className="footer-max-width">
          <div className="footer-grid-layout">
            <div className="footer-brand-info">
              <img
                src={fullLogoImg}
                alt="Shiftlyin - Find Jobs. Fit Future."
                style={{
                  height: "44px",
                  objectFit: "contain",
                  background: "#ffffff",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  marginBottom: "0.85rem",
                  display: "inline-block"
                }}
              />
              <p>Connecting college students with local businesses for flexible, part-time opportunities.</p>
              <div className="social-icon-row">
                <a href="#" className="social-icon-btn" aria-label="Facebook">f</a>
                <a href="#" className="social-icon-btn" aria-label="Instagram">📷</a>
                <a href="#" className="social-icon-btn" aria-label="LinkedIn">in</a>
                <a href="#" className="social-icon-btn" aria-label="YouTube">▶</a>
              </div>
            </div>

            <div className="footer-nav-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#hero">Home</a></li>
                <li><a href="#jobs">Jobs</a></li>
                <li><a href="#trusted">Businesses</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>For Students</h4>
              <ul>
                <li><Link to="/register">Find Jobs</Link></li>
                <li><Link to="/login">My Applications</Link></li>
                <li><Link to="/login">Profile</Link></li>
                <li><Link to="/help">Help Center</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>For Businesses</h4>
              <ul>
                <li><Link to="/register">Post a Job</Link></li>
                <li><Link to="/login">My Jobs</Link></li>
                <li><Link to="/login">Applications</Link></li>
                <li><Link to="/login">Workers</Link></li>
                <li><Link to="/login">Business Profile</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
                <li><a href="#">Refund Policy</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            <div className="newsletter-box-col">
              <h4>Newsletter</h4>
              <p>Subscribe to get latest jobs and updates.</p>
              <form className="newsletter-input-group" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer-bottom-bar">
            © 2026 Shiftlyin. All Rights Reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
