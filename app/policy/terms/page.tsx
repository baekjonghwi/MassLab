export default function TermsPage() {
  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>이용약관</h1>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제1조 (목적)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>본 약관은 MassLabs(이하 "회사")가 제공하는 LaserFish 소프트웨어 서비스(이하 "서비스") 이용에 관한 조건 및 절차, 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제2조 (서비스 내용)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>회사는 Rhino 및 Grasshopper 환경에서 작동하는 레이저 커팅 도면 자동 생성 플러그인(LaserFish)을 디지털 다운로드 형태로 제공합니다. 결제 완료 즉시 다운로드가 가능하며, 별도의 배송은 없습니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제3조 (이용계약 성립)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>이용계약은 이용자가 본 약관에 동의하고 결제를 완료한 시점에 성립됩니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제4조 (저작권)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>서비스 내 모든 소프트웨어, 콘텐츠의 저작권은 MassLabs에 귀속됩니다. 이용자는 구매한 소프트웨어를 제3자에게 양도, 재판매, 배포할 수 없습니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제5조 (면책조항)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>회사는 이용자의 모델링 상태, 라이노 환경 오류 등으로 인해 결과물이 완벽하지 않을 수 있음을 고지합니다. 이로 인한 손해에 대해 회사는 책임을 지지 않습니다.</p>
      </section>

      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "48px" }}>시행일: 2026년 4월 1일</p>
    </main>
  );
}