import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MassLabs",
  description: "Grasshopper add-on for architectural laser cutting drawings",
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
        {children}

        {/* 푸터 */}
        <footer style={{
          borderTop: "1px solid #eee",
          padding: "40px 48px",
          marginTop: "auto",
          fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

            {/* 사업자 정보 */}
            <div style={{ fontSize: "0.72rem", color: "#999", lineHeight: 1.7, marginBottom: "20px" }}>              <p>상호명: MassLabs &nbsp;|&nbsp; 대표자: Baek Jonghwi &nbsp;|&nbsp; 사업자등록번호: 895-34-01789</p>
              <p>주소: 서울특별시 성북구 정릉로8가길 12, 401호 &nbsp;|&nbsp; 전화: 010-9866-1206 &nbsp;|&nbsp; 이메일: masslabs.archi@gmail.com</p>
            </div>

            {/* 정책 링크 */}
            <div style={{ display: "flex", gap: "24px", fontSize: "0.78rem" }}>
              <Link href="/policy/terms" style={{ color: "#666", textDecoration: "none" }}>이용약관</Link>
              <Link href="/policy/privacy" style={{ color: "#666", textDecoration: "none" }}>개인정보처리방침</Link>
              <Link href="/policy/refund" style={{ color: "#666", textDecoration: "none" }}>환불정책</Link>
            </div>

          </div>
        </footer>

      </body>
    </html>
  );
}