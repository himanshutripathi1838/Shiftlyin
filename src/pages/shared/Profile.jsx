import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import ImageUploadField from "../../components/ImageUploadField.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { uploadImageToCloudinary } from "../../services/cloudinary.js";
import { db } from "../../services/firebase.js";
import { getBadge } from "../../utils/reputation.js";

function getFormValues(profile) {
  const isStudent = profile?.role === "student";
  return {
    name: isStudent ? profile?.name || "" : profile?.businessName || profile?.name || "",
    phone: profile?.phone || profile?.mobile || "",
    dob: profile?.dob || "",
    collegeName: profile?.collegeName || "",
    idDocumentType: profile?.idDocumentType || "Aadhaar Card",
    idDocumentNumber: profile?.idDocumentNumber || "",
    ownerName: profile?.ownerName || "",
    businessType: profile?.businessType || "Restaurant",
    address: profile?.address || "",
    latitude: profile?.latitude ?? "",
    longitude: profile?.longitude ?? ""
  };
}

export default function Profile() {
  const { currentUser, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState(() => getFormValues(profile));
  const [files, setFiles] = useState({ primaryPhoto: null, documentPhoto: null });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getFormValues(profile));
  }, [profile]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function cancelEdit() {
    setForm(getFormValues(profile));
    setFiles({ primaryPhoto: null, documentPhoto: null });
    setError("");
    setIsEditing(false);
  }

  function handlePhoneChange(val) {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
    updateField("phone", digitsOnly);
  }

  function handleDocNumChange(val) {
    let sanitized = val;
    if (form.idDocumentType === "Aadhaar Card") {
      sanitized = sanitized.replace(/\D/g, "").slice(0, 12);
    } else if (form.idDocumentType === "PAN Card") {
      sanitized = sanitized.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    } else if (form.idDocumentType === "Driving License") {
      sanitized = sanitized.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    }
    updateField("idDocumentNumber", sanitized);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    if (form.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      setSaving(false);
      return;
    }

    if (profile.role === "student") {
      if (form.idDocumentType === "Aadhaar Card" && form.idDocumentNumber.length !== 12) {
        setError("Aadhaar Card number must be exactly 12 digits.");
        setSaving(false);
        return;
      }
      if (form.idDocumentType === "PAN Card" && form.idDocumentNumber.length !== 10) {
        setError("PAN Card number must be exactly 10 alphanumeric characters.");
        setSaving(false);
        return;
      }
      if (form.idDocumentType === "Driving License" && form.idDocumentNumber.length !== 15) {
        setError("Driving License number must be exactly 15 characters.");
        setSaving(false);
        return;
      }
    }

    try {
      const isStudent = profile.role === "student";
      const imageUpdates = {};

      if (files.primaryPhoto) {
        const field = isStudent ? "profilePhotoUrl" : "shopPhotoUrl";
        imageUpdates[field] = await uploadImageToCloudinary(
          files.primaryPhoto,
          isStudent ? "hustlr/students/profile" : "hustlr/businesses/shop"
        );
      }

      if (files.documentPhoto) {
        const field = isStudent ? "collegeIdPhotoUrl" : "licensePhotoUrl";
        imageUpdates[field] = await uploadImageToCloudinary(
          files.documentPhoto,
          isStudent ? "hustlr/students/college-id" : "hustlr/businesses/license"
        );
      }

      const batch = writeBatch(db);
      batch.update(doc(db, "users", currentUser.uid), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(isStudent ? { idDocumentType: form.idDocumentType || "Aadhaar Card", idDocumentNumber: form.idDocumentNumber.trim() } : {}),
        ...imageUpdates,
        updatedAt: serverTimestamp()
      });

      if (isStudent) {
        batch.update(doc(db, "students", currentUser.uid), {
          name: form.name.trim(),
          mobile: form.phone.trim(),
          dob: form.dob,
          collegeName: form.collegeName.trim(),
          idDocumentType: form.idDocumentType || "Aadhaar Card",
          idDocumentNumber: form.idDocumentNumber.trim(),
          ...imageUpdates,
          updatedAt: serverTimestamp()
        });
      } else {
        batch.update(doc(db, "businesses", currentUser.uid), {
          businessName: form.name.trim(),
          ownerName: form.ownerName.trim(),
          mobile: form.phone.trim(),
          businessType: form.businessType,
          address: form.address.trim(),
          latitude: form.latitude === "" ? "" : Number(form.latitude),
          longitude: form.longitude === "" ? "" : Number(form.longitude),
          ...imageUpdates,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      await refreshProfile();
      setFiles({ primaryPhoto: null, documentPhoto: null });
      setIsEditing(false);
      setNotice("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Profile update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isStudent = profile.role === "student";
  const displayName = isStudent ? profile.name : profile.businessName || profile.name;
  const primaryPhotoUrl = isStudent ? profile.profilePhotoUrl : profile.shopPhotoUrl;
  const documentPhotoUrl = isStudent ? profile.collegeIdPhotoUrl : profile.licensePhotoUrl;

  return (
    <main className={`dashboard-layout ${isStudent ? "student-view" : "owner-view"}`}>
      <Sidebar role={profile.role} />
      <section className="dashboard-content narrow">
        <div className="dashboard-header profile-header">
          <div className="dashboard-identity">
            <div className={`profile-avatar ${isStudent ? "student-avatar" : "owner-avatar"}`}>
              {primaryPhotoUrl
                ? <img src={primaryPhotoUrl} alt={`${displayName} profile`} />
                : <span>{displayName?.charAt(0)?.toUpperCase() || "H"}</span>}
            </div>
            <div>
              <span className="eyebrow">Profile</span>
              <h1>{displayName || profile.email}</h1>
              <p>Status: {profile.verificationStatus || "active"}</p>
            </div>
          </div>
          {!isEditing && (
            <button className="primary-button" type="button" onClick={() => setIsEditing(true)}>
              Edit profile
            </button>
          )}
        </div>

        {notice && <p className="notice">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        {!isEditing ? (
          <section className="panel profile-overview">
            <div className="profile-detail-grid">
              <div><span>Email</span><strong>{profile.email}</strong></div>
              <div><span>Phone</span><strong>{profile.phone || profile.mobile || "Not added"}</strong></div>
              {isStudent ? (
                <>
                  <div><span>College</span><strong>{profile.collegeName || "Not added"}</strong></div>
                  <div><span>Date of birth</span><strong>{profile.dob || "Not added"}</strong></div>
                  <div><span>ID Document Type</span><strong>{profile.idDocumentType || "Aadhaar Card"}</strong></div>
                  <div><span>ID Document Number</span><strong>{profile.idDocumentNumber || "Not added"}</strong></div>
                </>
              ) : (
                <>
                  <div><span>Owner</span><strong>{profile.ownerName || "Not added"}</strong></div>
                  <div><span>Business type</span><strong>{profile.businessType || "Not added"}</strong></div>
                  <div className="profile-wide-detail"><span>Address</span><strong>{profile.address || "Not added"}</strong></div>
                </>
              )}
            </div>
          </section>
        ) : (
          <form className="panel form-stack profile-edit-form" onSubmit={saveProfile}>
            <div className="profile-form-heading">
              <div>
                <span className="eyebrow">{isStudent ? "Student details" : "Business details"}</span>
                <h2>Update your profile</h2>
              </div>
              <button className="ghost-button" type="button" onClick={cancelEdit} disabled={saving}>Cancel</button>
            </div>

            <div className="form-grid">
              <label>{isStudent ? "Full name" : "Business name"}
                <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              </label>
              <label>Phone
                <input type="tel" placeholder="10-digit mobile number" maxLength={10} required value={form.phone} onChange={(event) => handlePhoneChange(event.target.value)} />
              </label>
            </div>
            <label>Email
              <input value={profile.email} disabled />
              <small className="field-help">Login email cannot be changed here.</small>
            </label>

            {isStudent ? (
              <>
                <div className="form-grid">
                  <label>College name
                    <input value={form.collegeName} onChange={(event) => updateField("collegeName", event.target.value)} />
                  </label>
                  <label>Date of birth
                    <input type="date" value={form.dob} onChange={(event) => updateField("dob", event.target.value)} />
                  </label>
                </div>
                <div className="form-grid">
                  <label>ID Document Type
                    <select value={form.idDocumentType} onChange={(event) => {
                      updateField("idDocumentType", event.target.value);
                      updateField("idDocumentNumber", "");
                    }}>
                      <option value="Aadhaar Card">Aadhaar Card (12 Digits)</option>
                      <option value="PAN Card">PAN Card (10 Chars)</option>
                      <option value="Driving License">Driving License (15 Chars)</option>
                    </select>
                  </label>
                  <label>ID Document Number
                    <input 
                      value={form.idDocumentNumber} 
                      onChange={(event) => handleDocNumChange(event.target.value)} 
                      placeholder={
                        form.idDocumentType === "PAN Card"
                          ? "10-char PAN (e.g. ABCDE1234F)"
                          : form.idDocumentType === "Driving License"
                          ? "15-char DL (e.g. DL1420110012345)"
                          : "12-digit Aadhaar number"
                      }
                      maxLength={
                        form.idDocumentType === "PAN Card"
                          ? 10
                          : form.idDocumentType === "Driving License"
                          ? 15
                          : 12
                      }
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="form-grid">
                  <label>Owner name
                    <input value={form.ownerName} onChange={(event) => updateField("ownerName", event.target.value)} />
                  </label>
                  <label>Business type
                    <select value={form.businessType} onChange={(event) => updateField("businessType", event.target.value)}>
                      <option>Restaurant</option>
                      <option>Cafe</option>
                      <option>Shop</option>
                      <option>Hotel</option>
                      <option>Event</option>
                      <option>Other</option>
                    </select>
                  </label>
                </div>
                <label>Business address
                  <textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} />
                </label>
                <div className="form-grid">
                  <label>Latitude
                    <input type="number" step="any" value={form.latitude} onChange={(event) => updateField("latitude", event.target.value)} />
                  </label>
                  <label>Longitude
                    <input type="number" step="any" value={form.longitude} onChange={(event) => updateField("longitude", event.target.value)} />
                  </label>
                </div>
              </>
            )}

            <div className="profile-image-grid">
              <div>
                {primaryPhotoUrl && <img className="profile-existing-image" src={primaryPhotoUrl} alt="" />}
                <ImageUploadField
                  label={isStudent ? "Replace profile photo" : "Replace restaurant / shop photo"}
                  hint="Select a new image only if you want to replace it"
                  file={files.primaryPhoto}
                  onChange={(file) => setFiles((current) => ({ ...current, primaryPhoto: file }))}
                />
              </div>
              <div>
                {documentPhotoUrl && <img className="profile-existing-image document-image" src={documentPhotoUrl} alt="" />}
                <ImageUploadField
                  label={isStudent ? "Replace college ID photo" : "Replace license photo"}
                  hint="Select a new document image only if needed"
                  file={files.documentPhoto}
                  onChange={(file) => setFiles((current) => ({ ...current, documentPhoto: file }))}
                />
              </div>
            </div>
            <button className="primary-button" disabled={saving}>
              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </form>
        )}

        <section className="panel profile-reputation">
          <h2>Account reputation</h2>
          <div className="metric-grid">
            <div className="metric-card"><span>Role</span><strong>{profile.role}</strong></div>
            <div className="metric-card"><span>Rating</span><strong>{profile.rating || 0}/5</strong></div>
            <div className="metric-card"><span>Total ratings</span><strong>{profile.ratingCount || 0}</strong></div>
            <div className="metric-card"><span>Badge</span><strong>{isStudent ? getBadge(profile.completedJobs || 0) : "Trusted hirer"}</strong></div>
          </div>
        </section>
      </section>
    </main>
  );
}
