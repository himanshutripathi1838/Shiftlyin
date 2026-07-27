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
  { q: "Is Shiftlyin free?", a: "Registering and searching for jobs is completely free for students. For businesses, we charge a very small commission fee on successful shift completions." },
  { q: "How do businesses verify students?", a: "Students are verified through manual college ID verification by Shiftlyin administrators. Additionally, businesses can review a student's Reputation Score and ratings from past shifts." },
  { q: "How do I get paid?", a: "Once the business owner approves your attendance checkout, payment is calculated and sent directly to your Shiftlyin wallet, which you can withdraw to your bank account." },
  { q: "Can I work multiple jobs?", a: "Yes, as long as the shift timings do not overlap. You can select and work multiple shifts that match your college schedule." }
];

const testimonials = [
  { text: "Shiftlyin has changed how I manage my college expenses. I can pick up Cafe shifts on weekends and get paid instantly. 'Earn while you learn' is real!", author: "Aman Sharma", role: "Delhi University Student", rating: 5 },
  { text: "Finding temporary staff during weekend rush hours used to be a nightmare. With Shiftlyin, we get verified students who check in on time via GPS.", author: "Rajesh Mehra", role: "Owner, Café Mocha", rating: 5 },
  { text: "Flexible retail shifts allowed me to earn money without missing my afternoon classes. Clean UI and extremely fast wallets!", author: "Priya Patel", role: "Student, IIT Bombay", rating: 5 }
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

  // Accordion state
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  // Testimonials carousel state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Interactive popup states
  const [activeStep, setActiveStep] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);

  const activeJobs = jobs.filter(
    (job) =>
      !isDateTimePast(job.shiftEndsAt, now) &&
      (profile?.role !== "business" || job.createdBy === currentUser?.uid)
  );

  const filteredJobs = activeJobs.filter((job) => {
    const matchesTitle = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || job.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !searchLocation || job.location?.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesCategory = searchCategory === "all" || job.category?.toLowerCase() === searchCategory.toLowerCase();
    return matchesTitle && matchesLocation && matchesCategory;
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
      {/* 2. Hero Section */}
      <section className="landing-section hero-split" style={{ padding: "clamp(40px, 8vw, 80px) clamp(1rem, 4vw, 2rem) 40px" }}>
        <div>
          <span className="eyebrow" style={{ fontSize: "12px", color: "var(--primary)", letterSpacing: "0.05em" }}>College Gig Marketplace</span>
          <h1 className="hero-heading" style={{ fontWeight: "900", lineHeight: "1.05", margin: "16px 0 20px", color: "var(--text)" }}>
            Find Part-Time <br className="desktop-only-br" />
            <span style={{ color: "var(--primary)" }}>Jobs Near You</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--muted)", lineHeight: "1.6", maxHeight: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
            Connect with verified businesses, discover nearby jobs, build your experience, and find your future.
          </p>
          <div className="hero-actions" style={{ display: "flex", gap: "16px", margin: "30px 0" }}>
            <Link className="primary-button" to="/register" style={{ minWidth: "150px" }}>Find Jobs</Link>
            <Link className="ghost-button" to="/register" style={{ minWidth: "150px" }}>Post a Job</Link>
          </div>
          <div style={{ display: "flex", gap: "24px", color: "var(--muted)", fontSize: "13px", fontWeight: "700" }}>
            <span>✓ Verified Students</span>
            <span>✓ Trusted Businesses</span>
            <span>✓ Safe & Secure</span>
          </div>
        </div>

        <div className="hero-illu-container">
          <img src={heroImage} alt="Happy college students looking for shifts" className="hero-illu-img" />
          <div className="floating-stat-card c1">
            <strong style={{ fontSize: "20px", color: "var(--primary)" }}>5000+</strong>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600" }}>Verified Students</span>
          </div>
          <div className="floating-stat-card c2">
            <strong style={{ fontSize: "20px", color: "var(--accent)" }}>1000+</strong>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600" }}>Jobs Completed</span>
          </div>
          <div className="floating-stat-card c3">
            <strong style={{ fontSize: "20px", color: "var(--text)" }}>500+</strong>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600" }}>Local Businesses</span>
          </div>
        </div>
      </section>

      {/* 3. Smart Job Search Bar */}
      <section className="landing-section" id="jobs" style={{ padding: "20px 2rem 60px" }}>
        <div className="search-bar-container">
          <div className="search-input-group">
            <label>Search Jobs</label>
            <input 
              type="text" 
              placeholder="e.g. Waiter, Barista, Tutor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="search-input-group">
            <label>Location</label>
            <input 
              type="text" 
              placeholder="Select City/Area" 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          <div className="search-input-group">
            <label>Category</label>
            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button className="primary-button" style={{ alignSelf: "flex-end", height: "42px" }}>Search Opportunities</button>
        </div>

        {/* Live Jobs Feed */}
        <div style={{ marginTop: "40px" }}>
          <div className="section-heading" style={{ marginBottom: "24px" }}>
            <span className="eyebrow">Available shifts</span>
            <h2>Active Gig Opportunities ({filteredJobs.length})</h2>
          </div>
          {loading && <div className="loading-card">Loading jobs...</div>}
          {error && <p className="form-error">{error}</p>}
          {!loading && !error && (
            <JobCardDeck
              jobs={filteredJobs.slice(0, 8)}
              emptyMessage="No matching active jobs posted yet. Try changing filters!"
            />
          )}
        </div>
      </section>

      {/* 4. Trusted Businesses Carousel */}
      <section className="landing-section" id="businesses" style={{ padding: "40px 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span className="eyebrow" style={{ display: "inline-flex" }}>Trusted partners</span>
          <h2 className="section-title" style={{ fontWeight: "800", marginTop: "8px" }}>Top Businesses Hiring on Shiftlyin</h2>
        </div>
        <div className="logo-carousel-container">
          <div className="logo-carousel-track">
            {["Domino's", "Zomato", "Swiggy", "McDonald's", "Barista", "Radisson", "CCD", "Domino's", "Zomato", "Swiggy", "McDonald's", "Barista", "Radisson", "CCD"].map((brand, i) => (
              <div className="logo-carousel-item" key={i}>
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How Shiftlyin Works */}
      <section className="landing-section" id="how-it-works" style={{ padding: "60px 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="eyebrow" style={{ display: "inline-flex" }}>Workflow</span>
          <h2 className="section-title" style={{ fontWeight: "800", marginTop: "8px" }}>How Shiftlyin Works</h2>
        </div>
        <div className="how-works-grid">
          {[
            { step: "1", title: "Register", desc: "Create your student or business profile in minutes.", icon: "📝", color: "#ebf5ff", details: "Signing up is fast and simple. Choose student to find flexible gigs, or business to hire verified campus talent. Enter your college info or shop registry details to start." },
            { step: "2", title: "Get Verified", desc: "ID audit and verification system completes within hours.", icon: "🛡️", color: "#ecfdf5", details: "To keep our network safe, we audit every signup. Students upload their college ID card. Owners upload basic store registrations. Verifications are finalized within 2 hours." },
            { step: "3", title: "Find or Post Jobs", desc: "Businesses list vacancies; students search live maps.", icon: "🔍", color: "#fff7ed", details: "Businesses define shift timings, hourly rates, and tasks. Students use the smart geofenced search or interactive maps to locate live openings within their commute radius." },
            { step: "4", title: "Apply & Match", desc: "Students apply with one tap. Business owners receive instantly and approve based on reputation scores.", icon: "🤝", color: "#fef2f2", details: "Students apply with one tap. Business owners check candidate ratings, past attendance check-in records, and select the best fit instantly." },
            { step: "5", title: "Coordinate", desc: "Open instant chat channels to share instructions.", icon: "💬", color: "#f5f3ff", details: "Once matching is completed, a private chat room is automatically unlocked. Exchange phone numbers, click to call, or message guidelines before the shift begins." },
            { step: "6", title: "Work & Earn", desc: "Perform shifts, verify via GPS, and secure payout.", icon: "💰", color: "#ecfeff", details: "Check in on-site within 100 meters of geofence. Work the shift, check out via geofence verification, and watch your earnings transfer instantly to your secure Shiftlyin wallet." }
          ].map((item) => (
            <div 
              className="works-card" 
              key={item.step} 
              onClick={() => setActiveStep(item)}
              style={{ cursor: "pointer", border: activeStep?.step === item.step ? "2px solid var(--primary)" : "1px solid var(--border)" }}
            >
              <div className="works-icon" style={{ background: item.color }}>{item.icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>{item.step}. {item.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.5" }}>{item.desc}</p>
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700", marginTop: "8px", display: "inline-block" }}>Learn more →</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Features Section */}
      <section className="landing-section" style={{ padding: "60px 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="eyebrow" style={{ display: "inline-flex" }}>Key features</span>
          <h2 className="section-title" style={{ fontWeight: "800", marginTop: "8px" }}>Engineered for Gig Workers</h2>
        </div>
        <div className="features-grid">
          {[
            { title: "Verified Students", desc: "Manual college ID check gates fake signups.", icon: "🎓", interactive: "mockStudent" },
            { title: "Verified Businesses", desc: "Only legit shops can list vacancies.", icon: "🏪", interactive: "mockBusiness" },
            { title: "GPS Attendance", desc: "100-meter check-in keeps workers honest.", icon: "📍", interactive: "mockGPS" },
            { title: "Real-time Chat", desc: "Instantly coordinate shifts with calling options.", icon: "💬", interactive: "mockChat" },
            { title: "Urgent Hiring", desc: "Emergency slots get broad notified to students.", icon: "🚨", interactive: "mockUrgent" },
            { title: "Reputation Score", desc: "Performance index ratings build campus resumes.", icon: "📈", interactive: "mockScore" },
            { title: "Secure Wallet", desc: "Direct payout transfers safely on checkouts.", icon: "💳", interactive: "mockWallet" },
            { title: "Live Notifications", desc: "Keep updated with instant seen indicators.", icon: "🔔", interactive: "mockNotif" }
          ].map((item) => (
            <div 
              className="feature-card" 
              key={item.title}
              onClick={() => setActiveFeature(item)}
              style={{ cursor: "pointer", border: activeFeature?.title === item.title ? "2px solid var(--primary)" : "1px solid var(--border)" }}
            >
              <span style={{ fontSize: "24px", marginBottom: "12px", display: "block" }}>{item.icon}</span>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px" }}>{item.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.4" }}>{item.desc}</p>
              <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "600", marginTop: "10px", display: "block" }}>Interact →</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Popular Job Categories */}
      <section className="landing-section" style={{ padding: "60px 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="eyebrow" style={{ display: "inline-flex" }}>Explore gigs</span>
          <h2 className="section-title" style={{ fontWeight: "800", marginTop: "8px" }}>Popular Job Categories</h2>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              className="category-card" 
              key={cat.id}
              onClick={() => {
                setSearchCategory(cat.id);
                document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span style={{ fontSize: "32px", marginBottom: "12px", display: "block" }}>{cat.icon}</span>
              <strong style={{ fontSize: "14px", color: "var(--text)" }}>{cat.name}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Why Choose Shiftlyin */}
      <section className="landing-section hero-split" id="about" style={{ padding: "80px 2rem" }}>
        <div style={{ order: 2 }}>
          <span className="eyebrow">Platform advantages</span>
          <h2 className="section-title" style={{ fontWeight: "800", margin: "12px 0 20px" }}>Why Choose Shiftlyin</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "16px" }}>
            {[
              { t: "Instant Hiring", d: "Fill empty vacancies in under 30 minutes." },
              { t: "Trusted Workers", d: "College verification guarantees responsible gigs." },
              { t: "Live Chat & Calling", d: "Communicate directly inside the integrated console." },
              { t: "GPS Attendance", d: "Restricts payouts unless workers are on-premise." },
              { t: "Nearby Gigs", d: "Find vacancies located closest to your campus." },
              { t: "Reputation Index", d: "Students build solid professional records." }
            ].map((check) => (
              <li key={check.t} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", fontWeight: "bold" }}>✓</span>
                <div>
                  <strong style={{ display: "block", fontSize: "15px" }}>{check.t}</strong>
                  <span style={{ color: "var(--muted)", fontSize: "13px" }}>{check.d}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: "var(--surface-soft)", borderRadius: "var(--radius-xl)", padding: "clamp(20px, 6vw, 40px)", display: "flex", flexDirection: "column", gap: "24px", order: 1 }}>
          <div style={{ padding: "20px", background: "var(--surface)", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ background: "rgba(37,99,235,0.1)", color: "var(--primary)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>STUDENTS</span>
            <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: "1.5" }}>"I can easily fund my fees and weekend food bills without getting tied down by full-time hours."</p>
          </div>
          <div style={{ padding: "20px", background: "var(--surface)", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>BUSINESS OWNERS</span>
            <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: "1.5" }}>"A student checked out earlier. Vacancy was updated immediately. Outstanding database integrity."</p>
          </div>
        </div>
      </section>

      {/* 9. Statistics */}
      <section className="landing-section" style={{ padding: "40px 2rem" }}>
        <div className="how-works-grid">
          {[
            { val: "5,000+", label: "Verified Students", color: "linear-gradient(135deg, #eff6ff, #dbeafe)" },
            { val: "500+", label: "Trusted Businesses", color: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
            { val: "1,000+", label: "Successful Matches", color: "linear-gradient(135deg, #fffbeb, #fef3c7)" },
            { val: "99.2%", label: "GPS Accuracy", color: "linear-gradient(135deg, #f5f3ff, #ede9fe)" }
          ].map((stat) => (
            <div key={stat.label} style={{ background: stat.color, borderRadius: "16px", padding: "30px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <strong style={{ fontSize: "36px", fontWeight: "900", color: "#111827", display: "block" }}>{stat.val}</strong>
              <span style={{ fontSize: "13px", color: "#4b5563", fontWeight: "700" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Testimonials */}
      <section className="landing-section" style={{ padding: "60px 2rem", textAlign: "center" }}>
        <span className="eyebrow" style={{ display: "inline-flex" }}>Testimonials</span>
        <h2 style={{ fontSize: "36px", fontWeight: "800", margin: "8px 0 40px" }}>Reviews from Shiftlyiners</h2>
        
        <div style={{ maxWidth: "700px", margin: "0 auto", minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "clamp(20px, 6vw, 40px)", boxShadow: "var(--shadow)", position: "relative" }}>
          <div style={{ fontSize: "28px", color: "var(--primary)", marginBottom: "15px" }}>★★★★★</div>
          <p style={{ fontSize: "1.15rem", lineHeight: "1.6", fontStyle: "italic", margin: 0 }}>
            "{testimonials[activeTestimonial].text}"
          </p>
          <strong style={{ display: "block", marginTop: "20px", fontSize: "16px", color: "var(--text)" }}>
            {testimonials[activeTestimonial].author}
          </strong>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            {testimonials[activeTestimonial].role}
          </span>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
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
                  cursor: "pointer"
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ Accordion */}
      <section className="landing-section" id="faq" style={{ padding: "60px 2rem", maxWidth: "800px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="eyebrow" style={{ display: "inline-flex" }}>FAQ</span>
          <h2 className="section-title" style={{ fontWeight: "800", marginTop: "8px" }}>Frequently Asked Questions</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div className="accordion-item" key={idx}>
                <button 
                  className="accordion-header"
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: "18px" }}>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="accordion-body">
                    <p style={{ margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. Mobile App Promotion */}
      <section className="landing-section" style={{ padding: "60px 2rem" }}>
        <div className="app-promo-banner">
          <div>
            <h2 style={{ fontSize: "36px", fontWeight: "900", margin: "0 0 16px" }}>Shiftlyin on the Go</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "600px" }}>
              Download our mobile application to get instant push notifications, real-time GPS shift check-in prompts, and direct payout notifications.
            </p>
            <span style={{ display: "block", marginTop: "24px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#fbbf24" }}>Download App (Coming Soon)</span>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button className="primary-button" style={{ background: "black", borderColor: "#333", color: "white", fontSize: "12px" }} disabled>Google Play</button>
              <button className="primary-button" style={{ background: "black", borderColor: "#333", color: "white", fontSize: "12px" }} disabled>App Store</button>
            </div>
          </div>
          <div style={{ background: "white", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "160px", boxShadow: "0 10px 15px rgba(0,0,0,0.2)" }}>
            {/* Mock QR Code */}
            <div style={{ width: "120px", height: "120px", background: "#f1f5f9", display: "grid", placeItems: "center", border: "2px solid #ccc", color: "#000", fontWeight: "800", fontSize: "11px", textAlign: "center" }}>QR CODE</div>
            <span style={{ fontSize: "10px", color: "#1e293b", fontWeight: "700" }}>Scan to Download</span>
          </div>
        </div>
      </section>

      {/* 13. Final CTA */}
      <section className="landing-section" style={{ padding: "60px 2rem" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white", padding: "60px 40px", borderRadius: "var(--radius-xl)", textAlign: "center" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "900", margin: "0 0 16px" }}>Ready to Start Your Journey?</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "30px" }}>Join the Shiftlyin network today and unlock campus opportunities or trusted local worker pools.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="primary-button" to="/register" style={{ minWidth: "220px", background: "var(--primary)" }}>Register as Student</Link>
            <Link className="primary-button" to="/register" style={{ minWidth: "220px", background: "var(--accent)", borderColor: "var(--accent)" }}>Register as Business</Link>
          </div>
        </div>
      </section>

      {/* 14. Premium Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface-soft)", padding: "60px 2rem 40px" }}>
        <div className="landing-section" style={{ padding: 0 }}>
          <div className="footer-grid">
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text)", margin: "0 0 16px" }}>Shiftlyin</h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.6", margin: 0 }}>
                Find Jobs. Fit Future. Connecting students with verified part-time shifts and jobs nearby.
              </p>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "14px", margin: "0 0 16px" }}>Students</strong>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px", fontSize: "13px" }}>
                <li><Link to="/register" style={{ color: "var(--muted)" }}>Search shifts</Link></li>
                <li><Link to="/help" style={{ color: "var(--muted)" }}>Student FAQ</Link></li>
                <li><Link to="/login" style={{ color: "var(--muted)" }}>Verification guide</Link></li>
              </ul>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "14px", margin: "0 0 16px" }}>Businesses</strong>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px", fontSize: "13px" }}>
                <li><Link to="/register" style={{ color: "var(--muted)" }}>Post vacancy</Link></li>
                <li><Link to="/help" style={{ color: "var(--muted)" }}>Business FAQ</Link></li>
                <li><Link to="/login" style={{ color: "var(--muted)" }}>Verification requirements</Link></li>
              </ul>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "14px", margin: "0 0 16px" }}>Company</strong>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px", fontSize: "13px" }}>
                <li><a href="/#about" style={{ color: "var(--muted)" }}>About us</a></li>
                <li><a href="/#how-it-works" style={{ color: "var(--muted)" }}>How it works</a></li>
                <li><Link to="/help" style={{ color: "var(--muted)" }}>Help center</Link></li>
              </ul>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", marginTop: "40px", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "var(--muted)" }}>
            <span>© 2026 Shiftlyin. All rights reserved.</span>
            <div style={{ display: "flex", gap: "20px" }}>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>LinkedIn</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>Instagram</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 15. Interactive Detail Modal */}
      {(activeStep || activeFeature) && (
        <div 
          onClick={() => { setActiveStep(null); setActiveFeature(null); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              padding: "30px",
              boxShadow: "var(--shadow)",
              color: "var(--text)"
            }}
          >
            {activeStep && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "32px" }}>{activeStep.icon}</span>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>Step {activeStep.step}</span>
                    <h3 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>{activeStep.title}</h3>
                  </div>
                </div>
                <p style={{ color: "var(--text)", lineHeight: "1.6", fontSize: "15px" }}>
                  {activeStep.details}
                </p>
                <div style={{ borderTop: "1px solid var(--border)", marginTop: "24px", paddingTop: "16px", textAlign: "right" }}>
                  <button onClick={() => setActiveStep(null)} className="primary-button" style={{ padding: "8px 16px", minHeight: "36px", fontSize: "13px" }}>Got it</button>
                </div>
              </div>
            )}

            {activeFeature && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "32px" }}>{activeFeature.icon}</span>
                  <h3 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>{activeFeature.title}</h3>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "20px" }}>{activeFeature.desc}</p>
                
                {/* Dynamic Mockup Widgets */}
                <div style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Interactive Live Demo</span>
                  
                  {activeFeature.interactive === "mockStudent" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", background: "var(--primary)", color: "white", borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: "800" }}>AS</div>
                      <div>
                        <strong style={{ display: "block", fontSize: "14px" }}>Aman Sharma <span style={{ color: "#10b981", fontSize: "12px" }}>● Verified</span></strong>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>Delhi University • Delhi, IN</span>
                      </div>
                    </div>
                  )}

                  {activeFeature.interactive === "mockBusiness" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", background: "var(--accent)", color: "white", borderRadius: "12px", display: "grid", placeItems: "center", fontWeight: "800" }}>☕</div>
                      <div>
                        <strong style={{ display: "block", fontSize: "14px" }}>Café Mocha <span style={{ color: "#10b981", fontSize: "12px" }}>● Active Merchant</span></strong>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>Reg ID: MCA-9812-DL • Verified</span>
                      </div>
                    </div>
                  )}

                  {activeFeature.interactive === "mockGPS" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span>GPS Geofence:</span>
                        <strong style={{ color: "var(--accent)" }}>Inside geofence</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px" }}>
                        <span>Distance:</span>
                        <strong>42 meters from store</strong>
                      </div>
                      <button className="primary-button" style={{ width: "100%", minHeight: "36px", fontSize: "12px", background: "#10b981", borderColor: "#10b981" }} onClick={() => alert("Mock Check-In successful!")}>Tap to Check-In</button>
                    </div>
                  )}

                  {activeFeature.interactive === "mockChat" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ background: "var(--surface)", padding: "10px", borderRadius: "8px", maxWidth: "80%", alignSelf: "flex-start", fontSize: "12px" }}>
                        Hey Aman, are you ready for the Sunday Barista shift?
                      </div>
                      <div style={{ background: "var(--primary)", color: "white", padding: "10px", borderRadius: "8px", maxWidth: "80%", alignSelf: "flex-end", fontSize: "12px" }}>
                        Yes, Rajesh. I am on my way!
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--muted)", alignSelf: "flex-end" }}>Seen ✓</span>
                    </div>
                  )}

                  {activeFeature.interactive === "mockUrgent" && (
                    <div style={{ borderLeft: "4px solid #ef4444", paddingLeft: "12px" }}>
                      <strong style={{ color: "#ef4444", display: "block", fontSize: "14px" }}>🚨 Urgent: 2 Openings</strong>
                      <span style={{ display: "block", fontSize: "13px", margin: "4px 0" }}>Domino's Barista shift starting in 1 hour.</span>
                      <strong style={{ fontSize: "12px", color: "var(--accent)" }}>₹250/Hour + Free Meal</strong>
                    </div>
                  )}

                  {activeFeature.interactive === "mockScore" && (
                    <div style={{ textAlign: "center" }}>
                      <strong style={{ fontSize: "28px", color: "var(--primary)" }}>98/100</strong>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--muted)", margin: "4px 0 10px" }}>Reputation Rating: Excellent</span>
                      <span style={{ color: "#f59e0b", fontSize: "18px" }}>★★★★★ (12 Shifts Completed)</span>
                    </div>
                  )}

                  {activeFeature.interactive === "mockWallet" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>SHIFTLYIN WALLET BALANCE</span>
                          <strong style={{ fontSize: "20px" }}>₹2,400.00</strong>
                        </div>
                        <span style={{ background: "#ecfdf5", color: "#10b981", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>Secured</span>
                      </div>
                      <button 
                        className="primary-button" 
                        style={{ width: "100%", minHeight: "36px", fontSize: "12px" }}
                        onClick={(e) => {
                          e.target.innerText = "Transferred to UPI! ✓";
                          e.target.style.background = "#10b981";
                          e.target.style.borderColor = "#10b981";
                        }}
                      >
                        Withdraw to Bank
                      </button>
                    </div>
                  )}

                  {activeFeature.interactive === "mockNotif" && (
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ fontSize: "24px" }}>🔔</span>
                      <div style={{ fontSize: "12px" }}>
                        <strong>Application Accepted</strong>
                        <p style={{ margin: "2px 0 0", color: "var(--muted)" }}>Rajesh Mehra accepted your application for Cafe Assistant shift.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", textAlign: "right" }}>
                  <button onClick={() => setActiveFeature(null)} className="primary-button" style={{ padding: "8px 16px", minHeight: "36px", fontSize: "13px" }}>Close Demo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
