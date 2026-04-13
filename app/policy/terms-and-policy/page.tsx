"use client";
import { useRouter } from "next/navigation";

export default function TermsAndPolicyPage() {
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

      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>이용약관 및 환불정책</h1>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제1조 (목적)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>본 약관은 MassLabs(이하 "회사")가 제공하는 LaserFish 소프트웨어 서비스(이하 "서비스") 이용에 관한 조건 및 절차, 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제2조 (정의)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>"서비스"란 회사가 제공하는 Grasshopper 플러그인 다운로드 서비스를 말합니다.<br />
        "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.<br />
        "디지털 상품"이란 서비스를 통해 제공되는 Grasshopper 플러그인(.gha) 등 디지털 콘텐츠를 말합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제3조 (약관의 효력 및 변경)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경 사유를 7일 이전부터 공지합니다. 이용자에게 불리한 변경의 경우 최소 30일 이상의 사전 유예기간을 둡니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제4조 (서비스 내용)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>회사는 Rhino 및 Grasshopper 환경에서 작동하는 레이저 커팅 도면 자동 생성 플러그인(LaserFish)을 디지털 다운로드 형태로 제공합니다. 결제 완료 즉시 다운로드가 가능하며, 별도의 배송은 없습니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제5조 (호환성 및 동작 환경)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>LaserFish의 동작 환경(Rhino 버전, Grasshopper 버전 등)은 상품 페이지에 명시된 사양을 기준으로 합니다. 명시되지 않은 환경에서의 동작은 보장하지 않으며, 이용자의 소프트웨어 환경 차이로 인한 오작동에 대해 회사는 책임지지 않습니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제6조 (이용계약 성립)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>이용계약은 이용자가 본 약관에 동의하고 결제를 완료한 시점에 성립됩니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제7조 (이용자의 의무)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>이용자는 서비스 이용 시 관계 법령 및 본 약관을 준수해야 하며, 다음 행위를 해서는 안 됩니다.</p>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>구매한 소프트웨어의 제3자 양도, 재판매, 무단 배포 및 공유</li>
          <li>소프트웨어의 리버스 엔지니어링, 디컴파일, 소스 추출</li>
          <li>서비스의 안정적 운영을 방해하는 행위</li>
          <li>기타 불법적이거나 부당한 행위</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제8조 (저작권)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>서비스 내 모든 소프트웨어 및 콘텐츠의 저작권은 MassLabs에 귀속됩니다. 이용자는 구매한 소프트웨어를 개인 또는 업무 목적으로만 사용할 수 있으며, 제3자에게 양도, 재판매, 배포할 수 없습니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제9조 (면책조항)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>회사는 다음의 경우 책임을 지지 않습니다.</p>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>이용자의 모델링 상태, Rhino/Grasshopper 버전, 플러그인 충돌 등 사용자 환경으로 인한 오작동</li>
          <li>이용자의 귀책사유로 인한 서비스 이용 장애</li>
          <li>천재지변, 전쟁, 통신 장애 등 불가항력적 사유로 인한 서비스 중단</li>
        </ul>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9, marginTop: "8px" }}>단, 상품 페이지에 명시된 환경에서 정상 작동하지 않는 경우 회사가 수정 또는 환불 조치를 취합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제10조 (환불 원칙)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>LaserFish는 디지털 소프트웨어 상품으로, 결제 완료 후 즉시 다운로드가 제공됩니다. 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라, 복제 가능한 디지털 콘텐츠의 특성상 다운로드 완료 후에는 원칙적으로 환불이 불가합니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제11조 (환불 가능한 경우)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>다음의 경우 전액 환불이 가능합니다.</p>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>결제 후 기술적 오류로 인해 다운로드가 불가한 경우</li>
          <li>프로그램상 오류로 결과물이 제대로 출력되지 않는 경우</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제12조 (환불 불가한 경우)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>다음의 경우 환불이 불가합니다.</p>
        <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
          <li>다운로드 완료 후 단순 변심에 의한 환불 요청</li>
          <li>이용자의 모델링 상태, 사용자 환경 등으로 인한 결과물 불만족</li>
          <li>이용자의 Rhino/Grasshopper 버전이 명시된 요구 사양과 다른 경우</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제13조 (환불 신청 방법)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          환불 요청은 결제일로부터 7일 이내에 <strong>masslabs.archi@gmail.com</strong>으로 아래 내용을 포함하여 접수해 주세요.<br /><br />
          결제일 및 결제 금액 영수증 / 환불 사유 / 오류 증거 사진 / 원본 모델링 파일 및 결과물 모델링 파일<br /><br />
          접수 후 원본 모델링을 바탕으로 프로그램 정상 작동 여부를 확인합니다. 결과물이 정상적으로 출력될 경우 해당 결과물을 요청자 이메일로 전달해 드리며, 이 경우 환불은 불가합니다. 프로그램 오류로 확인된 경우에는 영업일 기준 3~5일 이내에 환불 처리됩니다.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제14조 (분쟁 해결)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 원만한 해결을 위해 성실히 협의합니다. 전자상거래 분쟁과 관련하여 이용자의 피해구제 신청이 있는 경우 공정거래위원회 또는 관련 분쟁조정기관의 조정에 따를 수 있습니다. 협의가 이루어지지 않는 경우 대한민국 법을 적용하며, 관할 법원은 관련 법령에 따릅니다.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>제15조 (기타)</h2>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>본 약관에 명시되지 않은 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」 및 관련 법령에 따릅니다.</p>
      </section>

      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "48px" }}>시행일: 2026년 4월 13일</p>
    </main>
  );
}