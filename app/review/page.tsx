"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";

function ReviewContent() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = t[lang].review;

  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("reviewPaymentId");
    if (!id) {
      router.replace("/");
      return;
    }
    setPaymentId(id);
  }, [router]);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("paymentId", paymentId ?? "");
      formData.append("nickname", nickname);
      formData.append("review", review);
      if (photo) formData.append("photo", photo);

      const res = await fetch("/api/submit-review", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError(tr.errorDesc);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", maxWidth: "360px", padding: "0 24px" }}>
        <div style={{
          width: "64px", height: "64px", background: "#1a1a1a", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "10px" }}>
          {tr.successTitle}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.7, marginBottom: "28px" }}>
          {tr.successDesc}
        </p>
        <button
          onClick={() => router.push("/")}
          style={btnStyle}
        >
          {lang === "ko" ? "홈으로" : "Go Home"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "480px", padding: "0 24px" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "8px", textAlign: "center" }}>
        {tr.title}
      </h1>
      <p style={{ fontSize: "0.83rem", color: "#555", lineHeight: 1.7, marginBottom: "28px", textAlign: "center" }}>
        {tr.desc}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* Photo upload */}
        <div>
          <label style={labelStyle}>{tr.photoLabel}</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "1.5px dashed #ccc",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              background: "#fafafa",
              overflow: "hidden",
            }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "6px", objectFit: "contain" }} />
            ) : (
              <p style={{ fontSize: "0.82rem", color: "#aaa", margin: 0 }}>{tr.photoPlaceholder}</p>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        </div>

        {/* Nickname */}
        <div>
          <label style={labelStyle}>{tr.nicknameLabel}</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={tr.nicknamePlaceholder}
            required
            style={inputStyle}
          />
        </div>

        {/* Review */}
        <div>
          <label style={labelStyle}>{tr.reviewLabel}</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={tr.reviewPlaceholder}
            required
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {error && (
          <p style={{ fontSize: "0.82rem", color: "#c00", margin: 0 }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{ ...btnStyle, background: "#f0f0f0", color: "#555", flex: "0 0 auto" }}
          >
            {tr.skip}
          </button>
          <button type="submit" disabled={submitting} style={{ ...btnStyle, flex: 1, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? tr.submitting : tr.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  marginBottom: "6px",
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #ddd",
  borderRadius: "8px",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

const btnStyle: React.CSSProperties = {
  padding: "11px 24px",
  background: "#1a1a1a",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.88rem",
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
};

export default function ReviewPage() {
  const { lang } = useLanguage();
  const tr = t[lang].review;

  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1a1a1a",
      padding: "40px 0",
    }}>
      <Suspense fallback={<p style={{ fontSize: "0.88rem", color: "#888" }}>{tr.submitting}</p>}>
        <ReviewContent />
      </Suspense>
    </main>
  );
}
