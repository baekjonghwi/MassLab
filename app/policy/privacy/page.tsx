export default function PrivacyPage() {
  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>개인정보처리방침</h1>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제1조 (개인정보의 처리 목적)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          MassLabs(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 아래 목적 이외의 용도로 이용되지 않으며, 이용 목적이 변경될 경우 별도의 동의를 받는 등 필요한 조치를 이행합니다.
        </p>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>결제 처리: 서비스 이용료 결제 및 환불 처리</li>
          <li>서비스 통계 분석: 이용자 국가 정보를 활용한 서비스 개선</li>
          <li>학습 데이터 수집: 이용자가 결제 전 동의한 경우에 한하여 결과물 데이터를 수집</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제2조 (수집하는 개인정보 항목)</h2>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>결제 정보: 결제 수단 정보 (카드번호 등 민감정보는 결제 대행사를 통해 처리되며 회사가 직접 저장하지 않음)</li>
          <li>국가 정보: 이용자의 접속 국가</li>
          <li>결과물 데이터: Grasshopper 플러그인 결과물(점, 벡터값, 두께) 수집</li>
        </ul>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9, marginTop: "8px" }}>
          회사는 이메일 주소를 수집하지 않으며, 별도의 회원가입 절차가 없습니다.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제3조 (개인정보의 보유 및 이용 기간)</h2>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>결제 정보: 전자상거래법에 따라 5년간 보관 후 파기</li>
          <li>국가 정보: 통계 처리 후 개인 식별이 불가능한 형태로 보관</li>
          <li>결과물 데이터: 이용자가 동의를 철회하기 전까지 보관, 철회 시 지체 없이 파기</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제4조 (개인정보 처리의 위탁)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          회사는 결제 처리를 위해 포트원(PortOne)을 통해 카카오페이, 갤럭시아머니트리(빌게이트) 등 결제 대행사에 최소한의 정보를 위탁합니다. 위탁받은 업체는 개인정보보호법에 따라 개인정보를 안전하게 처리하도록 관리·감독됩니다.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제5조 (개인정보의 제3자 제공)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령에 의한 요구가 있는 경우에는 예외로 합니다.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제6조 (이용자의 권리)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 결과물 데이터 수집에 대한 동의도 언제든지 철회할 수 있습니다. 요청은 <strong>masslabs.archi@gmail.com</strong>으로 문의해 주세요.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제7조 (개인정보의 파기)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복원이 불가능한 방법으로 영구 삭제합니다.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제8조 (개인정보 보호책임자)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          개인정보 처리에 관한 문의는 아래 책임자에게 연락해 주세요.<br />
          대표: Baek Jonghwi &nbsp;|&nbsp; 이메일: masslabs.archi@gmail.com
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제9조 (권익침해 구제 방법)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          개인정보 침해로 인한 구제를 받기 위해 아래 기관에 문의하실 수 있습니다.
        </p>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>개인정보분쟁조정위원회: 1833-6972 / www.kopico.go.kr</li>
          <li>개인정보침해신고센터: 118 / privacy.kisa.or.kr</li>
          <li>대검찰청: 1301 / www.spo.go.kr</li>
          <li>경찰청: 182 / ecrm.cyber.go.kr</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제10조 (개인정보처리방침 변경)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          본 방침은 시행일로부터 적용되며, 변경 사항이 있을 경우 시행 7일 전부터 서비스 화면을 통해 고지합니다.
        </p>
      </section>

      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "48px" }}>시행일: 2026년 4월 13일</p>
    </main>
  );
}