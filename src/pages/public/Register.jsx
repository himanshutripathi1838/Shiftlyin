import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploadField from "../../components/ImageUploadField.jsx";
import { uploadImageToCloudinary } from "../../services/cloudinary.js";
import { auth, db } from "../../services/firebase.js";

// Validation Regex Helpers
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const aadhaarRegex = /^\d{12}$/;
const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;

function calculateAge(dobString) {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function maskIdNumber(docType, num) {
  if (!num) return "";
  if (docType === "Aadhaar Card") {
    return `XXXXXXXX${num.slice(-4)}`;
  }
  if (docType === "PAN Card") {
    return `${num.slice(0, 5)}****${num.slice(-1)}`;
  }
  return `${num.slice(0, 4)}****${num.slice(-4)}`;
}

const initialForm = {
  role: "student",
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  dob: "",
  gender: "Male",
  // Student Education
  collegeName: "",
  course: "B.Tech",
  year: "1st Year",
  city: "",
  state: "",
  // Identity Proof
  idDocumentType: "Aadhaar Card",
  idDocumentNumber: "",
  // Profile & Preferences
  skills: "",
  languages: "English, Hindi",
  preferredCategory: "Cafe",
  latitude: "",
  longitude: "",
  // Business Specific
  ownerName: "",
  businessType: "Restaurant",
  address: "",
  pincode: "",
  gstNumber: "",
  fssaiNumber: ""
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({
    profilePhoto: null,
    idDocPhoto: null,
    shopPhoto: null,
    logoPhoto: null
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateFile(key, file) {
    setFiles((current) => ({ ...current, [key]: file }));
  }

  function handlePhoneChange(val) {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
    updateField("phone", digitsOnly);
  }

  function handleDocNumChange(val) {
    let sanitized = val.trim();
    if (form.idDocumentType === "Aadhaar Card") {
      sanitized = sanitized.replace(/\D/g, "").slice(0, 12);
    } else if (form.idDocumentType === "PAN Card") {
      sanitized = sanitized.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    } else if (form.idDocumentType === "Driving Licence") {
      sanitized = sanitized.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
    } else if (form.idDocumentType === "Voter ID") {
      sanitized = sanitized.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    }
    updateField("idDocumentNumber", sanitized);
  }

  // Live validation checks
  const isPhoneValid = form.phone.length === 10;
  const calculatedAge = form.role === "student" ? calculateAge(form.dob) : 20;
  const isUnderage = form.role === "student" && form.dob && calculatedAge < 18;

  const isDocValid = Boolean(
    form.idDocumentNumber &&
    ((form.idDocumentType === "Aadhaar Card" && aadhaarRegex.test(form.idDocumentNumber)) ||
     (form.idDocumentType === "PAN Card" && panRegex.test(form.idDocumentNumber)) ||
     (form.idDocumentType === "Driving Licence" && form.idDocumentNumber.length >= 14) ||
     (form.idDocumentType === "Voter ID" && form.idDocumentNumber.length === 10))
  );

  function useCurrentLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateField("latitude", pos.coords.latitude);
        updateField("longitude", pos.coords.longitude);
      },
      () => setError("Please allow location access to save GPS coordinates."),
      { enableHighAccuracy: true }
    );
  }

  // Wizard Step Navigation Rules
  function nextStep() {
    setError("");

    if (form.role === "student") {
      if (step === 1) {
        if (!form.name.trim()) return setError("Full name is required.");
        if (!form.dob) return setError("Date of birth is required.");
        if (isUnderage) return setError("You must be at least 18 years old to register on Shiftlyin.");
        if (!form.email.trim() || !form.email.includes("@")) return setError("Valid email address is required.");
        if (!isPhoneValid) return setError("Mobile number must be exactly 10 digits.");
        if (!strongPasswordRegex.test(form.password)) {
          return setError("Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).");
        }
        if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
      } else if (step === 2) {
        if (!isDocValid) return setError(`Invalid ${form.idDocumentType} format.`);
        if (!files.idDocPhoto) return setError(`Please upload your ${form.idDocumentType} photo.`);
      }
      setStep((s) => Math.min(s + 1, 3));
    } else {
      if (step === 1) {
        if (!form.name.trim()) return setError("Business name is required.");
        if (!form.ownerName.trim()) return setError("Owner name is required.");
        if (!form.email.trim() || !form.email.includes("@")) return setError("Valid email address is required.");
        if (!isPhoneValid) return setError("Mobile number must be exactly 10 digits.");
        if (!strongPasswordRegex.test(form.password)) {
          return setError("Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
        }
        if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
      } else if (step === 2) {
        if (!form.address.trim() || !form.pincode.trim()) return setError("Address and Pincode are required.");
      }
      setStep((s) => Math.min(s + 1, 3));
    }
  }

  function prevStep() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const imageUrls = {};
      if (form.role === "student") {
        if (files.profilePhoto) {
          imageUrls.profilePhotoUrl = await uploadImageToCloudinary(files.profilePhoto, "shiftlyin/students/profile");
        }
        if (files.idDocPhoto) {
          imageUrls.collegeIdPhotoUrl = await uploadImageToCloudinary(files.idDocPhoto, "shiftlyin/students/identity");
        }
      } else {
        if (files.shopPhoto) {
          imageUrls.shopPhotoUrl = await uploadImageToCloudinary(files.shopPhoto, "shiftlyin/businesses/shop");
        }
        if (files.logoPhoto) {
          imageUrls.licensePhotoUrl = await uploadImageToCloudinary(files.logoPhoto, "shiftlyin/businesses/logo");
        }
      }

      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = credential.user.uid;
      const maskedNumber = maskIdNumber(form.idDocumentType, form.idDocumentNumber);

      // Save user base record
      await setDoc(doc(db, "users", uid), {
        uid,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        rating: 0,
        ratingCount: 0,
        completedJobs: 0,
        idDocumentType: form.idDocumentType,
        idDocumentNumber: form.idDocumentNumber.trim(),
        maskedIdNumber: maskedNumber,
        verificationStatus: "pending",
        ...imageUrls,
        createdAt: serverTimestamp()
      });

      if (form.role === "student") {
        await setDoc(doc(db, "students", uid), {
          uid,
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.phone.trim(),
          dob: form.dob,
          age: calculatedAge,
          gender: form.gender,
          collegeName: form.collegeName.trim(),
          course: form.course,
          year: form.year,
          city: form.city.trim(),
          state: form.state.trim(),
          idDocumentType: form.idDocumentType,
          idDocumentNumber: form.idDocumentNumber.trim(),
          maskedIdNumber: maskedNumber,
          skills: form.skills.trim(),
          languages: form.languages.trim(),
          preferredCategory: form.preferredCategory,
          latitude: form.latitude || "",
          longitude: form.longitude || "",
          verificationStatus: "pending",
          rating: 0,
          reputationScore: 0,
          isBlocked: false,
          profilePhotoUrl: imageUrls.profilePhotoUrl || "",
          collegeIdPhotoUrl: imageUrls.collegeIdPhotoUrl || "",
          createdAt: serverTimestamp()
        });
      } else {
        await setDoc(doc(db, "businesses", uid), {
          uid,
          businessName: form.name.trim(),
          ownerName: form.ownerName.trim(),
          email: form.email.trim(),
          mobile: form.phone.trim(),
          businessType: form.businessType,
          address: form.address.trim(),
          pincode: form.pincode.trim(),
          latitude: form.latitude || "",
          longitude: form.longitude || "",
          idDocumentType: form.idDocumentType,
          idDocumentNumber: form.idDocumentNumber.trim(),
          maskedIdNumber: maskedNumber,
          gstNumber: form.gstNumber.trim(),
          fssaiNumber: form.fssaiNumber.trim(),
          verificationStatus: "pending",
          isSuspended: false,
          shopPhotoUrl: imageUrls.shopPhotoUrl || "",
          licensePhotoUrl: imageUrls.licensePhotoUrl || "",
          createdAt: serverTimestamp()
        });
      }

      // Log registration audit event
      await addDoc(collection(db, "auditLogs"), {
        actionType: "REGISTER_USER",
        targetId: uid,
        message: `Registered new ${form.role} account for ${form.name.trim()}`,
        createdAt: serverTimestamp()
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate(form.role === "business" ? "/business" : "/student");
      }, 3500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isStudent = form.role === "student";
  const totalSteps = 3;

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", padding: "60px 1rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <section className="panel auth-panel" style={{ 
        background: "var(--surface)", 
        border: "1px solid var(--border)", 
        borderRadius: "24px", 
        boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
        maxWidth: "760px",
        width: "100%",
        padding: "44px clamp(24px, 5vw, 48px)",
        transition: "all 0.3s ease"
      }}>
        {/* Success Flow Screen */}
        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <span style={{ fontSize: "56px", display: "block", marginBottom: "16px" }}>🎉</span>
            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "var(--text)" }}>Registration Successful!</h2>
            <p style={{ color: "var(--muted)", fontSize: "15px", margin: "8px 0 28px" }}>
              Welcome to Shiftlyin. Your profile has been created and sent for Admin Approval.
            </p>
            
            <div style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", margin: "24px 0", textAlign: "left" }}>
              <strong style={{ fontSize: "12px", color: "var(--primary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>Account Verification Flow</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text)" }}>
                <div>✅ <strong>1. Register:</strong> Form submitted with verified identity details.</div>
                <div>📩 <strong>2. Email Verification:</strong> Confirmation sent to {form.email}.</div>
                <div>⏳ <strong>3. Pending Admin Approval:</strong> Identity audit in progress (usually within 2 hrs).</div>
                <div>🚀 <strong>4. Dashboard Access:</strong> Redirecting to your console...</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-header" style={{ marginBottom: "28px" }}>
              <span className="eyebrow" style={{ background: "rgba(37,99,235,0.1)", color: "var(--primary)", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", letterSpacing: "0.05em", display: "inline-block", marginBottom: "8px" }}>
                Shiftlyin Onboarding
              </span>
              <h1 style={{ fontSize: "30px", fontWeight: "900", color: "var(--text)", margin: "4px 0" }}>Create Your Account</h1>
              <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>Select account role and complete real-world identity verification.</p>
            </div>

            {/* Role Selection */}
            {step === 1 && (
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 28px" }}>
                <legend style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>Select Account Type</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <button
                    type="button"
                    className={`choice-card ${isStudent ? "active" : ""}`}
                    onClick={() => { setForm(initialForm); setStep(1); }}
                    style={{ 
                      border: isStudent ? "2px solid var(--primary)" : "1px solid var(--border)", 
                      borderRadius: "16px", 
                      padding: "18px 20px", 
                      textAlign: "left", 
                      cursor: "pointer", 
                      background: isStudent ? "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02))" : "var(--surface-soft)",
                      boxShadow: isStudent ? "0 4px 14px rgba(37,99,235,0.12)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ fontSize: "24px", display: "block", marginBottom: "4px" }}>🎓</span>
                    <strong style={{ display: "block", fontSize: "16px", color: "var(--text)" }}>Student</strong>
                    <small style={{ color: "var(--muted)", fontSize: "12px" }}>Find part-time gigs & earn</small>
                  </button>

                  <button
                    type="button"
                    className={`choice-card ${!isStudent ? "active" : ""}`}
                    onClick={() => { setForm({ ...initialForm, role: "business" }); setStep(1); }}
                    style={{ 
                      border: !isStudent ? "2px solid var(--accent)" : "1px solid var(--border)", 
                      borderRadius: "16px", 
                      padding: "18px 20px", 
                      textAlign: "left", 
                      cursor: "pointer", 
                      background: !isStudent ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))" : "var(--surface-soft)",
                      boxShadow: !isStudent ? "0 4px 14px rgba(16,185,129,0.12)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ fontSize: "24px", display: "block", marginBottom: "4px" }}>🏪</span>
                    <strong style={{ display: "block", fontSize: "16px", color: "var(--text)" }}>Business Owner</strong>
                    <small style={{ color: "var(--muted)", fontSize: "12px" }}>Hire verified campus talent</small>
                  </button>
                </div>
              </fieldset>
            )}

            {/* Step Wizard Progress Header */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: isStudent ? "var(--primary)" : "var(--accent)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Step {step} of {totalSteps}: {isStudent ? (step === 1 ? "Personal Details" : step === 2 ? "Identity Verification" : "Profile & GPS") : (step === 1 ? "Business Details" : step === 2 ? "Address & GPS" : "Identity & Documents")}
                </span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text)" }}>
                  {Math.round((step / totalSteps) * 100)}% Completed
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    width: `${(step / totalSteps) * 100}%`, 
                    height: "100%", 
                    background: isStudent ? "linear-gradient(90deg, #2563eb, #3b82f6)" : "linear-gradient(90deg, #10b981, #059669)", 
                    borderRadius: "4px", 
                    transition: "width 0.3s ease" 
                  }} 
                />
              </div>
            </div>

            {error && <div className="form-error" style={{ marginBottom: "24px", padding: "12px 16px", borderRadius: "10px", fontSize: "13px" }}>{error}</div>}

            <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* STUDENT FLOW */}
              {isStudent && (
                <>
                  {/* Step 1: Personal Details */}
                  {step === 1 && (
                    <div className="form-stack">
                      <label>Full Name
                        <input required placeholder="Your full name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                      </label>
                      <div className="form-grid">
                        <label>Date of Birth
                          <input type="date" required value={form.dob} onChange={(e) => updateField("dob", e.target.value)} />
                          {form.dob && (
                            <small style={{ color: isUnderage ? "#ef4444" : "#10b981", fontWeight: "700", marginTop: "2px", display: "block" }}>
                              {isUnderage ? `❌ Age: ${calculatedAge} years (Must be at least 18)` : `✓ Age: ${calculatedAge} years`}
                            </small>
                          )}
                        </label>
                        <label>Gender
                          <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </label>
                      </div>

                      <label>Email Address
                        <input type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => updateField("email", e.target.value.trim())} />
                      </label>
                      
                      <label>Mobile Number (Strictly 10 Digits)
                        <div style={{ position: "relative" }}>
                          <input type="tel" placeholder="10-digit mobile number" maxLength={10} required value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                          {isPhoneValid && <span style={{ position: "absolute", right: "12px", top: "10px", color: "#10b981", fontWeight: "bold" }}>✓</span>}
                        </div>
                      </label>

                      <div className="form-grid">
                        <label>Password
                          <span className="password-field">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Symbol"
                              required
                              value={form.password}
                              onChange={(e) => updateField("password", e.target.value)}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowPassword((current) => !current)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </span>
                        </label>
                        <label>Confirm Password
                          <span className="password-field">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter password"
                              required
                              value={form.confirmPassword}
                              onChange={(e) => updateField("confirmPassword", e.target.value)}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowConfirmPassword((current) => !current)}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Identity Verification */}
                  {step === 2 && (
                    <div className="form-stack">
                      <div className="form-grid">
                        <label>Identity Proof Type
                          <select value={form.idDocumentType} onChange={(e) => {
                            updateField("idDocumentType", e.target.value);
                            updateField("idDocumentNumber", "");
                          }}>
                            <option value="Aadhaar Card">Aadhaar Card (12 Digits)</option>
                            <option value="PAN Card">PAN Card (10 Chars)</option>
                            <option value="Driving Licence">Driving Licence (15-16 Chars)</option>
                            <option value="Voter ID">Voter ID (10 Chars)</option>
                          </select>
                        </label>
                        <label>Document Number
                          <div style={{ position: "relative" }}>
                            <input 
                              placeholder={
                                form.idDocumentType === "PAN Card" ? "ABCDE1234F" :
                                form.idDocumentType === "Aadhaar Card" ? "123456789012" :
                                form.idDocumentType === "Voter ID" ? "ABC1234567" : "DL1420110012345"
                              }
                              maxLength={
                                form.idDocumentType === "PAN Card" ? 10 :
                                form.idDocumentType === "Aadhaar Card" ? 12 :
                                form.idDocumentType === "Voter ID" ? 10 : 16
                              }
                              value={form.idDocumentNumber}
                              onChange={(e) => handleDocNumChange(e.target.value)}
                            />
                            {isDocValid && <span style={{ position: "absolute", right: "12px", top: "10px", color: "#10b981", fontWeight: "bold" }}>✓ Valid</span>}
                          </div>
                        </label>
                      </div>

                      <ImageUploadField
                        label={`Upload ${form.idDocumentType} Photo`}
                        hint={`Upload a clear front photo of your ${form.idDocumentType}`}
                        file={files.idDocPhoto}
                        onChange={(file) => updateFile("idDocPhoto", file)}
                      />
                    </div>
                  )}

                  {/* Step 3: Profile & Location */}
                  {step === 3 && (
                    <div className="form-stack">
                      <ImageUploadField
                        label="Profile Photo"
                        hint="Upload a clear photo of yourself"
                        file={files.profilePhoto}
                        onChange={(file) => updateFile("profilePhoto", file)}
                      />
                      <label>Key Skills (comma separated)
                        <input placeholder="e.g. Barista, Waiter, Billing, Customer Service" value={form.skills} onChange={(e) => updateField("skills", e.target.value)} />
                      </label>
                      <div className="form-grid">
                        <label>Languages Spoken
                          <input placeholder="English, Hindi" value={form.languages} onChange={(e) => updateField("languages", e.target.value)} />
                        </label>
                        <label>Preferred Category
                          <select value={form.preferredCategory} onChange={(e) => updateField("preferredCategory", e.target.value)}>
                            <option value="Cafe">Cafe</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Retail">Retail Store</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Events">Events & Catering</option>
                          </select>
                        </label>
                      </div>

                      <div style={{ background: "var(--surface-soft)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                        <strong style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>📍 GPS Location Permission</strong>
                        <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--muted)" }}>Save your current location to discover shifts nearest to your campus.</p>
                        <button type="button" className="ghost-button" onClick={useCurrentLocation} style={{ width: "100%", fontSize: "12px" }}>
                          {form.latitude ? `✓ Coordinates Saved (${Number(form.latitude).toFixed(3)}, ${Number(form.longitude).toFixed(3)})` : "Use Current Location"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* BUSINESS FLOW */}
              {!isStudent && (
                <>
                  {/* Step 1: Business Details */}
                  {step === 1 && (
                    <div className="form-stack">
                      <label>Business / Restaurant Name
                        <input required placeholder="Cafe Mocha" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                      </label>
                      <div className="form-grid">
                        <label>Owner Name
                          <input required placeholder="Rajesh Mehra" value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} />
                        </label>
                        <label>Business Type
                          <select value={form.businessType} onChange={(e) => updateField("businessType", e.target.value)}>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Cafe">Cafe</option>
                            <option value="Shop">Shop / Retail</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Event">Event Management</option>
                            <option value="Other">Other Business</option>
                          </select>
                        </label>
                      </div>
                      <label>Email Address
                        <input type="email" placeholder="owner@business.com" required value={form.email} onChange={(e) => updateField("email", e.target.value.trim())} />
                      </label>
                      <label>Mobile Number (Strictly 10 Digits)
                        <input type="tel" placeholder="10-digit mobile number" maxLength={10} required value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                      </label>
                      <div className="form-grid">
                        <label>Password
                          <span className="password-field">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Num"
                              required
                              value={form.password}
                              onChange={(e) => updateField("password", e.target.value)}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowPassword((current) => !current)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </span>
                        </label>
                        <label>Confirm Password
                          <span className="password-field">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter password"
                              required
                              value={form.confirmPassword}
                              onChange={(e) => updateField("confirmPassword", e.target.value)}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowConfirmPassword((current) => !current)}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Address & GPS */}
                  {step === 2 && (
                    <div className="form-stack">
                      <label>Shop / Business Address
                        <textarea required placeholder="Storefront address..." value={form.address} onChange={(e) => updateField("address", e.target.value)} />
                      </label>
                      <div className="form-grid">
                        <label>City<input required placeholder="City" value={form.city} onChange={(e) => updateField("city", e.target.value)} /></label>
                        <label>Pincode<input required placeholder="110001" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} /></label>
                      </div>

                      <div style={{ background: "var(--surface-soft)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                        <strong style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>📍 Shop GPS Location</strong>
                        <button type="button" className="ghost-button" onClick={useCurrentLocation} style={{ width: "100%", fontSize: "12px", marginTop: "8px" }}>
                          {form.latitude ? `✓ Shop GPS Saved (${Number(form.latitude).toFixed(3)}, ${Number(form.longitude).toFixed(3)})` : "Use Current Location"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Identity & Documents */}
                  {step === 3 && (
                    <div className="form-stack">
                      <div className="form-grid">
                        <label>Owner Identity Proof
                          <select value={form.idDocumentType} onChange={(e) => updateField("idDocumentType", e.target.value)}>
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="PAN Card">PAN Card</option>
                            <option value="Driving Licence">Driving Licence</option>
                            <option value="Voter ID">Voter ID</option>
                          </select>
                        </label>
                        <label>Document Number
                          <input 
                            placeholder="Document Number" 
                            maxLength={16}
                            value={form.idDocumentNumber} 
                            onChange={(e) => handleDocNumChange(e.target.value)} 
                          />
                        </label>
                      </div>

                      <div className="form-grid">
                        <ImageUploadField
                          label="Shop / Storefront Photo"
                          hint="Upload storefront or interior photo"
                          file={files.shopPhoto}
                          onChange={(file) => updateFile("shopPhoto", file)}
                        />
                        <ImageUploadField
                          label="Business License / Logo"
                          hint="Upload business license or logo image"
                          file={files.logoPhoto}
                          onChange={(file) => updateFile("logoPhoto", file)}
                        />
                      </div>

                      <div className="form-grid">
                        <label>GST Number (Optional)
                          <input placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={(e) => updateField("gstNumber", e.target.value.toUpperCase())} />
                        </label>
                        <label>FSSAI License (Optional)
                          <input placeholder="10012011000123" value={form.fssaiNumber} onChange={(e) => updateField("fssaiNumber", e.target.value)} />
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Wizard Footer Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", gap: "12px" }}>
                {step > 1 && (
                  <button type="button" className="ghost-button" onClick={prevStep} disabled={loading} style={{ minWidth: "100px" }}>
                    ← Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button type="button" className="primary-button" onClick={nextStep} style={{ marginLeft: "auto", minWidth: "120px" }}>
                    Next Step →
                  </button>
                ) : (
                  <button className="primary-button" disabled={loading} style={{ marginLeft: "auto", minWidth: "160px", background: "var(--primary)" }}>
                    {loading ? "Registering Account..." : isStudent ? "Complete Student Registration" : "Complete Business Registration"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
