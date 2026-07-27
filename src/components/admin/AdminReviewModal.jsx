import { useState } from "react";

function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function AdminReviewModal({ isOpen, onClose, data, type = "student", onApprove, onReject, onBlock }) {
  const [zoomImage, setZoomImage] = useState(null);

  if (!isOpen || !data) return null;

  const isStudent = type === "student";
  const name = isStudent ? data.name : data.businessName;
  const email = data.email;
  const mobile = data.mobile || data.phone || "-";
  const status = data.verificationStatus || "pending";
  const isBlocked = isStudent ? data.isBlocked : data.isSuspended;

  // Age check for students
  const age = isStudent ? calculateAge(data.dob) : null;
  const isUnderage = isStudent && age !== null && age < 18;

  // Photo URLs
  const primaryPhoto = isStudent ? data.profilePhotoUrl : data.shopPhotoUrl;
  const docPhoto = isStudent ? data.collegeIdPhotoUrl : data.licensePhotoUrl;

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="admin-modal-header">
          <div>
            <span className="eyebrow">{isStudent ? "Student Profile" : "Business Details"}</span>
            <h2>{name}</h2>
          </div>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        </header>

        <div className="admin-modal-body">
          <div className="admin-modal-meta-grid">
            <div>
              <span>Email</span>
              <strong>{email}</strong>
            </div>
            <div>
              <span>Mobile</span>
              <strong>{mobile}</strong>
            </div>
            {isStudent ? (
              <>
                <div>
                  <span>College Name</span>
                  <strong>{data.collegeName || "Not added"}</strong>
                </div>
                <div>
                  <span>Date of Birth</span>
                  <strong>{data.dob || "Not added"} {age !== null && `(Age: ${age})`}</strong>
                </div>
                <div>
                  <span>Document Type</span>
                  <strong style={{ color: "#10b981" }}>{data.idDocumentType || "Aadhaar Card"}</strong>
                </div>
                <div>
                  <span>Document Number</span>
                  <strong>{data.idDocumentNumber || "Not added"}</strong>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span>Business Type</span>
                  <strong>{data.businessType || "Restaurant"}</strong>
                </div>
                <div>
                  <span>Address</span>
                  <strong>{data.address || "Not added"}</strong>
                </div>
              </>
            )}
            <div>
              <span>Verification Status</span>
              <strong style={{ textTransform: "capitalize" }}>{status}</strong>
            </div>
          </div>

          {isUnderage && (
            <div className="admin-modal-warning" role="alert">
              ⚠️ <strong>Warning:</strong> Student is under 18 years of age (Calculated Age: {age}). Please verify age guidelines before approving.
            </div>
          )}

          <div className="admin-modal-photos">
            <div className="photo-box">
              <h4>{isStudent ? "Profile Photo" : "Storefront/Interior Photo"}</h4>
              <div className="photo-wrapper">
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto}
                    alt={`${name} primary`}
                    onClick={() => setZoomImage(primaryPhoto)}
                  />
                ) : (
                  <div className="photo-placeholder">No Photo Uploaded</div>
                )}
              </div>
            </div>

            <div className="photo-box">
              <h4>{isStudent ? (data.idDocumentType || "College ID Card") : "Business License Document"}</h4>
              <div className="photo-wrapper clickable">
                {docPhoto ? (
                  <img
                    src={docPhoto}
                    alt={`${name} document`}
                    onClick={() => setZoomImage(docPhoto)}
                  />
                ) : (
                  <div className="photo-placeholder">No Document Uploaded</div>
                )}
              </div>
              <small className="photo-hint">Click image to expand and view in full size</small>
            </div>
          </div>
        </div>

        <footer className="admin-modal-footer">
          <div className="footer-actions">
            {status !== "verified" && (
              <button className="primary-button success-btn" onClick={() => onApprove(data)}>
                Approve Verification
              </button>
            )}
            {status !== "rejected" && (
              <button className="ghost-button warning-btn" onClick={() => onReject(data)}>
                Reject Application
              </button>
            )}
            {!isBlocked && (
              <button className="ghost-button danger-btn" onClick={() => onBlock(data)}>
                {isStudent ? "Block Student" : "Suspend Business"}
              </button>
            )}
          </div>
          <button className="ghost-button" onClick={onClose}>Close Review</button>
        </footer>
      </div>

      {zoomImage && (
        <div className="admin-image-zoom-overlay" onClick={() => setZoomImage(null)}>
          <button className="zoom-close" onClick={() => setZoomImage(null)}>&times;</button>
          <img src={zoomImage} alt="Expanded document view" />
        </div>
      )}
    </div>
  );
}
