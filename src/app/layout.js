import "./globals.css";
import { Tajawal, Orbitron } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Fab from "@/components/Fab";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata = {
  title: "NOVA RP — روليبلاي",
  description: "أقوى تجربة روليبلاي عربية — قوانين، تفعيل، ومتجر.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${orbitron.variable}`}>
      <body>
        <Navbar />
        {children}
        <Fab />
        <Footer />
      </body>
    </html>
  );
}
