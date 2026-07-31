import React, { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import SeoHead from "../../components/seo/SeoHead.jsx";
import { AnalyticsEvents } from "../../utils/analytics.js";

const SERVICES_DATA = {
  "part-time-jobs": {
    title: "Part-Time Jobs for Students | Flexible Shifts near College",
    h1: "Part-Time Jobs & Flexible Shifts for College Students",
    subtitle: "Earn competitive hourly pay fitting around your class schedules with verified local businesses.",
    metaDesc: "Find verified part-time jobs for college students near your campus. Flexible evening, weekend, and hourly shifts with instant GPS check-ins & guaranteed payouts on Shiftlyin.",
    keywords: "student part-time jobs, campus gig jobs, flexible student shifts, college part time work, hourly student jobs",
    icon: "🎓",
    badge: "For Students",
    overview: "Shiftlyin empowers college students to discover flexible, verified part-time gigs near their campus or residence. Choose shifts that fit your lecture timetable, gain real work experience, and earn guaranteed income.",
    benefits: [
      { title: "Flexibility First", desc: "Select shifts on weekends, evenings, or free lecture slots without compromising studies." },
      { title: "Verified Employers", desc: "Work only with admin-verified local cafes, restaurants, shops, and event organizers." },
      { title: "Instant GPS Check-in", desc: "Clock in seamlessly at the workplace location using our geofenced mobile verification." },
      { title: "Guaranteed Payouts", desc: "Funds are reserved in escrow before shift start, ensuring reliable payments." },
    ],
    steps: [
      "Create your free student account & complete quick 18+ ID verification.",
      "Browse nearby verified part-time shifts tailored to your location & availability.",
      "Apply with 1-click and get instant shift approval notifications.",
      "Check in at workplace via GPS and receive funds directly into your wallet."
    ],
    faqs: [
      { q: "How much can a student earn on Shiftlyin?", a: "Earnings depend on shift duration and role complexity, ranging typically between ₹400 to ₹1,500 per shift." },
      { q: "What age is required to join as a student?", a: "Students must be at least 18 years old and possess valid identity proof (Aadhaar, PAN, DL, or Voter ID)." },
      { q: "Can I manage shifts around college exam schedules?", a: "Yes! Shiftlyin gives you total freedom to apply only when you have free time." }
    ]
  },
  "student-hiring": {
    title: "Hire Verified Students | Campus Talent Sourcing Platform",
    h1: "Hire Verified Campus Talent & On-Demand Student Staff",
    subtitle: "Fill shift vacancies in minutes with energetic, ID-verified local college students.",
    metaDesc: "Hire verified college students for your business, restaurant, cafe, or event. Post shift requirements and access ID-verified local talent on Shiftlyin.",
    keywords: "hire college students, campus staffing, student hiring platform, temp staff hiring, shift hiring india",
    icon: "🏬",
    badge: "For Businesses",
    overview: "Shiftlyin connects business owners directly with vetted, enthusiastic college students seeking part-time work. Perfect for peak weekend rushes, promotional events, store launches, and staff coverages.",
    benefits: [
      { title: "Zero Lock-in Contracts", desc: "Hire staff on an as-needed shift basis without heavy agency retainers." },
      { title: "Strict Identity Screening", desc: "Every student profile is verified with government identity credentials." },
      { title: "Fast Replacement", desc: "Post a shift and review qualified applicants within minutes." },
      { title: "Performance Rating", desc: "View ratings & reviews from other local businesses before accepting candidates." },
    ],
    steps: [
      "Register your business & upload basic shop/license details.",
      "Post a shift specifying date, time, salary, and required headcount.",
      "Review applicant profiles, ratings, and accept suitable candidates.",
      "Track live GPS attendance when staff arrives at your venue."
    ],
    faqs: [
      { q: "How fast can I get staff for a weekend rush?", a: "Most shifts posted on Shiftlyin receive qualified student applicants within 15 to 30 minutes." },
      { q: "How is payment handled?", a: "You load your wallet prior to shift start. Funds are automatically transferred upon shift completion." }
    ]
  },
  "restaurant-hiring": {
    title: "Restaurant & Cafe Staffing | Hire Waitstaff, Baristas & Kitchen Helpers",
    h1: "On-Demand Restaurant & Cafe Staffing Solutions",
    subtitle: "Overcome staff shortages during lunch, dinner, and weekend peak hours.",
    metaDesc: "Hire waitstaff, baristas, cashiers, and kitchen helpers for your restaurant or cafe on flexible shifts with Shiftlyin.",
    keywords: "restaurant staffing, cafe hiring, hire waitstaff, barista jobs, kitchen helpers, food service shift jobs",
    icon: "☕",
    badge: "Hospitality & Dining",
    overview: "Food and beverage businesses experience unpredictable surge hours. Shiftlyin lets restaurant managers hire qualified student servers, cashiers, baristas, and kitchen assistants for precise peak windows.",
    benefits: [
      { title: "Peak Hour Coverage", desc: "Hire extra hands specifically for 3-hour lunch or dinner rushes." },
      { title: "Cost Efficiency", desc: "Reduce full-time salary overheads by leveraging flexible shift workers." },
      { title: "Hygiene & ID Verified", desc: "All workers pass identity verification and safety compliance guidelines." },
      { title: "Instant Booking", desc: "Book recurring or emergency shift staff with a few clicks." },
    ],
    steps: [
      "Post a restaurant shift with shift timing & hourly pay.",
      "Select student applicants with prior cafe/restaurant experience.",
      "Students check in at your restaurant using GPS geofencing.",
      "Rate the student's performance after shift completion."
    ],
    faqs: [
      { q: "Can I re-hire students who worked well at my cafe?", a: "Yes! You can mark favorite students and invite them directly for future shifts." }
    ]
  },
  "event-staffing": {
    title: "Event Staffing & Promoters | Hire Event Crew & Brand Ambassadors",
    h1: "Event Crew, Promoters & Brand Ambassadors Staffing",
    subtitle: "Energetic student talent for exhibitions, trade shows, concerts, and brand activations.",
    metaDesc: "Hire event crew, ushering staff, ticketing agents, and brand promoters. On-demand student staffing for events and exhibitions on Shiftlyin.",
    keywords: "event staffing, event crew hiring, brand promoters, exhibition staff, college event promoters",
    icon: "🎟️",
    badge: "Events & Exhibitions",
    overview: "Organizing an exhibition, college fest, or promotional campaign? Access hundreds of dynamic student promoters, registration desk managers, and crowd assistants through Shiftlyin.",
    benefits: [
      { title: "High Energy Talent", desc: "Young, articulate college students eager to represent your brand professionally." },
      { title: "Scalable Headcount", desc: "Hire anywhere from 2 to 50+ event staff seamlessly for multi-day events." },
      { title: "Geo-Verified Presence", desc: "Monitor live arrival times across multi-stage event venues." },
      { title: "Simplified Payroll", desc: "Single wallet invoice for your entire event staffing team." },
    ],
    steps: [
      "Post event job details with location, dates, and dress code instructions.",
      "Filter applicants based on communication skills and event experience.",
      "Manage real-time check-ins on event day via GPS.",
      "Disburse bulk payouts automatically upon event wrap-up."
    ],
    faqs: [
      { q: "Can we hire staff for multi-day conventions?", a: "Absolutely. You can schedule multi-day shifts with consistent student teams." }
    ]
  },
  "shift-jobs": {
    title: "Temporary Shift Jobs | Hourly Flexible Gig Work",
    h1: "Temporary & Flexible Hourly Shift Jobs",
    subtitle: "Work when you want, where you want. No long-term commitments required.",
    metaDesc: "Discover temporary shift jobs with transparent hourly pay. Choose short shifts at nearby cafes, retail stores, and events with Shiftlyin.",
    keywords: "temp shift jobs, hourly gig work, flexible shift jobs, short term part time jobs, daily payout jobs",
    icon: "⏱️",
    badge: "Gig Economy",
    overview: "Temporary shift jobs offer total schedule autonomy. Work 4 hours today, take tomorrow off for college assignments, and earn competitive hourly rates without binding contracts.",
    benefits: [
      { title: "Complete Independence", desc: "Accept only the shifts that fit your personal daily schedule." },
      { title: "Transparent Wages", desc: "View total pay, shift hours, and location upfront before applying." },
      { title: "Skill Building", desc: "Gain experience across customer service, retail sales, hospitality, and event management." },
      { title: "Fast Verification", desc: "Get onboarded within 24 hours with government ID submission." },
    ],
    steps: [
      "Explore open shift listings sorted by distance from your location.",
      "Check shift requirements, pay rate, and workplace reviews.",
      "Tap 'Apply Shift' and receive confirmation when accepted.",
      "Complete shift, check out, and receive your wages."
    ],
    faqs: [
      { q: "What happens if a shift is canceled?", a: "Shiftlyin cancellation policies protect workers when employers cancel within short notice windows." }
    ]
  },
  "retail-jobs": {
    title: "Retail & Store Helpers | Hire Retail Sales Assistants",
    h1: "Retail Store Helpers & Sales Assistants",
    subtitle: "Support your retail shop during festive seasons, inventory audits, and sales surges.",
    metaDesc: "Hire retail helpers, stock room assistants, and sales helpers for stores & supermarkets. Flexible retail staffing on Shiftlyin.",
    keywords: "retail store jobs, sales helper hiring, store assistants, retail shift work, inventory helpers",
    icon: "🛍️",
    badge: "Retail & Commerce",
    overview: "Retail stores face heavy customer footfalls during weekends and holiday seasons. Shiftlyin connects store managers with reliable student helpers to assist with floor sales, inventory stocking, and billing queues.",
    benefits: [
      { title: "Seasonal Surge Staffing", desc: "Scale up store staff during Diwali, New Year, or end-of-season sales." },
      { title: "Inventory & Stock Help", desc: "Hire extra hands for overnight stock takes and display setup." },
      { title: "Customer Assistance", desc: "Polite student helpers to guide shoppers and manage fitting rooms." },
      { title: "Transparent Billing", desc: "Clear hourly rates with zero hidden commission fees." },
    ],
    steps: [
      "Create a retail shift listing with date, hours, and task description.",
      "Approve student applicants based on proximity and store experience.",
      "Verify worker attendance via GPS check-in at store location.",
      "Complete payment via Shiftlyin secure wallet system."
    ],
    faqs: [
      { q: "Can students help with store stock count?", a: "Yes, many retail partners hire students specifically for inventory auditing shifts." }
    ]
  },
  "gps-attendance": {
    title: "GPS Geofenced Attendance | Real-Time Shift Location Verification",
    h1: "GPS Geofenced Attendance & Shift Verification System",
    subtitle: "Prevent buddy punching and ensure 100% accurate physical workplace check-ins.",
    metaDesc: "Shiftlyin's GPS geofenced attendance system ensures real-time check-in verification for students and business owners with zero hardware required.",
    keywords: "gps attendance system, geofenced shift checkin, real time attendance tracking, remote workplace verification",
    icon: "📍",
    badge: "Platform Security",
    overview: "Shiftlyin integrates browser-level high-precision GPS geofencing. Students can only clock in when physically present within the designated radius of the employer's business location.",
    benefits: [
      { title: "Zero Hardware Costs", desc: "Works directly on any smartphone browser without biometric devices." },
      { title: "Precise Distance Math", desc: "Uses Haversine formula calculation to measure exact distance to venue." },
      { title: "Automated Timesheets", desc: "Calculates exact start time, end time, and total shift duration automatically." },
      { title: "Dispute Reduction", desc: "Eliminates attendance disputes between workers and business managers." },
    ],
    steps: [
      "Employer sets business latitude & longitude during registration.",
      "Student arrives at venue and clicks 'GPS Check-In' on Shiftlyin.",
      "System verifies student location matches business geofence radius.",
      "Attendance status turns green and shift timer commences."
    ],
    faqs: [
      { q: "What if GPS location accuracy is low?", a: "The system requests high-accuracy location permissions and alerts the user if location access is disabled." }
    ]
  },
  "wallet-payments": {
    title: "Escrow Wallet & Payouts | Secure Shift Wage Settlement",
    h1: "Escrow Wallet & Automated Shift Payout System",
    subtitle: "Transparent wage distribution with pre-funded escrow protection for workers and employers.",
    metaDesc: "Secure shift wage settlements powered by Shiftlyin Escrow Wallet. Pre-funded shift budgets guarantee instant payouts for verified student work.",
    keywords: "escrow shift payments, automated wage payout, secure worker wallet, shiftlyin wallet",
    icon: "💳",
    badge: "Fintech Security",
    overview: "Financial trust is crucial for gig workers and business owners. Shiftlyin features an Escrow Wallet mechanism where business owners pre-fund shift payouts before job posting, guaranteeing payment upon successful shift completion.",
    benefits: [
      { title: "Payment Assurance", desc: "Students know funds are secured in escrow before starting work." },
      { title: "Instant Transfer", desc: "Wages credit directly to student wallet upon shift completion approval." },
      { title: "Detailed Statements", desc: "Clear breakdown of shift earnings, transaction history, and tax invoices." },
      { title: "Zero Surprise Charges", desc: "Upfront transparent pricing for employers and zero registration fee for students." },
    ],
    steps: [
      "Business owner adds funds to Shiftlyin employer wallet.",
      "Shift budget is locked in escrow when a job is posted.",
      "Student completes shift and GPS checkout is verified.",
      "Escrow funds transfer automatically to student's balance."
    ],
    faqs: [
      { q: "How can students withdraw wallet money?", a: "Students can request direct bank account or UPI transfer anytime from their dashboard." }
    ]
  },
  "identity-verification": {
    title: "18+ Identity Verification | Government ID Audit System",
    h1: "18+ Identity Verification & Campus Credential Screening",
    subtitle: "Ensuring 100% legal, adult, and verified worker onboarding for every shift.",
    metaDesc: "Learn about Shiftlyin's 18+ identity verification process using Aadhaar, PAN, Driving License, and Voter ID screening for safe campus hiring.",
    keywords: "identity verification, 18 plus age verification, aadhaar pan screening, student background check, secure hiring",
    icon: "🛡️",
    badge: "Safety & Compliance",
    overview: "Safety and legal compliance are fundamental to Shiftlyin. Every student registering on the platform must pass strict 18+ age verification using official Indian government identity documents.",
    benefits: [
      { title: "Strict 18+ Enforcement", desc: "Calculates exact age from date of birth; under 18 accounts are strictly blocked." },
      { title: "Multi-ID Support", desc: "Supports Aadhaar (12 digits), PAN (10 chars), DL (15 chars), and Voter ID (10 chars)." },
      { title: "Document Upload Screening", desc: "Requires clear photos of college ID and government ID for admin review." },
      { title: "Admin Audit Approval", desc: "Dedicated admin audit portal verifies every credential prior to profile activation." },
    ],
    steps: [
      "Student inputs Date of Birth & selects government ID type.",
      "Formats and character lengths are validated automatically in real-time.",
      "Student uploads document photo for admin verification.",
      "Account is activated after successful compliance verification."
    ],
    faqs: [
      { q: "Is student personal data kept secure?", a: "Yes! All government ID documents are encrypted and accessible only to authorized compliance admins." }
    ]
  },
  "hotel-jobs": {
    title: "Hotel & Hospitality Jobs | Banquet Staff, Housekeeping & Front Desk",
    h1: "Hotel & Hospitality Staffing Solutions",
    subtitle: "On-demand banquet servers, reception helpers, and housekeeping assistants.",
    metaDesc: "Hire hotel shift staff, banquet servers, front desk assistants, and housekeeping helpers on demand with Shiftlyin.",
    keywords: "hotel shift jobs, banquet staff hiring, hospitality staffing, front desk helpers, hotel housekeeping jobs",
    icon: "🏨",
    badge: "Hospitality & Tourism",
    overview: "Hotels and banquet halls experience heavy surge requirements during wedding seasons, corporate conferences, and holiday travel periods. Shiftlyin supplies screened student talent for hospitality shifts.",
    benefits: [
      { title: "Banquet Surge Support", desc: "Deploy 10 to 30+ trained banquet servers for evening wedding receptions." },
      { title: "Front Desk & Guest Help", desc: "Articulate college students to assist with guest greeting and luggage support." },
      { title: "Flexible Scheduling", desc: "Hire staff for specific 6-hour or 8-hour hotel shifts." },
      { title: "Verified Hospitality Profiles", desc: "View student profiles with prior hotel or restaurant ratings." },
    ],
    steps: [
      "Post a hotel shift detailing venue, timing, and grooming requirements.",
      "Accept student applicants with high hospitality ratings.",
      "Students check in at hotel premises via GPS geofence.",
      "Automatic settlement upon shift completion."
    ],
    faqs: [
      { q: "Can we mandate specific dress code guidelines?", a: "Yes, you can specify uniform guidelines (e.g. black trousers, white shirt) in the job description." }
    ]
  }
};

export default function ServicePage() {
  const { slug } = useParams();
  const [openFaq, setOpenFaq] = useState(null);

  const service = SERVICES_DATA[slug];

  if (!service) {
    return <Navigate to="/help" replace />;
  }

  const handleCtaClick = (locationStr) => {
    AnalyticsEvents.ctaClicked(`Service_CTA_${slug}`, locationStr);
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Services", url: "/services/part-time-jobs" },
    { name: service.badge, url: `/services/${slug}` }
  ];

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", paddingTop: "80px", paddingBottom: "60px" }}>
      <SeoHead
        title={service.title}
        description={service.metaDesc}
        keywords={service.keywords}
        canonical={`/services/${slug}`}
        schemaType="Service"
        schemaData={{
          title: service.h1,
          description: service.metaDesc,
          slug: slug,
          serviceType: service.badge
        }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ maxWidth: "1100px", margin: "0 auto", padding: "12px 20px" }}>
        <ol style={{ display: "flex", gap: "8px", listStyle: "none", padding: 0, margin: 0, fontSize: "13px", color: "var(--muted)" }}>
          {breadcrumbs.map((crumb, idx) => (
            <li key={crumb.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {idx > 0 && <span>/</span>}
              <Link to={crumb.url} style={{ color: idx === breadcrumbs.length - 1 ? "var(--primary)" : "var(--muted)", textDecoration: "none", fontWeight: idx === breadcrumbs.length - 1 ? "700" : "500" }}>
                {crumb.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Hero Header Section */}
      <header style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 20px 40px", textAlign: "center" }}>
        <span style={{
          background: "rgba(37, 99, 235, 0.1)",
          color: "var(--primary)",
          padding: "6px 16px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "800",
          letterSpacing: "0.05em",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "16px"
        }}>
          <span>{service.icon}</span> {service.badge}
        </span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "900", color: "var(--text)", lineHeight: "1.2", marginBottom: "16px", maxWidth: "900px", margin: "0 auto 16px" }}>
          {service.h1}
        </h1>
        <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "var(--muted)", maxWidth: "760px", margin: "0 auto 28px", lineHeight: "1.6" }}>
          {service.subtitle}
        </p>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/register"
            onClick={() => handleCtaClick("Hero_Primary")}
            className="primary-button"
            style={{ padding: "14px 28px", fontSize: "1rem", fontWeight: "800", borderRadius: "12px", background: "var(--primary)", color: "#fff", textDecoration: "none" }}
          >
            Get Started Now →
          </Link>
          <Link
            to="/contact"
            onClick={() => handleCtaClick("Hero_Secondary")}
            className="ghost-button"
            style={{ padding: "14px 24px", fontSize: "1rem", fontWeight: "700", borderRadius: "12px", border: "1.5px solid var(--border)", color: "var(--text)", textDecoration: "none" }}
          >
            Contact Support
          </Link>
        </div>
      </header>

      {/* Main Overview Section */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "32px", marginBottom: "40px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "12px", color: "var(--text)" }}>Service Overview</h2>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: "1.7", margin: 0 }}>
            {service.overview}
          </p>
        </section>

        {/* Benefits Grid */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "900", textAlign: "center", marginBottom: "28px", color: "var(--text)" }}>
            Why Choose Shiftlyin for {service.badge}?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {service.benefits.map((b, idx) => (
              <div key={idx} style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", transition: "transform 0.2s ease" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--primary)", marginBottom: "8px" }}>
                  ✓ {b.title}
                </h3>
                <p style={{ fontSize: "0.92rem", color: "var(--muted)", lineHeight: "1.5", margin: 0 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Step by Step Process */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "36px 28px", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "900", textAlign: "center", marginBottom: "28px", color: "var(--text)" }}>
            How It Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {service.steps.map((stepText, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", fontWeight: "900", fontSize: "1.1rem" }}>
                  {idx + 1}
                </span>
                <p style={{ fontSize: "0.95rem", color: "var(--text)", fontWeight: "600", lineHeight: "1.5", margin: 0 }}>
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Accordion FAQ Section */}
        {service.faqs && service.faqs.length > 0 && (
          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "900", textAlign: "center", marginBottom: "28px", color: "var(--text)" }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "800px", margin: "0 auto" }}>
              {service.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface-soft)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    overflow: "hidden",
                    cursor: "pointer"
                  }}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "700", color: "var(--text)", fontSize: "1.05rem" }}>
                    <span>Q: {faq.q}</span>
                    <span>{openFaq === idx ? "−" : "+"}</span>
                  </div>
                  {openFaq === idx && (
                    <div style={{ padding: "0 20px 18px", color: "var(--muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Banner */}
        <section style={{
          background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
          borderRadius: "24px",
          padding: "40px 24px",
          textAlign: "center",
          color: "#fff",
          boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)"
        }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "12px", color: "#fff" }}>
            Ready to Get Started with Shiftlyin?
          </h2>
          <p style={{ fontSize: "1.1rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto 28px" }}>
            Join thousands of verified students and top local businesses on India's premier shift job portal.
          </p>
          <Link
            to="/register"
            onClick={() => handleCtaClick("Bottom_Banner")}
            style={{
              display: "inline-block",
              background: "#fff",
              color: "var(--primary-dark)",
              fontWeight: "900",
              fontSize: "1.05rem",
              padding: "16px 36px",
              borderRadius: "12px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
            }}
          >
            Create Your Free Account Now →
          </Link>
        </section>
      </main>
    </div>
  );
}
