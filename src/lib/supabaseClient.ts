import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://bfaqwqkhrwncdmahltwh.supabase.co";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_UdvTZub9wiaa43AkbhF5Yg_pOTVU205";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);