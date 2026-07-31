import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/shiftlyin-cafe-hero.png";
import fullLogoImg from "../../assets/shiftlyin-full-logo.png";
import sLogoImg from "../../assets/shiftlyin-s-logo.png";
import studentAvatarImg from "../../assets/student-3d-avatar.png";
import businessAvatarImg from "../../assets/business-3d-avatar.png";
import { motion } from "motion/react";
import LogoCloud from "@/components/ui/logo-cloud-15";
import TestimonialCarousel from "@/components/ui/testimonial";
import DotCard from "@/components/ui/moving-dot-card";
import SeoHead from "../../components/seo/SeoHead.jsx";

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

const STUDENT_STEPS = [
  { num: "1", icon: "👤", title: "Create Account", desc: "Sign up in seconds as a student with your mobile number." },
  { num: "2", icon: "👤", title: "Complete Profile", desc: "Add your details, verify identity and set your preferences." },
  { num: "3", icon: "💼", title: "Find Opportunities", desc: "Browse part-time jobs, shifts or internships near you." },
  { num: "4", icon: "✈️", title: "Apply & Get Matched", desc: "Apply to jobs you like. Our smart matching finds the best fit." },
  { num: "5", icon: "💬", title: "Connect & Work", desc: "Once accepted, chat with the business and start working." },
  { num: "6", icon: "👛", title: "Get Paid & Grow", desc: "Complete the work, get paid securely and build your reputation." },
];

const BUSINESS_STEPS = [
  { num: "1", icon: "🏪", title: "Create Account", desc: "Sign up as a business with your details." },
  { num: "2", icon: "📄", title: "Complete Business Profile", desc: "Add your business info, location and verify your identity." },
  { num: "3", icon: "💼", title: "Post a Job / Shift", desc: "Create job posts or shifts with requirements, timing and pay." },
  { num: "4", icon: "👥", title: "Review Applicants", desc: "Browse student applications and review profiles." },
  { num: "5", icon: "💬", title: "Accept & Connect", desc: "Accept the best match, chat and share work details." },
  { num: "6", icon: "🛡️", title: "Work Completed", desc: "Work gets done, pay securely and build trusted relationships." },
];

const WHY_FEATURES = [
  { num: "1", icon: "🛡️", title: "Verified Students", desc: "Every student is verified for authenticity and 18+ safety compliance.", color: "#2563eb", bg: "#eff6ff" },
  { num: "2", icon: "⚡", title: "Instant Hiring", desc: "Post a job and get matched with eligible students within minutes.", color: "#7c3aed", bg: "#faf5ff" },
  { num: "3", icon: "📍", title: "Nearby Opportunities", desc: "Find jobs and work opportunities near your location.", color: "#16a34a", bg: "#f0fdf4" },
  { num: "4", icon: "💳", title: "Secure Payments", desc: "Safe, transparent and on-time payments through our platform.", color: "#d97706", bg: "#fffbeb" },
  { num: "5", icon: "⭐", title: "Ratings & Reputation", desc: "Build your reputation with ratings and reviews for more opportunities.", color: "#c026d3", bg: "#fdf4ff" },
  { num: "6", icon: "📈", title: "Career Growth", desc: "Grow your skills and career with part-time and real-world experience.", color: "#059669", bg: "#ecfdf5" },
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
    <>
      <SeoHead
        title="Shiftlyin | Find Part-Time Student Jobs & Local Campus Hiring"
        description="Shiftlyin connects verified 18+ college students with local cafes, restaurants, hotels, shops, and event organizers for flexible part-time shift jobs in India."
        keywords="student part-time jobs, campus hiring, restaurant shift jobs, cafe jobs, event staffing, shiftlyin"
        canonical="/"
      />
      <main className="landing-page">
      {/* ═══ 2. HERO SECTION ═══ */}
      <section className="hero-wrapper" id="hero">
        <div className="hero-grid">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
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
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
          >
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
          </motion.div>
        </div>

        {/* Dark Rounded Search Bar */}
        <motion.div
          className="hero-search-container"
          id="jobs"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
        >
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
        </motion.div>
      </section>

      {/* ═══ 3. TRUSTED-BY LOGO STRIP ═══ */}
      <section id="trusted" className="w-full flex justify-center py-2">
        <Reveal className="w-full">
          <LogoCloud />
        </Reveal>
      </section>

      {/* ═══ 4 & 5. MASTER DUAL PIPELINE: HOW IT WORKS & WHY CHOOSE ═══ */}
      <section className="land-section showcase-master-section" id="how-it-works">
        <Reveal>
          <div className="land-center" style={{ marginBottom: "3rem" }}>
            <span className="showcase-top-badge">
              HOW IT WORKS & WHY CHOOSE SHIFTLYIN
            </span>
            <h1 className="showcase-main-h1">
              How <span className="highlight-blue">Shiftlyin</span> Works & Why Choose <span className="highlight-blue">Shiftlyin</span>
            </h1>
            <p className="showcase-main-sub">
              One Platform. Endless Opportunities. Trusted by Students & Businesses.
            </p>
          </div>
        </Reveal>

        {/* ── ROW 1: FOR STUDENTS (BLUE PIPELINE) ── */}
        <Reveal>
          <div className="pipeline-row student-pipeline">
            {/* Left 3D Avatar Card */}
            <div className="avatar-side-card student-card">
              <span className="side-pill student-pill">For Students</span>
              <img src={studentAvatarImg} alt="3D Student Avatar" className="avatar-img" />
            </div>

            {/* Right 6 Horizontal Pipeline Steps */}
            <div className="pipeline-steps-grid">
              {STUDENT_STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  className="step-pipeline-card student-card-step"
                  whileHover={{ y: -7, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="step-badge student-step-badge">{s.num}</div>
                  <div className="step-icon-wrap student-icon-bg">{s.icon}</div>
                  <h4 className="step-card-title">{s.title}</h4>
                  <p className="step-card-desc">{s.desc}</p>
                  {i < 5 && <span className="pipeline-connector-line student-line" />}
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── CENTER INTERSECTING CONNECTING CARD ── */}
        <Reveal>
          <div className="center-connect-wrapper">
            <motion.div
              className="center-connect-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="center-s-logo">
                <img src={sLogoImg} alt="Shiftlyin S Logo" style={{ width: "22px", height: "22px" }} />
              </div>
              <div className="center-connect-text">
                <strong className="center-connect-heading">Smart Platform That Connects</strong>
                <p className="center-connect-sub">
                  We verify, match and empower students and businesses for trusted and seamless collaborations.
                </p>
              </div>
            </motion.div>
          </div>
        </Reveal>

        {/* ── ROW 2: FOR BUSINESSES (GREEN PIPELINE) ── */}
        <Reveal>
          <div className="pipeline-row business-pipeline">
            {/* Left 3D Avatar Card */}
            <div className="avatar-side-card business-card">
              <span className="side-pill business-pill">For Businesses</span>
              <img src={businessAvatarImg} alt="3D Business Owner Avatar" className="avatar-img" />
            </div>

            {/* Right 6 Horizontal Pipeline Steps */}
            <div className="pipeline-steps-grid">
              {BUSINESS_STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  className="step-pipeline-card business-card-step"
                  whileHover={{ y: -7, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="step-badge business-step-badge">{s.num}</div>
                  <div className="step-icon-wrap business-icon-bg">{s.icon}</div>
                  <h4 className="step-card-title">{s.title}</h4>
                  <p className="step-card-desc">{s.desc}</p>
                  {i < 5 && <span className="pipeline-connector-line business-line" />}
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── ROW 3: WHY CHOOSE SHIFTLYIN ── */}
        <div id="why-choose" style={{ paddingTop: "3.5rem" }}>
          <Reveal>
            <div className="land-center" style={{ marginBottom: "2.5rem" }}>
              <h2 className="land-heading" style={{ fontSize: "2rem" }}>
                Why Choose <span className="highlight-blue">Shiftlyin</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="why-features-grid-6">
              {WHY_FEATURES.map((w) => (
                <motion.div
                  key={w.num}
                  className="why-feature-box"
                  style={{ background: w.bg, borderColor: `${w.color}30` }}
                  whileHover={{ y: -7, scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="why-box-top">
                    <div className="why-num-badge" style={{ background: w.color }}>{w.num}</div>
                    <div className="why-icon-circle" style={{ color: w.color }}>{w.icon}</div>
                  </div>
                  <h4 className="why-box-title">{w.title}</h4>
                  <p className="why-box-desc">{w.desc}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── BOTTOM CTA ACTION BUTTONS ── */}
        <Reveal>
          <div className="showcase-cta-bar">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link to="/register" className="btn-primary-blue" style={{ fontSize: "1rem", padding: "14px 34px", borderRadius: "30px" }}>
                Join Shiftlyin Today →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <a href="#how-it-works" className="btn-outline-dark" style={{ fontSize: "0.92rem", padding: "12px 24px", borderRadius: "30px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.8rem", background: "#2563eb", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", display: "grid", placeItems: "center" }}>▶</span> Watch How It Works
              </a>
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 6. POPULAR CATEGORIES + IMPACT NUMBERS ═══ */}
      <section className="land-section">
        <Reveal>
          <div className="two-col-layout">
            <div>
              <h2 className="land-heading" style={{ fontSize: "1.35rem" }}>Popular Job Categories</h2>
              <div className="cat-chips-grid">
                {CATEGORIES.map((c) => (
                  <motion.div
                    className="cat-chip"
                    key={c.label}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="cat-chip-icon">{c.emoji}</span>
                    <span className="cat-chip-name">{c.label}</span>
                  </motion.div>
                ))}
              </div>
              <a href="#jobs" className="view-all-cats-link">View All Categories →</a>
            </div>

            <div>
              <h2 className="land-heading" style={{ fontSize: "1.35rem" }}>Our Impact in Numbers</h2>
              <div className="impact-blocks-grid">
                <DotCard target={5000} label="Students" color="#2563eb" duration={2000} />
                <DotCard target={500} label="Businesses" color="#16a34a" duration={2000} />
                <DotCard target={1000} label="Jobs Posted" color="#7c3aed" duration={2000} />
                <DotCard target={3000} label="Successful Hirings" color="#f59e0b" duration={2000} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 7. TESTIMONIALS (TWO-COLUMN SPLIT WITH SHADCN TESTIMONIAL CAROUSEL) ═══ */}
      <section className="land-section">
        <Reveal>
          <div className="two-col-layout">
            {/* Student Testimonial Carousel */}
            <div>
              <h2 className="land-heading" style={{ fontSize: "1.3rem", marginBottom: "16px" }}>What Students Say</h2>
              <TestimonialCarousel
                items={[
                  {
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
                    name: "Rohan Sharma",
                    role: "B.Tech CSE Student @ Amity",
                    accent: "#2563eb",
                    quote: "Found part-time shift jobs at a nearby cafe that perfectly match my college timetable. Earned ₹8,000 this month while keeping up my 8.5 CGPA!",
                  },
                  {
                    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
                    name: "Priya Patel",
                    role: "Design Student @ NIFT Delhi",
                    accent: "#16a34a",
                    quote: "Escrow wallet payments give total peace of mind. Every shift payout lands in my UPI right after my manager confirms my GPS checkout!",
                  },
                  {
                    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80",
                    name: "Aman Gupta",
                    role: "B.Com Student @ DU",
                    accent: "#7c3aed",
                    quote: "Shiftlyin made finding weekend event ushering gigs so easy. Verified campus profile helped me get hired in under 3 hours!",
                  },
                ]}
                autoplay
                autoplayMs={5000}
              />
            </div>

            {/* Business Testimonial Carousel */}
            <div>
              <h2 className="land-heading" style={{ fontSize: "1.3rem", marginBottom: "16px" }}>What Businesses Say</h2>
              <TestimonialCarousel
                items={[
                  {
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
                    name: "Rajesh Kumar",
                    role: "Manager @ Hustlr Cafe Sector 62",
                    accent: "#f59e0b",
                    quote: "Hired 4 reliable student baristas in 2 hours for our weekend rush. The GPS geofenced attendance system ensures zero absenteeism!",
                  },
                  {
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
                    name: "Ananya Mehta",
                    role: "Event Director @ Nexus Exhibitions",
                    accent: "#0284c7",
                    quote: "Needed 15 verified ushering staff for a 3-day tech summit in Greater Noida. Shiftlyin delivered top-tier student promoters hassle-free.",
                  },
                  {
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
                    name: "Vikram Malhotra",
                    role: "Owner @ Trends Fashion Outlet",
                    accent: "#ec4899",
                    quote: "No long recruitment cycles. We post shift requirements and get pre-verified student applicants ready to start the same afternoon.",
                  },
                ]}
                autoplay
                autoplayMs={5000}
              />
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
              <motion.div
                className="mobile-teaser-card"
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="qr-placeholder-box">📱</div>
                <h4>Shiftlyin Coming Soon on Mobile</h4>
                <p>Scan the QR code to get the app when we launch!</p>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ 9. FINAL CTA BANNER ═══ */}
      <section className="final-cta-container">
        <Reveal>
          <motion.div
            className="cta-banner-navy"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of students and businesses already growing with Shiftlyin.</p>
            <div className="hero-btns" style={{ justifyContent: "center" }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link to="/register" className="cta-btn-white">Register as Student</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link to="/register" className="btn-primary-blue">Register as Business</Link>
              </motion.div>
            </div>
          </motion.div>
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
              <h4>Services</h4>
              <ul>
                <li><Link to="/services/part-time-jobs">Part-Time Jobs</Link></li>
                <li><Link to="/services/student-hiring">Student Hiring</Link></li>
                <li><Link to="/services/restaurant-hiring">Restaurant Staffing</Link></li>
                <li><Link to="/services/event-staffing">Event Staffing</Link></li>
                <li><Link to="/services/gps-attendance">GPS Attendance</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4>Support & Legal</h4>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Use</Link></li>
                <li><Link to="/help">Contact Us</Link></li>
              </ul>
            </div>

            <div className="newsletter-box-col">
              <h4>Newsletter</h4>
              <p>Subscribe to get latest jobs and updates.</p>
              <form className="newsletter-input-group" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" aria-label="Subscribe email" />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer-bottom-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span>© 2026 Shiftlyin Technologies. All Rights Reserved.</span>
            {(import.meta.env.VITE_GBP_CID_URL || import.meta.env.VITE_GBP_REVIEW_URL) && (
              <div style={{ display: "flex", gap: "14px" }}>
                {import.meta.env.VITE_GBP_CID_URL && (
                  <a href={import.meta.env.VITE_GBP_CID_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
                    📍 View on Google
                  </a>
                )}
                {import.meta.env.VITE_GBP_REVIEW_URL && (
                  <a href={import.meta.env.VITE_GBP_REVIEW_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#10b981", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
                    ⭐ Leave a Review
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
