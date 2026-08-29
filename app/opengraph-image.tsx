// ==========================================================================
//  공유 미리보기 그림 — 카톡·슬랙·트위터·페이스북에 링크를 붙였을 때 뜨는 카드.
//
//  🔴Next 의 파일 규약이다. 여기 있으면 <head> 의 og:image·twitter:image 가
//    저절로 이 그림을 가리킨다 — app/layout.tsx 에 주소를 또 적지 말 것.
//    ⚠️뿌리(app/)에 있어서 **모든 화면이 이 한 장을 쓴다.** 화면마다 다른 카드를
//      쓰고 싶으면 그 구역 폴더에 같은 이름의 파일을 하나 더 두면 된다.
//
//  🔴그림 파일을 두지 않고 **코드로 그린다.** 브랜드 색·글자가 바뀌면 여기만
//    고치면 되고, 디자인 도구를 열어 1200×630 을 다시 뽑을 일이 없다.
//    ⚠️1200×630 은 규격이다. 정사각(public/images/icon/MassLabs-instagram-1080.png)을
//      쓰면 서비스마다 제멋대로 잘라 글자가 날아간다.
//
//  🔴글은 **영어로만** 쓴다. ImageResponse 가 기본으로 들고 있는 글자체에 한글이
//    없어서, 한국어를 적으면 네모(두부)로 찍힌다. 한국어 카드를 쓰려면 woff 를
//    직접 읽어 fonts 로 넘겨야 한다 — 첫 배포에서는 거기까지 안 갔다.
//    ⚠️검색결과에 뜨는 글(제목·설명)은 lib/seo.ts 가 한국어로 따로 낸다. 별개다.
//
//  색은 홈(components/LandingView)의 어두운 판에서 그대로 가져왔다.
//  ⛔여기서 색을 바꾸면 홈과 어긋난다 — 저쪽 --bg / --tx / --mut / --acc 를 볼 것.
// ==========================================================================

import { ImageResponse } from "next/og";

export const alt = "MassLabs — site analysis, model making and laser-cut drawings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0e0f",
          // ⚠️Satori 는 CSS 상속을 거의 안 한다 — 색·글자체를 자식마다 적어야 한다
          color: "#eceae6",
        }}
      >
        {/* 주황 짧은 선 — 홈 첫 화면의 강조색(--acc)과 같은 값이다 */}
        <div style={{ width: 64, height: 4, background: "#e8802e", marginBottom: 44 }} />
        <div style={{ fontSize: 116, fontWeight: 700, letterSpacing: -4, color: "#eceae6" }}>
          MassLabs
        </div>
        <div style={{ fontSize: 34, color: "#8a8a86", marginTop: 26, letterSpacing: -0.5 }}>
          Site analysis · Model making · Laser cutting
        </div>
        <div style={{ fontSize: 24, color: "#555552", marginTop: 52, letterSpacing: 3 }}>
          MASSLABS-ARCHI.COM
        </div>
      </div>
    ),
    { ...size },
  );
}
