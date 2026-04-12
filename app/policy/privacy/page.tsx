export default function PrivacyPage() {
  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>개인정보처리방침</h1>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>1. 수집하는 개인정보 항목</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>회사는 결제 처리를 위해 이메일 주소, 결제 정보(카드사 및 결제 대행사를 통해 처리)를 수집합니다. 별도의 회원가입은 없으며, 최소한의 정보만 수집합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>2. 개인정보 수집 및 이용 목적</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>수집된 정보는 결제 처리, 영수증 발송, 환불 처리 등 서비스 제공 목적으로만 사용되며 제3자에게 제공되지 않습니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>3. 개인정보 보유 및 이용 기간</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>결제 관련 정보는 전자상거래법에 따라 5년간 보관 후 파기합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>4. 개인정보 처리 위탁</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>결제 처리를 위해 포트원(PortOne), 카카오페이, 토스페이 등 결제 대행사에 최소한의 정보를 위탁합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>5. 이용자의 권리</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>이용자는 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다. 요청은 masslabs.archi@gmail.com 으로 문의해 주세요.</p>
      </section>

      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "48px" }}>시행일: 2026년 4월 1일</p>
    </main>
  );
}