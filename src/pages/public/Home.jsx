import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/hustlr-cafe-hero.png";

/* ── Scroll Reveal ── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`scroll-reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/* ── Data ── */
const BRANDS = ["Café Coffee Day", "Domino's", "Barista", "McDonald's", "Zomato", "Swiggy", "Radisson"];

const STEPS = [
  { num: "1", icon: "👤", title: "Register", desc: "Sign up as a Student or Business." },
  { num: "2", icon: "✅", title: "Get Verified", desc: "Our team verifies your account." },
  { num: "3", icon: "📋", title: "Find or Post Jobs", desc: "Students find jobs. Businesses post jobs." },
  { num: "4", icon: "📨", title: "Apply & Connect", desc: "Students apply. Businesses review." },
  { num: "5", icon: "💬", title: "Chat & Coordinate", desc: "Once accepted, chat opens." },
  { num: "6", icon: "💰", title: "Work & Earn", desc: "Check-in, complete work & get paid." },
];

const WHY = [
  { icon: "🛡️", title: "Verified Users", desc: "Every student and business is verified." },
  { icon: "📍", title: "GPS Attendance", desc: "Check-in and check-out with location." },
  { icon: "💬", title: "Real-time Chat", desc: "Communicate easily within the platform." },
  { icon: "📌", title: "Nearby Jobs", desc: "Find jobs near your location." },
  { icon: "⭐", title: "Ratings & Reviews", desc: "Build reputation with ratings." },
  { icon: "💳", title: "Secure Payments", desc: "Future ready wallet and payments." },
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
  { q: "How do I register on Shiftlyin?", a: "Click 'Get Started', choose your role (Student or Business), fill in the details, upload required documents, and submit. Our team will verify within 24 hours." },
  { q: "How does GPS attendance work?", a: "When you arrive at the shift location, the app checks your GPS coordinates. You can only clock in if you're within 100 meters of the business location." },
  { q: "Is Shiftlyin free to use?", a: "Yes! Shiftlyin is completely free for students. Businesses pay a small 10% commission on successful shift completions." },
  { q: "How will I get paid?", a: "Earnings are deposited to your Shiftlyin digital wallet after shift completion and business confirmation. You can withdraw anytime." },
  { q: "How does verification work?", a: "We verify Aadhaar, PAN, college ID for students, and business registration documents for businesses. This ensures a safe platform for everyone." },
  { q: "Can I work in multiple jobs?", a: "Yes! You can apply to multiple shifts as long as they don't overlap in timing. Our system prevents double-booking automatically." },
];

const STUDENT_TESTIMONIAL = {
  name: "Rohit Sharma", role: "BCA Student", stars: 5, avatar: "RS", color: "#2563eb",
  quote: "HUSTLR helped me find part-time work that fits my class schedule perfectly. The platform is easy to use and very reliable."
};

const BIZ_TESTIMONIAL = {
  name: "Ankit Verma", role: "Restaurant Owner", stars: 5, avatar: "AV", color: "#f59e0b",
  quote: "We get verified and hardworking students within minutes. HUSTLR has made hiring so simple and efficient for our restaurant."
};

/* ════════════════════════════════════════
   HOME COMPONENT
   ════════════════════════════════════════ */
export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="landing-page">

      {/* ═══ HERO ═══ */}
      <section className="hero-grid">
        <div className="hero-text">
          <span className="hero-pill">🎓 Earn While You Learn</span>
          <h1 className="hero-h1">Find Part-Time Jobs<br />Near You</h1>
          <p className="hero-p">
            Shiftlyin connects college students with trusted businesses for flexible, part-time opportunities.
          </p>
          <div className="hero-btns">
            <Link to="/register" className="btn-primary">🔍 Find Jobs Near You</Link>
            <Link to="/register" className="btn-outline">📋 Post a Job</Link>
          </div>
          <div className="hero-trust">
            <span>Verified Students</span>
            <span>Trusted Businesses</span>
            <span>Safe & Secure</span>
          </div>
        </div>
        <div className="hero-img-wrap">
          <img src={heroImage} alt="Students working at a café" loading="eager" width="500" height="375" />
          <div className="float-card">
            <div><strong>5000+</strong><br /><span>Students</span></div>
          </div>
          <div className="float-card">
            <div><strong>1000+</strong><br /><span>Jobs Posted</span></div>
          </div>
          <div className="float-card">
            <div><strong>500+</strong><br /><span>Businesses</span></div>
          </div>
        </div>
      </section>

      {/* ═══ SEARCH BAR ═══ */}
      <div className="search-strip">
        <div className="search-bar">
          <input type="text" placeholder="🔍 Search job title or keyword" />
          <select><option>Select Location</option><option>Delhi</option><option>Mumbai</option><option>Bangalore</option></select>
          <select><option>Select Category</option>{CATEGORIES.map(c => <option key={c.label}>{c.label}</option>)}</select>
          <button className="search-btn">Search Jobs →</button>
        </div>
      </div>

      {/* ═══ TRUSTED BY ═══ */}
      <section className="land-section">
        <Reveal>
          <div className="land-center">
            <h2 className="land-heading">Trusted by 500+ Businesses</h2>
          </div>
          <div className="brands-row">
            {BRANDS.map(b => <span key={b}>{b}</span>)}
            <span style={{ color: "var(--primary)", cursor: "pointer" }}>+ More</span>
          </div>
        </Reveal>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="land-section" id="how-it-works">
        <Reveal>
          <div className="land-center">
            <h2 className="land-heading">How Shiftlyin Works?</h2>
          </div>
        </Reveal>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="step-card">
                <div className="step-num-row">
                  <div className="step-num">{s.num}</div>
                  <span className="step-icon">{s.icon}</span>
                </div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ WHY CHOOSE ═══ */}
      <section className="land-section" id="features" style={{ background: "var(--surface-soft)", borderRadius: "24px" }}>
        <Reveal>
          <div className="land-center">
            <h2 className="land-heading">Why Choose Shiftlyin?</h2>
          </div>
        </Reveal>
        <div className="why-grid">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 70}>
              <div className="why-item">
                <div className="why-circle">{w.icon}</div>
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ CATEGORIES + IMPACT ═══ */}
      <section className="land-section" id="students">
        <Reveal>
          <div className="cat-impact-grid">
            <div>
              <h3 className="land-heading" style={{ fontSize: "1.3rem", marginBottom: "1.25rem" }}>Popular Job Categories</h3>
              <div className="cat-icons">
                {CATEGORIES.map(c => (
                  <div className="cat-item" key={c.label}>
                    <span className="cat-emoji">{c.emoji}</span>
                    <span className="cat-label">{c.label}</span>
                  </div>
                ))}
              </div>
              <a href="#how-it-works" className="view-all-link">View All Categories →</a>
            </div>
            <div>
              <h3 className="land-heading" style={{ fontSize: "1.3rem", marginBottom: "1.25rem" }}>Our Impact in Numbers</h3>
              <div className="impact-grid">
                <div className="impact-card"><strong>5000+</strong><span>Students</span></div>
                <div className="impact-card"><strong>500+</strong><span>Businesses</span></div>
                <div className="impact-card"><strong>1000+</strong><span>Jobs Posted</span></div>
                <div className="impact-card"><strong>3000+</strong><span>Successful Hirings</span></div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="land-section" id="businesses">
        <Reveal>
          <div className="test-split">
            <div className="test-box">
              <h3>What Students Say</h3>
              <TestCard t={STUDENT_TESTIMONIAL} />
            </div>
            <div className="test-box">
              <h3>What Businesses Say</h3>
              <TestCard t={BIZ_TESTIMONIAL} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ FAQ + MOBILE PROMO ═══ */}
      <section className="land-section" id="faq">
        <Reveal>
          <div className="faq-split">
            <div>
              <h3 className="land-heading" style={{ fontSize: "1.3rem", marginBottom: "1.25rem" }}>Frequently Asked Questions</h3>
              <div className="faq-grid">
                {FAQS.map((f, i) => (
                  <div className="faq-item" key={i}>
                    <button
                      className={`faq-q ${openFaq === i ? "open" : ""}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {f.q}
                    </button>
                    <div className={`faq-a ${openFaq === i ? "open" : ""}`}>{f.a}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mobile-promo">
              <div className="phone-mock">📱</div>
              <h3>Shiftlyin Coming Soon on Mobile</h3>
              <p>Scan the QR code to get the app when we launch!</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ CTA ═══ */}
      <div className="cta-strip">
        <div className="cta-inner">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of students and businesses already growing with Shiftlyin.</p>
          <div className="cta-btns">
            <Link to="/register" className="btn-cta-student">Register as Student</Link>
            <Link to="/register" className="btn-cta-biz">Register as Business</Link>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="land-footer" id="contact">
        <div className="footer-wrap">
          <div className="footer-cols">
            <div className="footer-brand-col">
              <strong>🏢 Shiftlyin</strong>
              <p>Connecting students with opportunities and businesses with talent.</p>
              <div className="social-row">
                <a href="#" aria-label="Facebook">f</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="YouTube">▶</a>
              </div>
            </div>

            <div className="footer-link-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#hero">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#businesses">Businesses</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-link-col">
              <h4>For Students</h4>
              <ul>
                <li><Link to="/register">Find Jobs</Link></li>
                <li><Link to="/login">My Applications</Link></li>
                <li><Link to="/login">Chat</Link></li>
                <li><Link to="/login">Profile</Link></li>
                <li><Link to="/help">Help Center</Link></li>
              </ul>
            </div>

            <div className="footer-link-col">
              <h4>For Businesses</h4>
              <ul>
                <li><Link to="/register">Post a Job</Link></li>
                <li><Link to="/login">My Jobs</Link></li>
                <li><Link to="/login">Applications</Link></li>
                <li><Link to="/login">Workers</Link></li>
                <li><Link to="/login">Business Profile</Link></li>
              </ul>
            </div>

            <div className="footer-link-col">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">FAQ</Link></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
                <li><a href="#">Refund Policy</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            <div className="newsletter-col">
              <h4>Newsletter</h4>
              <p>Subscribe to get latest jobs and updates.</p>
              <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer-line">
            © {new Date().getFullYear()} Shiftlyin. All Rights Reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ── Testimonial Card ── */
function TestCard({ t }) {
  return (
    <div className="test-card">
      <div className="test-stars">{"★".repeat(t.stars)}</div>
      <blockquote>{t.quote}</blockquote>
      <div className="test-author">
        <div className="test-avatar" style={{ background: t.color }}>{t.avatar}</div>
        <div>
          <strong>— {t.name}</strong>
          <span>{t.role}</span>
        </div>
      </div>
    </div>
  );
}
