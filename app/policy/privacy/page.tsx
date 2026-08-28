"use client";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";
import PolicyView from "@/components/PolicyView";

// ==========================================================================
//  개인정보처리방침. 화면은 components/PolicyView 가 그린다(약관과 한 벌).
//  🔴글은 lib/translations 의 t[lang].privacy 가 유일한 출처다 — PG 가맹점 심사에
//    낸 문서라 여기서 새로 적거나 고치지 않는다.
// ==========================================================================

export default function PrivacyPage() {
  const { lang } = useLanguage();

  return (
    <PolicyView
      eyebrow={{ ko: "개인정보", en: "Privacy" }}
      doc={t[lang].privacy}
    />
  );
}
