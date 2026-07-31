import React, { useState } from "react";
import { motion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare, Sparkles } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      // 1. Save Inquiry in Firebase Firestore
      await addDoc(collection(db, "contact_inquiries"), {
        ...formData,
        targetEmail: "shiftlyin@gmail.com",
        status: "unread",
        createdAt: serverTimestamp()
      });

      // 2. Prepare mailto fallback for direct client sending to shiftlyin@gmail.com
      const mailtoSubject = encodeURIComponent(`[Shiftlyin Inquiry] ${formData.subject || "Contact Form Submission"}`);
      const mailtoBody = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nRole: ${formData.role}\n\nMessage:\n${formData.message}`
      );
      const mailtoUrl = `mailto:shiftlyin@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      // Open email client
      window.open(mailtoUrl, "_blank");

      setSubmittedSuccess(true);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      // Even if firestore errors, allow mailto
      const mailtoUrl = `mailto:shiftlyin@gmail.com?subject=${encodeURIComponent(formData.subject || "Inquiry")}&body=${encodeURIComponent(formData.message)}`;
      window.open(mailtoUrl, "_blank");
      setSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "50px" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(37, 99, 235, 0.1)",
              color: "var(--primary)",
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: "16px",
              border: "1px solid rgba(37, 99, 235, 0.2)"
            }}
          >
            <Sparkles style={{ width: "16px", height: "16px" }} /> Get In Touch
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, var(--text) 30%, var(--primary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "12px"
            }}
          >
            We'd Love to Hear From You
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            Have questions about student shifts, business hiring, or partnerships? Send us a message and our team will get back to you at <strong style={{ color: "var(--primary)" }}>shiftlyin@gmail.com</strong>.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start" }}>
          
          {/* Left Column: Contact Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Direct Email Card */}
            <div
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                transition: "transform 0.2s, border-color 0.2s"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(37, 99, 235, 0.1)",
                  color: "var(--primary)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0
                }}
              >
                <Mail style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>
                  Official Email
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "4px 0" }}>
                  <a href="mailto:shiftlyin@gmail.com" style={{ color: "var(--primary)", textDecoration: "none" }}>
                    shiftlyin@gmail.com
                  </a>
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: 0, lineHeight: "1.5" }}>
                  Direct inbox for inquiries, support requests, business partnerships, and user feedback.
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0
                }}
              >
                <Phone style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>
                  Call & WhatsApp
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "4px 0", color: "var(--text)" }}>
                  <a href="tel:+919876543210" style={{ color: "inherit", textDecoration: "none" }}>
                    +91 98765 43210
                  </a>
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: 0, lineHeight: "1.5" }}>
                  Mon - Sat, 9:00 AM - 7:00 PM IST. Instant support for active shift issues.
                </p>
              </div>
            </div>

            {/* Location Card */}
            <div
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0
                }}
              >
                <MapPin style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>
                  Headquarters & Coverage
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "4px 0", color: "var(--text)" }}>
                  India-Wide Operations
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: 0, lineHeight: "1.5" }}>
                  Connecting verified students with local cafes, retail stores, and events across major Indian cities.
                </p>
              </div>
            </div>

            {/* Response Time Badge */}
            <div
              style={{
                background: "var(--surface-soft)",
                borderRadius: "16px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid var(--border)"
              }}
            >
              <Clock style={{ width: "20px", height: "20px", color: "var(--primary)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)" }}>
                Average response time: <strong>Under 2 hours</strong> on business days.
              </span>
            </div>

          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "var(--shadow)"
            }}
          >
            {submittedSuccess ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: "center", padding: "40px 10px" }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 20px"
                  }}
                >
                  <CheckCircle style={{ width: "40px", height: "40px" }} />
                </div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: "12px", color: "var(--text)" }}>
                  Message Sent Successfully!
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
                  Thank you, <strong>{formData.name}</strong>. Your message has been saved and routed directly to <strong style={{ color: "var(--primary)" }}>shiftlyin@gmail.com</strong>.
                </p>
                <Button
                  onClick={() => {
                    setSubmittedSuccess(false);
                    setFormData({ name: "", email: "", phone: "", role: "student", subject: "", message: "" });
                  }}
                  style={{
                    background: "var(--primary)",
                    color: "#ffffff",
                    fontWeight: 700,
                    borderRadius: "12px",
                    padding: "12px 24px"
                  }}
                >
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px", color: "var(--text)" }}>
                    Send Us a Direct Message
                  </h2>
                  <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: 0 }}>
                    Fill in the form below to email <strong style={{ color: "var(--primary)" }}>shiftlyin@gmail.com</strong>
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
                      Full Name *
                    </label>
                    <Input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
                      Email Address *
                    </label>
                    <Input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
                      I am a...
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text)",
                        padding: "0 12px",
                        fontSize: "0.88rem",
                        outline: "none"
                      }}
                    >
                      <option value="student">Student (Looking for shifts)</option>
                      <option value="business">Business Owner (Hiring staff)</option>
                      <option value="partner">Business Partner / Investor</option>
                      <option value="general">General Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
                    Subject *
                  </label>
                  <Input
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you today?"
                    style={{ borderRadius: "10px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px", color: "var(--text)" }}>
                    Message *
                  </label>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your detailed query or message here..."
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text)",
                      padding: "12px",
                      fontSize: "0.88rem",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <Send style={{ width: "18px", height: "18px" }} />
                  {isSubmitting ? "Sending to shiftlyin@gmail.com..." : "Send Message to shiftlyin@gmail.com"}
                </Button>
              </form>
            )}
          </motion.div>

        </div>

      </div>
    </div>
  );
}
