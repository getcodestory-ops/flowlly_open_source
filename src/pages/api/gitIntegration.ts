import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

interface SupabaseData {
  user_id: string | string[];
  access_token: string;
}

async function uploadDataToSupabase(supabaseData: SupabaseData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
  const { data, error } = await supabase
    .from("githubIntegration")
    .upsert(supabaseData);

  if (error) {
    console.log(error);
    return error;
  } else {
    console.log("data uploaded successfully");
    return "okay";
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("initiating request");
  if (req.method !== "POST") {
    return res.status(400).json({ message: "This mthod not supported" });
  } else {
    const token = req.headers.authorization?.split(" ")[1];
    const installation_id = req.query.installation_id;
    const user_id = req.query.user_id;

    if (!token) {
      res.status(300).json({ message: "Not a valid token" });
    }

    const response = await fetch(
      `http://3.145.17.29/generate_token?installation_id=${installation_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    if (data && user_id) {
      res.status(200).json({
        message: {
          user_id: user_id,
          access_token: data.token,
        },
      });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
};

export default handler;
