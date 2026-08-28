import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
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
  title: "MassLabs",
  description: "Rhino plug-in for architectural laser cutting drawings",
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
