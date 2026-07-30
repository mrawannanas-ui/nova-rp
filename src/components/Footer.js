import Link from "next/link";
import { settings } from "@/lib/data";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/rules", label: "القوانين" },
  { href: "/activation", label: "التفعيل" },
  { href: "/store", label: "المتجر" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Link className="brand" href="/">
          <img className="logo" src="/logo.svg" alt="NOVA RP" />
          <span className="brand-text">
            <b>NOVA</b>
            <small>ROLEPLAY</small>
          </span>
        </Link>
        <div className="footer-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          {settings.discordInvite ? (
            <a href={settings.discordInvite} target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>
              💬 ديسكورد
            </a>
          ) : null}
        </div>
        <div>© {new Date().getFullYear()} NOVA RP — كل الحقوق محفوظة</div>
      </div>
    </footer>
  );
}
