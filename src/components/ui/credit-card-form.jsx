import React, { useEffect, useMemo, useState } from "react";

const CreditCardForm = ({
  docType = "Aadhaar Card",
  defaultNumber = "",
  defaultHolder = "",
  maskMiddle = true,
  className = "",
}) => {
  const [number, setNumber] = useState(defaultNumber);
  const [holder, setHolder] = useState((defaultHolder || "YOUR FULL NAME").toUpperCase());

  useEffect(() => {
    setNumber(defaultNumber);
  }, [defaultNumber]);

  useEffect(() => {
    if (defaultHolder) {
      setHolder(defaultHolder.toUpperCase());
    }
  }, [defaultHolder]);

  // Max slots depending on document type
  const maxSlots = useMemo(() => {
    if (docType === "Aadhaar Card") return 12;
    if (docType === "PAN Card") return 10;
    if (docType === "Voter ID") return 10;
    if (docType === "Driving Licence") return 15;
    return 12;
  }, [docType]);

  const displayedSlots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < maxSlots; i++) {
      let content = "#";
      if (i < number.length) {
        const d = number[i];
        const shouldMask = maskMiddle && i >= 3 && i < number.length - 3;
        content = shouldMask ? "*" : d;
      }
      arr.push({ textTop: content, filed: i < number.length });
    }
    return arr;
  }, [number, maxSlots, maskMiddle]);

  const cardConfig = useMemo(() => {
    if (docType === "Aadhaar Card") {
      return {
        bg: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)",
        ring1: "#34d399",
        ring2: "#f59e0b",
        badge: "UIDAI GOVT PROOF",
        badgeBg: "rgba(16, 185, 129, 0.25)",
        icon: "🇮🇳"
      };
    }
    if (docType === "PAN Card") {
      return {
        bg: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #b45309 100%)",
        ring1: "#fbbf24",
        ring2: "#3b82f6",
        badge: "INCOME TAX DEPT",
        badgeBg: "rgba(245, 158, 11, 0.25)",
        icon: "🏛️"
      };
    }
    if (docType === "Driving Licence") {
      return {
        bg: "linear-gradient(135deg, #311b92 0%, #4338ca 50%, #6366f1 100%)",
        ring1: "#818cf8",
        ring2: "#ec4899",
        badge: "TRANSPORT DEPT",
        badgeBg: "rgba(99, 102, 241, 0.25)",
        icon: "🚗"
      };
    }
    // Voter ID
    return {
      bg: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f766e 100%)",
      ring1: "#38bdf8",
      ring2: "#22c55e",
      badge: "ELECTION COMMISSION",
      badgeBg: "rgba(56, 189, 248, 0.25)",
      icon: "🗳️"
    };
  }, [docType]);

  return (
    <section className={`ccp ${className}`}>
      <div className="wrap">
        <section id="card" className="card">
          <section
            className="card__front"
            style={{
              background: cardConfig.bg,
              "--ring1": cardConfig.ring1,
              "--ring2": cardConfig.ring2,
            }}
          >
            {/* Glossy Overlay Reflective Line */}
            <div className="card__gloss" />

            <div className="card__header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem" }}>{cardConfig.icon}</span>
                <strong style={{ fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {docType}
                </strong>
              </div>
              <div style={{
                fontSize: "0.7rem",
                background: cardConfig.badgeBg,
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: 800,
                letterSpacing: "0.05em"
              }}>
                {cardConfig.badge}
              </div>
            </div>

            {/* Smart Chip SVG Graphic */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "10px 0 6px" }}>
              <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="30" rx="5" fill="url(#chip-grad)" />
                <path d="M0 10H14M0 20H14M26 10H40M26 20H40M14 0V30M26 0V30" stroke="#92400e" strokeWidth="1" opacity="0.6" />
                <defs>
                  <linearGradient id="chip-grad" x1="0" y1="0" x2="40" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fbbf24" />
                    <stop offset="1" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontSize: "0.68rem", opacity: 0.8, fontWeight: 700, letterSpacing: "0.1em" }}>SECURE CHIP LOGIC</span>
            </div>

            {/* Number slots with slide animation */}
            <div id="card_number" className="card__number" aria-label="Card number">
              {displayedSlots.map((slot, idx) => (
                <span key={idx} className="slot">
                  <span className={`digit ${slot.filed ? "filed" : ""}`}>
                    <span className="row placeholder">#</span>
                    <span className="row value">{slot.textTop}</span>
                  </span>
                </span>
              ))}
            </div>

            <div className="card__footer">
              <div className="card__holder">
                <div className="card__section__title">Document Holder</div>
                <div id="card_holder" style={{ fontWeight: 800, fontSize: "0.86rem", letterSpacing: "0.04em", color: "#ffffff" }}>
                  {holder || "YOUR FULL NAME"}
                </div>
              </div>
              <div className="card__expires" style={{ textAlign: "right" }}>
                <div className="card__section__title">Verification Status</div>
                <span style={{
                  fontWeight: 900,
                  fontSize: "0.8rem",
                  color: number.length >= maxSlots ? "#4ade80" : "#fcd34d",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {number.length >= maxSlots ? "✓ READY" : `ENTER ${maxSlots} DIGITS`}
                </span>
              </div>
            </div>
          </section>
        </section>
      </div>
    </section>
  );
};

export { CreditCardForm };
export default CreditCardForm;
