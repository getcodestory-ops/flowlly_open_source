// import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
// );
// const supabase = createClient();
export default supabase;
