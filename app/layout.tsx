import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { SITE_URL, SITE_NAME, HOME_TITLE, HOME_DESC, OG_SHARED } from "@/lib/seo";
import LanguageBar from "@/components/LanguageBar";
import LayoutFooter from "@/components/LayoutFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔴브랜드 그림의 원본은 public/images/icon/ **한 곳**이다(2026-08-28 사용자 결정).
//   전에는 app/icon.svg · app/favicon.ico 가 같은 그림을 한 벌 더 들고 있었다 —
//   마크를 고칠 때 한쪽만 고쳐지고 브라우저에 옛 아이콘이 남는 자리라 지웠다.
//   그래서 Next 의 파일 규약(app/icon.*) 대신 여기서 **주소로 가리킨다.**
//   ⚠️Next 문서는 반대로 파일 규약을 권한다 — 설정과 파일이 어긋날 수 있어서다.
//     그 대가로: 폴더에서 **파일 이름을 바꾸면 여기 주소도 같이 바꿀 것.**
//     빌드는 안 깨지고 아이콘만 조용히 사라진다.
//   ⚠️맨 주소 /favicon.ico 를 찾는 옛 브라우저·크롤러는 next.config.ts 의
//     rewrite 가 이 폴더로 넘긴다. app/favicon.ico 를 지웠으니 그게 없으면 404 다.
//   ⚠️.ico 를 먼저, .svg 를 나중에 적는다 — 둘 다 읽는 브라우저가 뒤엣것(선명한
//     벡터)을 고르고, .ico 밖에 모르는 옛 브라우저도 앞엣것을 집어 간다.
export const metadata: Metadata = {
  // 🔴모든 상대주소의 뿌리. 이게 있어야 아래 openGraph.url 이나 각 화면의
  //   canonical 을 "/price" 처럼 짧게 적을 수 있다 — 없으면 빌드가 깨진다.
  metadataBase: new URL(SITE_URL),

  // 🔴default 와 template 이 한 벌이다. 홈은 default 를 그대로 쓰고(이미 이름이
  //   들어 있어 뒤에 또 붙이면 "MassLabs … | MassLabs" 가 된다), 아래 화면들은
  //   제 layout.tsx 에서 짧은 이름만 적으면 template 이 " | MassLabs" 를 붙여 준다.
  //   ⚠️template 은 **자식 구역에만** 걸린다. 같은 파일의 default 에는 안 붙는다.
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: HOME_DESC,
  applicationName: SITE_NAME,

  // 🔴홈의 정본 주소. 화면마다 제 것을 lib/seo.ts 의 pageMeta 가 덮어쓴다.
  alternates: { canonical: "/" },

  // 🔴카톡·슬랙·트위터에 링크를 붙였을 때 뜨는 미리보기.
  //   🔴공통 값(그림·종류·서비스명)은 lib/seo.ts 의 OG_SHARED 에서 펴 온다.
  //     화면마다 pageMeta 가 같은 것을 펴 쓴다 — Next 가 openGraph 를 **통째로**
  //     갈아 끼우기 때문에, 한 곳에 모아 두지 않으면 하위 화면에서 그림이 사라진다.
  openGraph: { ...OG_SHARED, url: "/", title: HOME_TITLE, description: HOME_DESC },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESC },

  icons: {
    icon: [
      { url: "/images/icon/MassLabs-favicon.ico", sizes: "any" },
      { url: "/images/icon/MassLabs-rounded.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '977503938628515');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=977503938628515&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <LanguageProvider>
          <LanguageBar />
          {children}
          <LayoutFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
