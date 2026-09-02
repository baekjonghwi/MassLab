// ==========================================================================
//  거주 국가 목록 — 가입 화면(/login)과 가입 직후 한 번 묻는 화면(/welcome)이 함께 쓴다.
//
//  🔴여기 있는 건 **코드뿐**이다. 나라 이름은 브라우저의 Intl.DisplayNames 가
//    지금 화면 언어로 지어 준다. 이유:
//    · 249개 × (한국어·영어) 표를 손으로 적으면 두 벌이 반드시 갈라지고,
//      언어가 늘 때마다 표를 한 벌씩 더 적어야 한다.
//    · 나라 이름은 번역이 아니라 **표준 지역 이름**이라 브라우저가 우리보다 잘 안다
//      (archiMap 의 '나라·도시 이름은 번역하지 않는다' 규칙과 같은 결이다).
//  ⚠️Intl.DisplayNames 가 없는 아주 옛 브라우저에서는 코드 두 글자가 그대로 보인다
//    (KR·US). 목록이 통째로 비는 것보다 낫다 — 고르는 데는 지장이 없다.
//
//  🔴형식은 ISO 3166-1 alpha-2 대문자다. 이 값이 그대로 profiles.country 에 들어가고
//    /api/subscribe/session 이 그걸로 결제 채널을 가른다(KR → 토스, 나머지 → 엑심베이).
//
//  ⛔사람이 살지 않는 코드(AQ 남극·BV·HM·TF·UM·GS)는 뺐다 — '거주 국가'를 묻는
//    자리라 고를 일이 없고, 목록만 길어진다.
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

export type CountryOption = { code: string; name: string };

// 언어별로 한 번만 짓는다 — 249개 이름 짓기 + 정렬이 매 렌더마다 돌 이유가 없다.
const cache = new Map<string, CountryOption[]>();

// 🔴정렬은 **번역된 이름**으로, 그 언어의 규칙으로 한다(localeCompare).
//   코드순으로 두면 한국어 화면에서 '대한민국'이 K 자리에 박혀 아무도 못 찾는다.
export function countryOptions(lang: string): CountryOption[] {
  // 🔴언어 코드를 그대로 넘긴다(2026-09-03, 여덟 언어). 전에는 ko/en 둘로
  //   접었는데, 그러면 일본어 화면에서 나라 이름만 영어로 남는다.
  const key = lang || "en";
  const hit = cache.get(key);
  if (hit) return hit;

  let name: (c: string) => string = (c) => c;
  try {
    const dn = new Intl.DisplayNames([key], { type: "region" });
    name = (c) => dn.of(c) ?? c;
  } catch {
    /* 아주 옛 브라우저 — 코드 그대로 보여 준다 */
  }

  const list = COUNTRY_CODES.map((code) => ({ code, name: name(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, key));
  cache.set(key, list);
  return list;
}

// 화면에서 온 값을 그대로 믿지 않는다 — 목록에 있는 코드만 통과시킨다.
// 🔴서버(set_country RPC)도 같은 것을 다시 검사한다. 여기 검사는 사용자에게
//   말을 해 주기 위한 것이고, 진짜 방어선은 서버다.
export function isCountryCode(v: string | null | undefined): boolean {
  return !!v && /^[A-Z]{2}$/.test(v) && COUNTRY_CODES.includes(v);
}
