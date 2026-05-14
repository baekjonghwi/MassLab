"use client";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>

      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "none",
          fontSize: "0.82rem",
          color: "#888",
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "0",
          marginBottom: "40px",
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>Contact & Business Info</h1>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>Business Info</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2 }}>
          Company: MassLabs<br />
          Representative: Baek Jonghwi<br />
          Business Registration No.: 895-34-01789<br />
          Address: 12 Jeongnungaro 8ga-gil, Seongbuk-gu, Seoul, Korea, #401<br />
          Phone: 070-8144-5867<br />
          Email: masslabs.archi@gmail.com
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>Inquiries</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          For service-related inquiries, please contact <strong>masslabs.archi@gmail.com</strong>.
        </p>
      </section>
    </main>
  );
}