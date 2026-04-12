export default function RefundPage() {
  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>환불정책</h1>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>1. 환불 원칙</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>LaserFish는 디지털 소프트웨어 상품으로, 결제 완료 후 즉시 다운로드가 제공됩니다. 디지털 콘텐츠의 특성상 다운로드 완료 후에는 환불이 불가합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>2. 환불 가능한 경우</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>다음의 경우 전액 환불이 가능합니다.</p>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>결제 후 기술적 오류로 인해 다운로드가 불가한 경우</li>
          <li>결제 완료 후 다운로드 전 환불 요청한 경우</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>3. 환불 신청 방법</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>환불 요청은 masslabs.archi@gmail.com 으로 결제일, 결제 금액, 환불 사유를 포함하여 문의해 주세요. 확인 후 영업일 기준 3~5일 이내 처리됩니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>4. 기타</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>모델링 상태, 사용자 환경 등의 이유로 결과물이 완벽하지 않은 경우는 환불 사유에 해당하지 않습니다. 자세한 문의는 masslabs.archi@gmail.com 으로 연락해 주세요.</p>
      </section>

      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "48px" }}>시행일: 2026년 4월 1일</p>
    </main>
  );
}