import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import type { Database, UserRole } from "@/types/database";

type MiddlewareCookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

const patientOnlyRoutes = ["/patient"];
const providerOnlyRoutes = ["/doctor"];

function routeRequiresRole(pathname: string): UserRole | null {
  if (patientOnlyRoutes.some((route) => pathname.startsWith(route))) {
    return "patient";
  }

  if (providerOnlyRoutes.some((route) => pathname.startsWith(route))) {
    return "provider";
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: MiddlewareCookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const requiredRole = routeRequiresRole(request.nextUrl.pathname);

  if (!requiredRole) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== requiredRole) {
    const destination =
      profile?.role === "provider" ? "/doctor/dashboard" : "/patient/dashboard";
    response = NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}
