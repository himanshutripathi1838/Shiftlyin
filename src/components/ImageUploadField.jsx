import { useEffect, useId, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUploadField({ label, hint, file, onChange }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [file]);

  function selectFile(nextFile) {
    setError("");
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    onChange(nextFile);
  }

  function removeFile(event) {
    event.stopPropagation();
    onChange(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="image-upload-field">
      <span className="upload-label">{label}</span>
      <button
        type="button"
        className={`image-drop-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          selectFile(event.dataTransfer.files?.[0]);
        }}
        aria-describedby={`${inputId}-hint`}
      >
        {file ? (
          <>
            <img src={previewUrl} alt="" className="upload-preview" />
            <span className="upload-file-info">
              <span className="upload-file-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m5 17 4-4 3 3 2-2 5 5" /></svg>
              </span>
              <span>
                <strong>{file.name}</strong>
                <small>{formatFileSize(file.size)} · Click to replace</small>
              </span>
            </span>
            <span
              className="remove-upload"
              role="button"
              tabIndex="0"
              aria-label={`Remove ${label}`}
              onClick={removeFile}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") removeFile(event);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </span>
          </>
        ) : (
          <>
            <span className="upload-main-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 14v5h14v-5" /></svg>
            </span>
            <strong>Upload image</strong>
            <span id={`${inputId}-hint`}>{hint || "Click or drag and drop"}</span>
            <small>PNG, JPG or WebP · Maximum 5 MB</small>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        id={inputId}
        className="visually-hidden-file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      {error && <span className="upload-error" role="alert">{error}</span>}
    </div>
  );
}
