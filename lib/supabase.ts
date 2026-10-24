// Connection to Supabase, which holds each user's account and synced data.
// Both values are public by design: row-level security (supabase/setup.sql) decides what each user can read.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_HJLSUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_HJLSUPABASE_PUBLISHABLE_KEY;

/** null when the settings are missing (see .env.example). */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
