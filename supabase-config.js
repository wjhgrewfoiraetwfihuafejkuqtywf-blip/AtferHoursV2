const SUPABASE_URL = "https://euhpjiahxdhkzkqtlupt.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_CXCtsedkyG2se-BTo11-mQ_1z6BDf5n";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
