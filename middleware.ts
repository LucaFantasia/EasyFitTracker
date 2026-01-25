import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/dashboard", "/workouts"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // Supabase will write refreshed cookies onto THIS response
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // refresh session if needed
  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const redirect = (to: string, withNext?: boolean) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    if (withNext) url.searchParams.set("next", pathname + search);

    const redirectResponse = NextResponse.redirect(url);

    // Copy cookies set on `response` into redirect response
    for (const c of response.cookies.getAll()) {
      // Only pass cookie options, not the whole object
      const { name, value, ...options } = c as any;
      redirectResponse.cookies.set(name, value, options);
    }

    return redirectResponse;
  };

  // "/" -> dashboard/login
  if (pathname === "/") return redirect(user ? "/dashboard" : "/login");

  // block protected routes if signed out
  if (!user && isProtected) return redirect("/login", true);

  // block login/signup if already signed in
  if (user && isAuthRoute) return redirect("/dashboard");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
