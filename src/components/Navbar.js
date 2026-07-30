"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { href: "/", label: "الرئيسية" },
  { href: "/rules", label: "القوانين" },
  { href: "/store", label: "المتجر", cta: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="container">
        <Link className="brand" href="/">
          <img className="logo" src="/logo.svg" alt="NOVA RP" />
          <span className="brand-text">
            <b>NOVA</b>
            <small>ROLEPLAY</small>
          </span>
        </Link>
        <button className="nav-toggle" aria-label="menu" onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
        <ul className={"nav-links" + (open ? " open" : "")} onClick={() => setOpen(false)}>
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link
                className={p.cta ? "nav-cta" : isActive(p.href) ? "active" : ""}
                href={p.href}
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
