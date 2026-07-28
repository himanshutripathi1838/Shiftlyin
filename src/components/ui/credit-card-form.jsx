import React, { useEffect, useMemo, useState } from "react";

function formatNumberSpaces(num) {
  return num.replace(/\s+/g, "").replace(/(.{4})(?=. border-box)/g, "$1 ");
}

function clampDigits(value, maxLen) {
  return value.slice(0, maxLen);
}

const CreditCardForm = ({
  docType = "Aadhaar Card",
  defaultNumber = "",
  defaultHolder = "",
  defaultMonth = "12",
  defaultYear = "2032",
  defaultCVV = "888",
  maskMiddle = true,
  ring1 = "#2563eb",
  ring2 = "#10b981",
  showSubmit = false,
  onChange,
  onSubmit,
  className = "",
}) => {
  const [number, setNumber] = useState(defaultNumber);
  const [holder, setHolder] = useState((defaultHolder || "YOUR FULL NAME").toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(defaultCVV);
  const [focusField, setFocusField] = useState(null);

  useEffect(() => {
    setNumber(defaultNumber);
  }, [defaultNumber]);

  useEffect(() => {
    if (defaultHolder) {
      setHolder(defaultHolder.toUpperCase());
    }
  }, [defaultHolder]);

  const flip = focusField === "cvv";

  // Max slots depending on document type
  const maxSlots = useMemo(() => {
    if (docType === "Aadhaar Card") return 12;
    if (docType === "PAN Card") return 10;
    if (docType === "Voter ID") return 10;
    return 16; // Driving Licence
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

  const highlightClass = (() => {
    switch (focusField) {
      case "number":
        return "highlight__number";
      case "holder":
        return "highlight__holder";
      case "expire":
        return "highlight__expire";
      case "cvv":
        return "highlight__cvv";
      default:
        return "hidden";
    }
  })();

  const accentGradient = useMemo(() => {
    if (docType === "Aadhaar Card") return "linear-gradient(135deg, #059669, #10b981)";
    if (docType === "PAN Card") return "linear-gradient(135deg, #d97706, #f59e0b)";
    if (docType === "Driving Licence") return "linear-gradient(135deg, #7c3aed, #6366f1)";
    return "linear-gradient(135deg, #1d4ed8, #2563eb)";
  }, [docType]);

  return (
    <section className={`ccp ${className}`}>
      <div className="wrap">
        {/* CARD */}
        <section id="card" className={`card ${flip ? "flip" : ""}`}>
          <div id="highlight" className={highlightClass} />

          {/* FRONT */}
          <section
            className="card__front"
            style={{
              background: accentGradient,
              "--ring1": ring1,
              "--ring2": ring2,
            }}
          >
            <div className="card__header">
              <div style={{ fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                🇮🇳 {docType}
              </div>
              <div style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                VERIFIED ID
              </div>
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
                <div id="card_holder" style={{ fontWeight: 800, fontSize: "0.88rem", letterSpacing: "0.03em" }}>
                  {holder || "NAME ON CARD"}
                </div>
              </div>
              <div className="card__expires">
                <div className="card__section__title">Status</div>
                <span id="card_expires_month" style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                  {number.length >= 10 ? "VALID" : "ENTER ID"}
                </span>
              </div>
            </div>
          </section>

          {/* BACK */}
          <section className="card__back" style={{ background: accentGradient, "--ring1": ring1, "--ring2": ring2 }}>
            <div className="card__hide_line" />
            <div className="card_cvv">
              <span>SECURITY SEAL</span>
              <div id="card_cvv_field" className="card_cvv_field">
                OFFICIAL GOVT PROOF
              </div>
            </div>
          </section>
        </section>
      </div>

      <style jsx>{`
        .ccp {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 12px 0;
          color: #ffffff;
        }
        .wrap {
          width: 100%;
          max-width: 420px;
          display: flex;
          justify-content: center;
        }

        #highlight {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          z-index: 1;
          width: 0;
          height: 0;
          top: 0;
          left: 0;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          transition: 0.3s;
        }
        #highlight.hidden {
          display: none;
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          transform-style: preserve-3d;
          transition: 0.8s;
          perspective: 1000px;
        }
        .card.flip {
          transform: rotateY(180deg);
        }

        .card__front,
        .card__back {
          width: 100%;
          max-width: 420px;
          height: 220px;
          border-radius: 20px;
          padding: 20px 24px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
          color: #fff;
          overflow: hidden;
          margin: 0 auto;
          backface-visibility: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card__back {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotateY(180deg);
          padding: 20px 0 0;
        }

        .card__front::before,
        .card__back::before {
          content: "";
          position: absolute;
          border: 16px solid var(--ring1, #2563eb);
          border-radius: 100%;
          left: -17%;
          top: -45px;
          height: 280px;
          width: 280px;
          filter: blur(14px);
          opacity: 0.35;
        }

        .card__front::after,
        .card__back::after {
          content: "";
          position: absolute;
          border: 16px solid var(--ring2, #10b981);
          border-radius: 100%;
          width: 280px;
          top: 55%;
          left: -180px;
          height: 280px;
          filter: blur(14px);
          opacity: 0.35;
        }

        .card__hide_line {
          height: 38px;
          width: 100%;
          background-color: #1e293b;
          position: relative;
          z-index: 1;
        }

        .card_cvv {
          position: relative;
          z-index: 1;
          margin-top: 16px;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .card_cvv_field {
          margin-top: 6px;
          background-color: #ffffff;
          border-radius: 10px;
          height: 40px;
          width: 100%;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }

        .card__number {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 2px;
          position: relative;
          z-index: 1;
          display: flex;
          height: 32px;
          overflow: hidden;
          color: #fff;
          margin: 14px 0;
        }

        .card__number .slot {
          display: inline-flex;
          margin-right: 0;
        }

        .card__number .slot:nth-child(4n) {
          margin-right: 12px;
        }

        .card__number .digit {
          display: flex;
          flex-direction: column;
          height: 32px;
          line-height: 32px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card__number .digit.filed {
          transform: translateY(-32px);
        }

        .card__number .row {
          height: 32px;
          display: block;
        }

        .card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        .card__holder {
          text-transform: uppercase;
        }
        .card__section__title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 2px;
        }
      `}</style>
    </section>
  );
};

export { CreditCardForm };
export default CreditCardForm;
