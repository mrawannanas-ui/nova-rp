import { NextResponse } from "next/server";

const adminPaths = ["/admin", "/api/verify/log"];

export function middleware(request) {
  const { pathname, hostname } = request.nextUrl;
  const adminDomain = (process.env.ADMIN_DOMAIN || "admin.nova-country.com").toLowerCase();
  const isAdminDomain = hostname.toLowerCase() === adminDomain;
  const isAdminPath = adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isLogin = pathname === "/admin/login";
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  if (!isLocal && isAdminPath && !isAdminDomain) {
    const url = new URL(pathname, `https://${adminDomain}`);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && !isLogin && !request.cookies.has("nova_admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/verify/log/:path*"],
};