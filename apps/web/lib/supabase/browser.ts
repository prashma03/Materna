"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
