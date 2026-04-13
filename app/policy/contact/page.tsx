export default function ContactPage() {
  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>문의 및 사업자 정보</h1>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>사업자 정보</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2 }}>
          상호명: MassLabs<br />
          대표자: Baek Jonghwi<br />
          사업자등록번호: 895-34-01789<br />
          주소: 서울특별시 성북구 정릉로8가길 12, 401호<br />
          전화: 070-8144-5867<br />
          이메일: masslabs.archi@gmail.com
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>문의</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          서비스 이용 관련 문의는 <strong>masslabs.archi@gmail.com</strong>으로 연락해 주세요.
        </p>
      </section>
    </main>
  );
}