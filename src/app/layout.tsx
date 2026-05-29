import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ผจญภัยฝึกพูดภาษาไทยกับไดโนน้อย | Kids Speech Adventures 🦖🎉",
  description: "สื่อออนไลน์เรียนรู้บทสนทนาผ่านวิดีโออนิเมชั่นสำหรับการฝึกพูดและออกเสียงภาษาไทยสำหรับเด็ก ประเมินผลสดผ่าน Web Speech API ได้ฟรี ไม่มีค่าใช้จ่าย",
  keywords: "ฝึกพูดภาษาไทย, สื่อการเรียนรู้สำหรับเด็ก, ฝึกออกเสียง, Web Speech API, Next.js, ออกเสียงภาษาไทย",
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

