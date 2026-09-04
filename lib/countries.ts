// ==========================================================================
//  국가 코드 — 접속 국가(x-vercel-ip-country)를 걸러 받는 데 쓴다.
//
//  🔴형식은 ISO 3166-1 alpha-2 대문자다. 이 값이 그대로 profiles.country 에 들어가고
//    /api/subscribe/session 이 그걸로 결제 채널을 가른다(KR → 토스, 나머지 → 엑심베이).
//
//  ⛔사람이 살지 않는 코드(AQ 남극·BV·HM·TF·UM·GS)는 뺐다 — '거주 국가'를 담는
//    칸이라 나올 일이 없다. 엣지가 그런 코드를 주면 모르는 것으로 친다.
//  ⛔여기 있던 화면용 목록(countryOptions·CountryOption)은 지웠다(2026-09-05) —
//    가입 화면의 국가 드롭다운을 없애면서 쓰는 곳이 사라졌다. 다시 만들지 말 것:
//    국가는 묻지 않고 로그인 때 접속 국가로 적는다.
// ==========================================================================

const ISO2 =
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET " +
  "FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU " +
  "ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ " +
  "LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
  "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
  "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ " +
  "UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW";

export const COUNTRY_CODES: string[] = ISO2.split(" ");

// 밖에서 온 값을 그대로 믿지 않는다 — 목록에 있는 코드만 통과시킨다.
// 🔴서버(set_country RPC)도 같은 것을 다시 검사한다. 여기 검사는 엉뚱한 값이
//   RPC 까지 가서 예외로 터지는 것을 막는 앞단이고, 진짜 방어선은 DB다.
export function isCountryCode(v: string | null | undefined): boolean {
  return !!v && /^[A-Z]{2}$/.test(v) && COUNTRY_CODES.includes(v);
}

// --------------------------------------------------------------------------
//  접속 국가 — Vercel 엣지가 요청마다 붙여 주는 IP 추정 국가.
// --------------------------------------------------------------------------
// 🔴이 값이 profiles.country 의 **유일한 주인**이다(2026-09-05 결정). 로그인할
//   때마다 지금 접속한 나라로 덮는다 — 이사·이민을 사람이 다시 알려 주지 않아도
//   따라가고, 결제창 통화가 "옛날에 적어 둔 나라"로 뜨는 일이 없어진다.
//   ⚠️그 대가로 **여행 중 로그인하면 그 나라로 바뀐다.** 알고 고른 것이다.
// ⚠️Vercel 밖(로컬 개발)에서는 헤더가 아예 없고, 못 알아낸 요청에는 "XX"·"T1"(Tor)이
//   온다 — 셋 다 isCountryCode 가 걸러 null 이 된다. 모르면 안 적는 쪽이 맞다.
export function ipCountry(h: Headers): string | null {
  const c = (h.get("x-vercel-ip-country") ?? "").trim().toUpperCase();
  return isCountryCode(c) ? c : null;
}
