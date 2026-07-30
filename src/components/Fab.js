"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Fab() {
  const pathname = usePathname();
  // hide on the store page
  if (pathname.startsWith("/store")) return null;
  return (
    <Link className="fab" href="/store" aria-label="المتجر">
      <span className="fab-ico">🛒</span>
      <span className="fab-txt">المتجر</span>
    </Link>
  );
}
