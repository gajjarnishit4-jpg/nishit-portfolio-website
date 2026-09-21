import { NextRequest, NextResponse } from "next/server";
import { fullstackAssetPaths } from "./tenant-assets";
import { FULLSTACK_ROUTE_PREFIX, isFullstackHost } from "./tenant-routing";

const fullstackRoutes = new Set([
  "/", "/about", "/process", "/pricing", "/support", "/privacy-policy", "/cookie-policy", "/terms-of-use", "/refund-policy", "/legal-notice",
  "/admin", "/admin/chats", "/admin/leads", "/admin/visitors",
  "/blog", "/news", "/llms.txt", "/llms-full.txt", "/feed.xml",
  "/api/chat", "/api/track", "/api/booking-lead", "/api/discount-lead", "/api/openai-ads-event", "/api/admin/login", "/api/admin/logout", "/api/admin/overview", "/api/admin/chat-action",
  "/robots.txt", "/sitemap.xml", "/favicon.ico",
]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const internalTenantRequest =
    pathname === FULLSTACK_ROUTE_PREFIX ||
    pathname.startsWith(`${FULLSTACK_ROUTE_PREFIX}/`);
  const publicPath = internalTenantRequest
    ? request.headers.get("x-site-path") || "/"
    : pathname;
  // The real Host selects the tenant. Never accept a caller-supplied tenant header.
  const fullstack = isFullstackHost(request.headers.get("host"), process.env.NODE_ENV === "development");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-site-tenant");
  requestHeaders.delete("x-site-path");
  requestHeaders.set("x-site-tenant", fullstack ? "fullstack" : "default");
  requestHeaders.set("x-site-path", publicPath);

  // Rewrites are evaluated by the proxy a second time in development. Allow the
  // dedicated app's internal route to resolve, while keeping other tenant paths closed.
  if (internalTenantRequest) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (pathname === "/tenant" || pathname.startsWith("/tenant/")) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!fullstack) {
    if (pathname.startsWith("/tenant-assets/")) return new NextResponse("Not found", { status: 404 });
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const assetPrefix = "/tenant-assets/fullstack";
  if (pathname.startsWith("/tenant-assets/")) {
    if (!pathname.startsWith(assetPrefix + "/") || !fullstackAssetPaths.has(pathname.slice(assetPrefix.length))) {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (pathname === "/_next/image") {
    const imageUrl = request.nextUrl.searchParams.get("url") || "";
    if (!imageUrl.startsWith(assetPrefix + "/") || !fullstackAssetPaths.has(imageUrl.slice(assetPrefix.length))) {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (pathname.startsWith("/_next/")) return NextResponse.next({ request: { headers: requestHeaders } });
  if (!fullstackRoutes.has(pathname) && !pathname.startsWith("/blog/")) return new NextResponse("Page not found", { status: 404 });

  const destination = request.nextUrl.clone();
  if (pathname === "/favicon.ico") destination.pathname = `${assetPrefix}/fullstack-icon.svg`;
  else destination.pathname = `${FULLSTACK_ROUTE_PREFIX}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
  // Tenant pages are dynamic; never reuse another hostname's cached HTML.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/webpack-hmr).*)"],
};
