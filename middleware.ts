import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const host = req.headers.get("host");
    const url = req.nextUrl.clone();

    // Canonicalize domain: Redirect www.gway.uz to gway.uz
    if (host === "www.gway.uz") {
      url.host = "gway.uz";
      return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Allow access to public pages
        if (pathname === "/" || pathname === "/login") return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
