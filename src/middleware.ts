// REVIEWED

import { NextRequest, NextResponse } from "next/server";

const PATHS_PROTECTED = ["/admin", "/dashboard"];
const PATHS_AUTHENTICATION = ["/sign-in", "/sign-up"];

export const middleware = async function middleware({
  url: RequestURL,
  nextUrl: NextURL,
  cookies,
}: NextRequest) {
  const { pathname } = NextURL;

  const token = cookies.get("payload-token");
  const isAuthenticated = token ? Boolean(token.value) : false;

  if (
    PATHS_PROTECTED.some((path) => pathname.startsWith(path)) &&
    !isAuthenticated
  ) {
    const redirectTo = new URL("/sign-in", RequestURL);
    redirectTo.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectTo);
  }

  if (
    PATHS_AUTHENTICATION.some((path) => pathname.startsWith(path)) &&
    isAuthenticated
  ) {
    let redirectTo = new URL("/", RequestURL);
    const redirect = NextURL.searchParams.get("redirect");

    if (redirect) redirectTo = new URL(redirect, RequestURL);

    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api).*)"],
};
