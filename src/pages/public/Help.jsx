import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { helpTranslations } from "../../data/helpTranslations.js";
import { db } from "../../services/firebase.js";

const languageOptions = ["hinglish", "hi", "en"];

export default function Help() {
  const { currentUser, profile } = useAuth();
  const [language, setLanguage] = useState(() => localStorage.getItem("hustlr-help-language") || "hinglish");
  const [search, setSearch] = useState("");
  const [report, setReport] = useState({ reportType: "technical", jobId: "", reason: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const content = helpTranslations[language] || helpTranslations.hinglish;

  useEffect(() => {
    localStorage.setItem("hustlr-help-language", language);
  }, [language]);

  const filteredTopics = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(language === "hi" ? "hi-IN" : "en-IN");
    if (!term) return content.topics;
    return content.topics
      .map((topic) => ({
        ...topic,
        questions: topic.questions.filter(([question, answer]) =>
          `${topic.title} ${topic.description} ${question} ${answer}`.toLocaleLowerCase().includes(term)
        )
      }))
      .filter((topic) =>
        topic.title.toLocaleLowerCase().includes(term) ||
        topic.description.toLocaleLowerCase().includes(term) ||
        topic.questions.length > 0
      );
  }, [content, language, search]);

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setSearch("");
    setNotice("");
    setError("");
  }

  async function submitReport(event) {
    event.preventDefault();
    if (!currentUser) return;
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      await addDoc(collection(db, "reports"), {
        reportType: report.reportType,
        reportedBy: currentUser.uid,
        reportedByName: profile?.name || profile?.businessName || profile?.email || "",
        reportedByRole: profile?.role || "",
        helpLanguage: language,
        againstUser: "",
        jobId: report.jobId.trim(),
        reason: report.reason.trim(),
        status: "pending",
        createdAt: serverTimestamp()
      });
      setReport({ reportType: "technical", jobId: "", reason: "" });
      setNotice(content.success);
    } catch (err) {
      setError(err.message || content.failure);
    } finally {
      setSubmitting(false);
    }
  }

  const dashboardPath = profile?.role === "business" ? "/business" : "/student";

  return (
    <main className="help-page" lang={language === "hi" ? "hi" : "en"}>
      <section className="help-hero">
        <div>
          <span className="eyebrow">{content.support}</span>
          <h1>{content.heading}</h1>
          <p>{content.intro}</p>
        </div>
        <div className="help-controls">
          <label className="help-language">
            <span>{content.languageLabel}</span>
            <select value={language} onChange={(event) => changeLanguage(event.target.value)}>
              {languageOptions.map((option) => (
                <option key={option} value={option}>{helpTranslations[option].languageName}</option>
              ))}
            </select>
          </label>
          <label className="help-search">
            <span>{content.searchLabel}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={content.searchPlaceholder}
            />
          </label>
        </div>
      </section>

      <section className="help-content">
        <nav className="help-quick-links" aria-label={content.searchLabel}>
          {currentUser ? (
            <>
              <Link to={dashboardPath}>{content.quickLinks.dashboard}</Link>
              <Link to="/applications">{content.quickLinks.applications}</Link>
              <Link to="/attendance">{content.quickLinks.attendance}</Link>
              <Link to="/chat">{content.quickLinks.chat}</Link>
              <Link to="/profile">{content.quickLinks.profile}</Link>
            </>
          ) : (
            <>
              <Link to="/login">{content.quickLinks.login}</Link>
              <Link to="/register">{content.quickLinks.register}</Link>
            </>
          )}
        </nav>

        <div className="help-topic-grid">
          {filteredTopics.map((topic) => (
            <section className="help-topic" key={topic.title}>
              <div className="help-topic-heading">
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
              </div>
              <div className="help-faq-list">
                {topic.questions.map(([question, answer]) => (
                  <details key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
                {topic.questions.length === 0 && <p className="empty-state">{content.noSectionMatch}</p>}
              </div>
            </section>
          ))}
          {filteredTopics.length === 0 && (
            <div className="panel help-empty">
              <h2>{content.noAnswer}</h2>
              <p>{content.noAnswerHint}</p>
            </div>
          )}
        </div>

        <section className="help-report-section">
          <div className="help-report-copy">
            <span className="eyebrow">{content.needMore}</span>
            <h2>{content.reportHeading}</h2>
            <p>{content.reportIntro}</p>
          </div>
          {currentUser ? (
            <form className="panel form-stack help-report-form" onSubmit={submitReport}>
              {notice && <p className="notice" aria-live="polite">{notice}</p>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <label>{content.problemType}
                <select
                  value={report.reportType}
                  onChange={(event) => setReport((current) => ({ ...current, reportType: event.target.value }))}
                >
                  {Object.entries(content.reportTypes).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>{content.jobId} <small>({content.optional})</small>
                <input
                  value={report.jobId}
                  onChange={(event) => setReport((current) => ({ ...current, jobId: event.target.value }))}
                  placeholder={content.jobPlaceholder}
                />
              </label>
              <label>{content.explain}
                <textarea
                  required
                  minLength="10"
                  value={report.reason}
                  onChange={(event) => setReport((current) => ({ ...current, reason: event.target.value }))}
                  placeholder={content.explainPlaceholder}
                />
              </label>
              <button className="primary-button" disabled={submitting}>
                {submitting ? content.submitting : content.submit}
              </button>
            </form>
          ) : (
            <div className="panel help-login-prompt">
              <p>{content.loginRequired}</p>
              <Link className="primary-button" to="/login">{content.loginButton}</Link>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
