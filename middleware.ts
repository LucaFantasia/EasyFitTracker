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

  // This response is where Supabase will write refreshed cookies
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

  // Refresh/sync session (may set cookies on `response`)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Helper: create a redirect *and copy any cookies Supabase set*
  const redirectWithCookies = (toPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = toPath;

    const redirectResponse = NextResponse.redirect(url);

    // copy cookies from `response` (where Supabase wrote them) into redirect response
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });

    return redirectResponse;
  };

  // Root redirect
  if (pathname === "/") {
    return redirectWithCookies(user ? "/dashboard" : "/login");
  }

  // Not signed in -> block protected routes
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);

    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
  }

  // Signed in -> keep them out of login/signup
  if (user && isAuthRoute) {
    return redirectWithCookies("/dashboard");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
