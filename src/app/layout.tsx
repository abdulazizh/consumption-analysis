import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تحليل صرفيات المستهلك",
  description: "نظام تحليل بيانات استهلاك المشتركين - عرض القراءات والاستهلاك والمعدلات اليومية",
  keywords: ["تحليل استهلاك", "صرفيات", "مستهلك", "قراءات", "استهلاك الطاقة"],
  authors: [{ name: "abdulaziz H Marie" }],
  icons: {
    icon: "https://scontent.fosm23-1.fna.fbcdn.net/v/t39.30808-6/597791678_122149765448925886_173399668230574045_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGAH098HVGOikOC0r8lzeO1XTL-KxwTRh5dMv4rHBNGHkaUza-uTgbqdw_fUC76kYMu-mZVo-0h72Vb86xvCDQr&_nc_ohc=iOt_o0pu6J8Q7kNvwEIZQuA&_nc_oc=Adm_rghz5pJiqfFVpaKR_YAxzJODyCKCO6-6FvuKIcwheU6G0PjVtxUuLUyDJ6jg4kM&_nc_zt=23&_nc_ht=scontent.fosm23-1.fna&_nc_gid=wA2KmJQAnNw_g-8HPpJyZA&oh=00_Afu5RWxTAV4aqiXS7dvJS0DIBTWY4FACPd9aJ07O7Je7ZA&oe=699A5AC4",
  },
  openGraph: {
    title: "تحليل صرفيات المستهلك",
    description: "نظام تحليل بيانات استهلاك المشتركين",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
