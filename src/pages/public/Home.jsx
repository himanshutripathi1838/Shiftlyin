import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/hustlr-cafe-hero.png";
import JobCardDeck from "../../components/JobCardDeck.jsx";
import useCurrentTime from "../../hooks/useCurrentTime.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";
import { isDateTimePast } from "../../utils/dateTime.js";

const categories = [
  { id: "restaurant", name: "Restaurant", icon: "🍳" },
  { id: "cafe", name: "Cafe", icon: "☕" },
  { id: "hotel", name: "Hotel", icon: "🏨" },
  { id: "retail", name: "Retail", icon: "🛍️" },
  { id: "delivery", name: "Delivery", icon: "🛵" },
  { id: "events", name: "Events", icon: "🎉" },
  { id: "office", name: "Office Assistant", icon: "📁" },
  { id: "tutor", name: "Tutor", icon: "📚" },
  { id: "warehouse", name: "Warehouse", icon: "📦" },
  { id: "support", name: "Customer Support", icon: "🎧" }
];

const faqs = [
  { q: "How do I register?", a: "You can register either as a Student or a Business Owner. Students need to upload their college ID card for verification, and Business Owners need to provide basic restaurant details to begin." },
  { q: "How does GPS attendance work?", a: "Shiftlyin uses geofenced coordinates. When a student arrives within 100 meters of the restaurant shift coordinates during shift hours, they can tap 'Check-In' on their app. Similarly, they check out when the shift ends." },
  { q: "How does identity verification work?", a: "Students upload their college ID, Aadhaar number (format validated), and PAN for secure validation. Business profiles are vetted manually by administrators to prevent scams." },
  { q: "How do I get paid?", a: "Once the business owner approves your attendance checkout, payment is calculated and sent directly to your Shiftlyin wallet, which you can withdraw to your bank account." },
  { q: "Is Shiftlyin secure?", a: "Absolutely. We enforce SSL, multi-factor authentication, and manual admin verification profiles for both candidates and employers." },
  { q: "When is chat enabled?", a: "Private chat rooms are automatically unlocked the moment a business owner accepts a student's shift application." },
  { q: "How does wallet settlement work?", a: "Merchants clear payouts dynamically, while students receive their settlements directly with 10% commission deduction processed automatically." },
  { q: "Can I work multiple jobs?", a: "Yes, you can apply and secure multiple active shifts as long as the dates and timings do not overlap." }
];

const testimonials = [
  { text: "Shiftlyin has changed how I manage my college expenses. I can pick up Cafe shifts on weekends and get paid instantly. 'Earn while you learn' is real!", author: "Aman Sharma", role: "Delhi University Student" },
  { text: "Finding temporary staff during weekend rush hours used to be a nightmare. With Shiftlyin, we get verified students who check in on time via GPS.", author: "Rajesh Mehra", role: "Owner, Café Mocha" },
  { text: "Flexible retail shifts allowed me to earn money without missing my afternoon classes. Clean UI and extremely fast wallets!", author: "Priya Patel", role: "Student, IIT Bombay" }
];

export default function Home() {
  const { currentUser, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const now = useCurrentTime();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchShiftType, setSearchShiftType] = useState("all");
  const [searchSalaryRange, setSearchSalaryRange] = useState("all");

  // Accordion state
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  // Testimonials carousel state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Interactive details drawers
  const [activeStep, setActiveStep] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);

  const activeJobs = jobs.filter(
    (job) =>
      !isDateTimePast(job.shiftEndsAt, now) &&
      (profile?.role !== "business" || job.createdBy === currentUser?.uid)
  );

  const filteredJobs = activeJobs.filter((job) => {
    const matchesTitle = !searchQuery || job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || job.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !searchLocation || job.location?.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesCategory = searchCategory === "all" || job.category?.toLowerCase() === searchCategory.toLowerCase();
    
    // Shift type and salary mock filter matches
    const matchesShift = searchShiftType === "all" || (job.urgency && job.urgency === searchShiftType);
    let matchesSalary = true;
    if (searchSalaryRange !== "all") {
      const sal = Number(job.salaryAmount || 0);
      if (searchSalaryRange === "low") matchesSalary = sal <= 500;
      else if (searchSalaryRange === "mid") matchesSalary = sal > 500 && sal <= 1500;
      else if (searchSalaryRange === "high") matchesSalary = sal > 1500;
    }
    
    return matchesTitle && matchesLocation && matchesCategory && matchesShift && matchesSalary;
  });

  useEffect(() => {
    const jobsQuery = query(collection(db, "jobs"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        setJobs(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return (
    <main className="home-page" style={{ background: "var(--bg)", color: "var(--text)" }}>
      
      {/* SECTION 2: Hero Section */}
      <section className="landing-section hero-split bg-gradient-radial" style={{ padding: "clamp(60px, 10vw, 120px) clamp(1rem, 4vw, 2rem) 60px" }}>
        <div style={{ alignSelf: "center" }}>
          <span className="eyebrow animate-pulse-subtle" style={{ display: "inline-block", background: "rgba(37,99,235,0.08)", color: "var(--primary)", padding: "6px 16px", borderRadius: "30px", fontSize: "11px", fontWeight: "900", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            🚀 Work Smart. Earn More.
          </span>
          <h1 className="hero-heading gradient-text" style={{ fontWeight: "900", lineHeight: "1.05", margin: "20px 0", fontSize: "clamp(32px, 6.5vw, 64px)" }}>
            Find Part-Time <br />
            Jobs Near You
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--muted)", lineHeight: "1.6", maxWidth: "540px", marginBottom: "35px" }}>
            Connect with verified businesses, discover local shifts, earn while studying, and build your professional reputation with Shiftlyin.
          </p>
          <div className="hero-actions" style={{ display: "flex", gap: "16px", marginBottom: "40px" }}>
            <a href="#jobs" className="primary-button hover-lift" style={{ minWidth: "160px", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", fontWeight: "700" }}>Find Jobs</a>
            <Link to="/register" className="ghost-button hover-lift" style={{ minWidth: "160px", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", fontWeight: "700" }}>Post a Job</Link>
          </div>
          <div style={{ display: "flex", gap: "20px", color: "var(--muted)", fontSize: "12px", fontWeight: "800", flexWrap: "wrap" }}>
            <span>🎓 Verified Students (18+)</span>
            <span>🏪 Verified Businesses</span>
            <span>📍 GPS Attendance</span>
            <span>🔒 Safe & Secure</span>
          </div>
        </div>

        <div className="hero-illu-container" style={{ position: "relative" }}>
          <img src={heroImage} alt="Students and employers collaborating" className="hero-illu-img shadow-premium" style={{ width: "100%", borderRadius: "24px", border: "1px solid var(--border)" }} />
          
          <div className="floating-stat-card c1 glass-card" style={{ position: "absolute", top: "10%", left: "-5%", padding: "12px 18px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <strong style={{ fontSize: "22px", color: "var(--primary)", fontWeight: "900" }}>5,000+</strong>
            <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Active Students</span>
          </div>
          <div className="floating-stat-card c2 glass-card" style={{ position: "absolute", bottom: "15%", right: "-5%", padding: "12px 18px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <strong style={{ fontSize: "22px", color: "var(--accent)", fontWeight: "900" }}>1,000+</strong>
            <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Shifts Completed</span>
          </div>
          <div className="floating-stat-card c3 glass-card" style={{ position: "absolute", bottom: "5%", left: "8%", padding: "12px 18px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <strong style={{ fontSize: "22px", color: "var(--text)", fontWeight: "900" }}>500+</strong>
            <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Local Partners</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Smart Job Search */}
      <section className="landing-section" id="jobs" style={{ padding: "40px clamp(1rem, 4vw, 2rem) 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="eyebrow">Smart Discovery</span>
          <h2 className="section-title" style={{ fontWeight: "900", marginTop: "8px" }}>Explore Live Opportunities</h2>
        </div>

        <div className="search-bar-container glass-card shadow-premium" style={{ borderRadius: "24px", padding: "24px clamp(16px, 4vw, 32px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", alignItems: "end", border: "1px solid rgba(255, 255, 255, 0.8)", marginBottom: "50px" }}>
          <div className="search-input-group">
            <label style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px", display: "block" }}>Job Title</label>
            <input type="text" placeholder="Barista, Delivery, Clerk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "100%", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", padding: "8px 0", fontWeight: "600", fontSize: "14px" }} />
          </div>
          <div className="search-input-group">
            <label style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px", display: "block" }}>Location</label>
            <input type="text" placeholder="Select Area" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} style={{ width: "100%", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", padding: "8px 0", fontWeight: "600", fontSize: "14px" }} />
          </div>
          <div className="search-input-group">
            <label style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px", display: "block" }}>Category</label>
            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} style={{ width: "100%", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", padding: "8px 0", fontWeight: "600", fontSize: "14px" }}>
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="search-input-group">
            <label style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px", display: "block" }}>Shift Type</label>
            <select value={searchShiftType} onChange={(e) => setSearchShiftType(e.target.value)} style={{ width: "100%", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", padding: "8px 0", fontWeight: "600", fontSize: "14px" }}>
              <option value="all">Any Shift</option>
              <option value="normal">Normal</option>
              <option value="urgent">🚨 Urgent</option>
            </select>
          </div>
          <div className="search-input-group">
            <label style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px", display: "block" }}>Salary Range</label>
            <select value={searchSalaryRange} onChange={(e) => setSearchSalaryRange(e.target.value)} style={{ width: "100%", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", padding: "8px 0", fontWeight: "600", fontSize: "14px" }}>
              <option value="all">Any Payout</option>
              <option value="low">Under ₹500</option>
              <option value="mid">₹501 - ₹1500</option>
              <option value="high">Above ₹1500</option>
            </select>
          </div>
        </div>

        {/* Live Active Listings Deck */}
        <div>
          {loading && <div className="loading-card" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>Locating active jobs...</div>}
          {error && <p className="form-error" style={{ textAlign: "center" }}>{error}</p>}
          {!loading && !error && (
            <JobCardDeck
              jobs={filteredJobs}
              emptyMessage="No active matching shifts available. Try adjusting filters!"
            />
          )}
        </div>
      </section>

      {/* SECTION 4: Trusted Businesses */}
      <section className="landing-section" id="businesses" style={{ padding: "30px clamp(1rem, 4vw, 2rem) 60px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span className="eyebrow">Enterprise Trust</span>
          <h3 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginTop: "4px" }}>Over 500+ Verified Partners</h3>
        </div>
        <div className="logo-carousel-container">
          <div className="logo-carousel-track">
            {["Café Coffee Day", "Domino's", "Barista", "McDonald's", "Zomato", "Swiggy", "Radisson Hotels", "Café Coffee Day", "Domino's", "Barista", "McDonald's", "Zomato", "Swiggy", "Radisson Hotels"].map((brand, i) => (
              <div className="logo-carousel-item" key={i} style={{ padding: "0 25px", fontSize: "15px", fontWeight: "800", color: "var(--muted)", opacity: "0.75" }}>
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: How Shiftlyin Works */}
      <section className="landing-section steps-connector" id="how-it-works" style={{ padding: "80px clamp(1rem, 4vw, 2rem)" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="eyebrow">Workflow Guide</span>
          <h2 className="section-title" style={{ fontWeight: "900", marginTop: "8px" }}>How Shiftlyin Works</h2>
        </div>

        <div className="how-works-grid">
          {[
            { step: "1", title: "Quick Register", desc: "Set up your verified student or merchant details in a few taps.", icon: "📝", details: "Registration is simple. Verify your email, complete setup parameters, and choose your account role to access listings desks." },
            { step: "2", title: "ID Verification", desc: "Upload Aadhaar, PAN, or college identity documents securely.", icon: "🛡️", details: "To eliminate fraud, all identity documents are verified using format validators and security algorithms." },
            { step: "3", title: "Admin Audit", desc: " Shiftlyin system moderators review and approve your account within hours.", icon: "⚡", details: "Approval is fast. Accounts are vetted against student card databases and business registry guidelines within 2 hours." },
            { step: "4", title: "Find & Match", desc: "Locate active shifts nearby and apply with one tap.", icon: "🔍", details: "Explore shifts sorted by distance or rate. Businesses receive notifications instantly and confirm selected candidates." },
            { step: "5", title: "Coordinate", desc: "Unlock integrated private chat rooms upon acceptance.", icon: "💬", details: "Exchange instructions, timing, attire guidelines, or contact details directly inside our secure chat terminal." },
            { step: "6", title: "Checkout & Payout", desc: "Verify attendance with GPS checks and receive instant payouts.", icon: "💳", details: "Perform geofenced clock-in checkups. Upon checkout, payouts are calculated and deposited directly to your Shiftlyin wallet." }
          ].map((item) => (
            <article 
              className="works-card hover-lift" 
              key={item.step} 
              onClick={() => setActiveStep(activeStep?.step === item.step ? null : item)}
              style={{ cursor: "pointer", border: activeStep?.step === item.step ? "2px solid var(--primary)" : "1px solid var(--border)", position: "relative", zIndex: 5 }}
            >
              <div className="works-icon" style={{ background: "rgba(37,99,235,0.06)", color: "var(--primary)" }}>{item.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "8px" }}>{item.step}. {item.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.5" }}>{item.desc}</p>
              
              {activeStep?.step === item.step && (
                <div style={{ marginTop: "12px", padding: "10px 0 0", borderTop: "1px dashed var(--border)", fontSize: "12px", color: "var(--text)", lineHeight: "1.4" }}>
                  {item.details}
                </div>
              )}
              <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700", marginTop: "10px", display: "inline-block" }}>
                {activeStep?.step === item.step ? "Show less ↑" : "Learn more →"}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 6: Platform Features */}
      <section className="landing-section" id="students" style={{ padding: "80px clamp(1rem, 4vw, 2rem)", background: "var(--surface-soft)", borderRadius: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="eyebrow">Rich Capabilities</span>
          <h2 className="section-title" style={{ fontWeight: "900", marginTop: "8px" }}>Platform Features</h2>
        </div>

        <div className="features-grid">
          {[
            { title: "Verified Students", desc: "Only audited, age-verified candidates are allowed to pick shifts.", icon: "🎓", detail: "Ensures responsible talent pools for business partners." },
            { title: "Verified Businesses", desc: "No scam postings. Businesses are audited before they can list jobs.", icon: "🏪", detail: "Provides a safe, trustworthy environment for students." },
            { title: "Aadhaar Validation", desc: "Validates Aadhaar numbers directly to guarantee credentials.", icon: "🆔", detail: "Guarantees authentic legal checks for all applicants." },
            { title: "PAN Validation", desc: "Processes PAN numbers to secure legal and tax parameters.", icon: "📂", detail: "Streamlines institutional payouts and declarations." },
            { title: "GPS Check-In", desc: "Attendance check-ins require geolocation within 100 meters.", icon: "📍", detail: "Eliminates time-theft and secures worker records." },
            { title: "Secure Payout Wallet", desc: "Instant checkout payments deposited directly into student wallets.", icon: "💳", detail: "Secure, prompt payments after shift sign-off." },
            { title: "Real-Time Chat", desc: "Private chat rooms unlock automatically after shift match.", icon: "💬", detail: "Coordination is seamless and protected." },
            { title: "Reputation Index", desc: "Student checkups build scoring records for resume profiles.", icon: "📈", detail: "Unlocks high-paying opportunities for top-rated workers." }
          ].map((item) => (
            <article 
              className="feature-card hover-lift" 
              key={item.title}
              onClick={() => setActiveFeature(activeFeature?.title === item.title ? null : item)}
              style={{ cursor: "pointer", border: activeFeature?.title === item.title ? "2px solid var(--primary)" : "1px solid var(--border)" }}
            >
              <span style={{ fontSize: "28px", marginBottom: "12px", display: "block" }}>{item.icon}</span>
              <h3 style={{ fontSize: "15px", fontWeight: "800", marginBottom: "6px" }}>{item.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.4", margin: 0 }}>{item.desc}</p>
              
              {activeFeature?.title === item.title && (
                <div style={{ marginTop: "10px", padding: "8px 0 0", borderTop: "1px dashed var(--border)", fontSize: "11px", color: "var(--text)" }}>
                  {item.detail}
                </div>
              )}
              <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700", marginTop: "10px", display: "block" }}>
                {activeFeature?.title === item.title ? "Close info ↑" : "Interact →"}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 7: Job Categories */}
      <section className="landing-section" style={{ padding: "80px clamp(1rem, 4vw, 2rem)" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="eyebrow">Browse Work</span>
          <h2 className="section-title" style={{ fontWeight: "900", marginTop: "8px" }}>Popular Job Categories</h2>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              className="category-card hover-lift" 
              key={cat.id}
              onClick={() => {
                setSearchCategory(cat.id);
                document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ cursor: "pointer", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            >
              <span style={{ fontSize: "36px", marginBottom: "12px", display: "block" }}>{cat.icon}</span>
              <strong style={{ fontSize: "14px", color: "var(--text)", fontWeight: "800" }}>{cat.name}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: Why Choose Shiftlyin */}
      <section className="landing-section hero-split" id="about" style={{ padding: "80px clamp(1rem, 4vw, 2rem)" }}>
        <div style={{ background: "var(--surface-soft)", borderRadius: "24px", padding: "clamp(24px, 6vw, 48px)", display: "flex", flexDirection: "column", gap: "24px", order: 2 }}>
          <div style={{ padding: "24px", background: "var(--surface)", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ background: "rgba(37,99,235,0.08)", color: "var(--primary)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>For Students</span>
            <h4 style={{ fontSize: "15px", fontWeight: "800", margin: "10px 0 6px" }}>Complete Flexibility</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: "1.5" }}>Pick shifts that fit your lecture schedules. Get verified, work, and secure instant payouts directly to your wallet.</p>
          </div>
          <div style={{ padding: "24px", background: "var(--surface)", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ background: "rgba(16,185,129,0.08)", color: "var(--accent)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>For Businesses</span>
            <h4 style={{ fontSize: "15px", fontWeight: "800", margin: "10px 0 6px" }}>Instant Verified Hiring</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: "1.5" }}>Stop reviewing stacks of resumes. Hire students audited manually by college registries and check GPS check-in reports.</p>
          </div>
        </div>

        <div style={{ order: 1, alignSelf: "center" }}>
          <span className="eyebrow">Platform Edge</span>
          <h2 className="section-title" style={{ fontWeight: "900", margin: "12px 0 24px" }}>Why Choose Shiftlyin</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "20px" }}>
            {[
              { t: "Instant Verification Gating", d: "Zero spam accounts. Both student credentials and store registries are manually audited." },
              { t: "Geofenced GPS Checkups", d: "Clock-in checkins require location validation within 100 meters of the workspace." },
              { t: "Wallet settlements in 1-Click", d: "Process merchant balance clearings and student payouts securely." },
              { t: "Integrated console Chatrooms", d: "Secure, prompt messaging triggers the moment a shift application is accepted." },
              { t: "Commute-Based Sorting", d: "Find active, urgent, or high-paying gigs located closest to your hostel or campus." }
            ].map((item) => (
              <li key={item.t} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent)", width: "24px", height: "24px", borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: "800", fontSize: "12px", flexShrink: 0 }}>✓</div>
                <div>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--text)" }}>{item.t}</strong>
                  <span style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.4" }}>{item.d}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 9: Platform Statistics */}
      <section className="landing-section" style={{ padding: "40px clamp(1rem, 4vw, 2rem) 80px" }}>
        <div className="how-works-grid">
          {[
            { val: "5,000+", label: "Verified Students", color: "linear-gradient(135deg, #eff6ff, #dbeafe)" },
            { val: "500+", label: "Trusted Partners", color: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
            { val: "1,000+", label: "Successful Shifts", color: "linear-gradient(135deg, #fffbeb, #fef3c7)" },
            { val: "98.5%", label: "Satisfaction Rate", color: "linear-gradient(135deg, #f5f3ff, #ede9fe)" }
          ].map((stat) => (
            <div key={stat.label} className="hover-lift" style={{ background: stat.color, borderRadius: "20px", padding: "32px 24px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <strong style={{ fontSize: "38px", fontWeight: "900", color: "#111827", display: "block", marginBottom: "4px" }}>{stat.val}</strong>
              <span style={{ fontSize: "12px", color: "#4b5563", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: Testimonials */}
      <section className="landing-section" style={{ padding: "80px clamp(1rem, 4vw, 2rem) 100px", textAlign: "center" }}>
        <span className="eyebrow" style={{ display: "inline-flex" }}>User Testimonials</span>
        <h2 className="section-title" style={{ fontWeight: "900", margin: "8px 0 40px" }}>Reviews from Shiftlyiners</h2>
        
        <div className="glass-card shadow-premium" style={{ maxWidth: "720px", margin: "0 auto", minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "center", borderRadius: "24px", padding: "clamp(24px, 6vw, 48px)", position: "relative", border: "1px solid rgba(255,255,255,0.7)" }}>
          <div style={{ fontSize: "28px", color: "var(--primary)", marginBottom: "15px" }}>★★★★★</div>
          <p style={{ fontSize: "1.15rem", lineHeight: "1.65", fontStyle: "italic", color: "var(--text)", margin: 0 }}>
            "{testimonials[activeTestimonial].text}"
          </p>
          <strong style={{ display: "block", marginTop: "24px", fontSize: "16px", color: "var(--text)", fontWeight: "800" }}>
            {testimonials[activeTestimonial].author}
          </strong>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            {testimonials[activeTestimonial].role}
          </span>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "28px" }}>
            {testimonials.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveTestimonial(idx)}
                style={{ 
                  width: "10px", 
                  height: "10px", 
                  borderRadius: "50%", 
                  border: "none", 
                  background: activeTestimonial === idx ? "var(--primary)" : "var(--border)",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: Security & Verification */}
      <section className="landing-section" style={{ padding: "80px clamp(1rem, 4vw, 2rem)", background: "var(--surface-soft)", borderRadius: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="eyebrow">Trust Auditing</span>
          <h2 className="section-title" style={{ fontWeight: "900", marginTop: "8px" }}>Identity & Safety Gate</h2>
        </div>

        <div className="how-works-grid">
          {[
            { title: "18+ Age Gated", desc: "Mandatory check restricts gig access to adult college applicants.", badge: "Age Checked" },
            { title: "Aadhaar Validation", desc: "Enforces 12-digit Aadhaar pattern mapping securely.", badge: "Aadhaar OK" },
            { title: "PAN Validation", desc: "Format verification (10 characters) processes payout clearances.", badge: "Tax Form Vetted" },
            { title: "Driving Licence check", desc: "Ensures delivery applicants possess active driving credentials.", badge: "DL Vetted" },
            { title: "10-Digit Phone check", desc: "Requires validated Indian phone numbers for notifications.", badge: "OTP Gated" },
            { title: "Manual Admin Verification", desc: "Every profile undergoes admin checkups before listing.", badge: "Moderator OK" }
          ].map((item) => (
            <div key={item.title} className="glass-card hover-lift" style={{ borderRadius: "16px", padding: "24px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "11px", background: "rgba(16,185,129,0.08)", color: "var(--accent)", padding: "3px 8px", borderRadius: "6px", fontWeight: "800", display: "inline-block", width: "max-content" }}>{item.badge}</span>
              <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "4px 0 0" }}>{item.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.4", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 12: FAQ Accordion */}
      <section className="landing-section" id="faq" style={{ padding: "80px clamp(1rem, 4vw, 2rem) 100px", maxWidth: "840px" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="eyebrow">Platform Help</span>
          <h2 className="section-title" style={{ fontWeight: "900", marginTop: "8px" }}>Frequently Asked Questions</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div className="accordion-item" key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                <button 
                  className="accordion-header"
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  style={{ width: "100%", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", outline: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text)" }}>{faq.q}</span>
                  <span style={{ fontSize: "20px", color: "var(--muted)", fontWeight: "300" }}>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="accordion-body" style={{ padding: "0 24px 18px", fontSize: "13px", color: "var(--muted)", lineHeight: "1.65" }}>
                    <p style={{ margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 13: Mobile App Promotion */}
      <section className="landing-section" style={{ padding: "40px clamp(1rem, 4vw, 2rem) 80px" }}>
        <div className="app-promo-banner" style={{ border: "1px solid rgba(255, 255, 255, 0.25)", boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15)" }}>
          <div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "900", margin: "0 0 16px", color: "white" }}>Shiftlyin on the Go</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "580px", margin: "0 0 28px" }}>
              Download our mobile application to receive push notifications for urgent jobs, check in via GPS, and clear wallet settlements instantly.
            </p>
            <span style={{ display: "block", fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "#fbbf24", marginBottom: "12px" }}>Download App (Coming Soon)</span>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="primary-button" style={{ background: "black", borderColor: "#222", color: "white", fontSize: "12px" }} disabled>Google Play</button>
              <button className="primary-button" style={{ background: "black", borderColor: "#222", color: "white", fontSize: "12px" }} disabled>App Store</button>
            </div>
          </div>
          <div className="glass-card" style={{ padding: "20px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "160px", border: "1px solid rgba(255,255,255,0.3)" }}>
            {/* Mock QR Code */}
            <div style={{ width: "120px", height: "120px", background: "#f1f5f9", display: "grid", placeItems: "center", border: "2px solid #ccc", color: "#000", fontWeight: "900", fontSize: "11px", textAlign: "center", borderRadius: "8px" }}>QR CODE</div>
            <span style={{ fontSize: "10px", color: "white", fontWeight: "800", textTransform: "uppercase" }}>Scan to Download</span>
          </div>
        </div>
      </section>

      {/* SECTION 14: Final CTA */}
      <section className="landing-section" style={{ padding: "40px clamp(1rem, 4vw, 2rem) 80px" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white", padding: "80px clamp(24px, 6vw, 48px)", borderRadius: "24px", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.05)", boxShadow: "var(--shadow)" }}>
          <h2 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "900", margin: "0 0 16px", color: "white" }}>Ready to Start Your Shift?</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 36px", lineHeight: "1.5" }}>Join the Shiftlyin network today and unlock campus gig opportunities or trusted local worker pools.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="primary-button hover-lift" to="/register" style={{ minWidth: "220px", background: "var(--primary)" }}>Register as Student</Link>
            <Link className="primary-button hover-lift" to="/register" style={{ minWidth: "220px", background: "var(--accent)", borderColor: "var(--accent)" }}>Register as Business</Link>
          </div>
        </div>
      </section>

      {/* SECTION 15: Premium Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface-soft)", padding: "80px clamp(1rem, 4vw, 2rem) 40px" }}>
        <div className="landing-section" style={{ padding: 0 }}>
          <div className="footer-grid" style={{ marginBottom: "50px" }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: "900", color: "var(--text)", margin: "0 0 16px" }}>Shiftlyin</h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.65", margin: 0 }}>
                Find Jobs. Fit Future. Connecting campus students with verified part-time shifts and businesses nearby.
              </p>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "13px", fontWeight: "900", textTransform: "uppercase", color: "var(--text)", margin: "0 0 16px" }}>Students</strong>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px", fontSize: "13px" }}>
                <li><Link to="/register" style={{ color: "var(--muted)" }}>Search shifts</Link></li>
                <li><Link to="/help" style={{ color: "var(--muted)" }}>Student FAQ</Link></li>
                <li><Link to="/login" style={{ color: "var(--muted)" }}>Verification guide</Link></li>
              </ul>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "13px", fontWeight: "900", textTransform: "uppercase", color: "var(--text)", margin: "0 0 16px" }}>Businesses</strong>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px", fontSize: "13px" }}>
                <li><Link to="/register" style={{ color: "var(--muted)" }}>Post vacancy</Link></li>
                <li><Link to="/help" style={{ color: "var(--muted)" }}>Business FAQ</Link></li>
                <li><Link to="/login" style={{ color: "var(--muted)" }}>Verification requirements</Link></li>
              </ul>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "13px", fontWeight: "900", textTransform: "uppercase", color: "var(--text)", margin: "0 0 16px" }}>Social</strong>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px", fontSize: "13px" }}>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)" }}>LinkedIn</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)" }}>Instagram</a></li>
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)" }}>Facebook</a></li>
                <li><a href="https://github.com/himanshutripathi1838/Shiftlyin" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)" }}>GitHub</a></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "var(--muted)" }}>
            <span>© 2026 Shiftlyin. All Rights Reserved.</span>
            <div style={{ display: "flex", gap: "20px" }}>
              <Link to="/help" style={{ color: "var(--muted)" }}>Privacy Policy</Link>
              <Link to="/help" style={{ color: "var(--muted)" }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
