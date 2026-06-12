import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trang Kids speak",
  description: "สื่อออนไลน์เรียนรู้บทสนทนาผ่านวิดีโออนิเมชั่นสำหรับการฝึกพูดและออกเสียงภาษาอังกฤษสำหรับเด็ก ประเมินผลสดผ่าน Web Speech API ได้ฟรี ไม่มีค่าใช้จ่าย",
  keywords: "Trang Kids speak, ฝึกพูดภาษาอังกฤษ, สื่อการเรียนรู้สำหรับเด็ก, ฝึกออกเสียงภาษาอังกฤษ, Web Speech API, Next.js, ออกเสียงภาษาอังกฤษ",
  authors: [{ name: "Antigravity Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

