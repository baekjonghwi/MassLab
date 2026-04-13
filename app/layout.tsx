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
            {/* 정책 링크 */}
            <div style={{ display: "flex", gap: "24px", fontSize: "0.78rem" }}>
              <Link href="/policy/contact" style={{ color: "#666", textDecoration: "none" }}>Contact</Link>
              <Link href="/policy/terms-and-policy" style={{ color: "#666", textDecoration: "none" }}>Terms and Policy</Link>
              <Link href="/policy/privacy" style={{ color: "#666", textDecoration: "none" }}>Privacy</Link>
            </div>

          </div>
        </footer>
      </body>
    </html>
  );
}