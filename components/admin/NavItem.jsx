"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItem({ title, href }) {
  const pathname = usePathname();

  const isActive =
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link href={href} className={`nav-item ${isActive ? "active" : ""}`}>
      {title}
    </Link>
  );
}
