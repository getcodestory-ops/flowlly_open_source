import "@/styles/globals.css";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LoginLayout } from "@/components/LoginLayout/LoginLayout";

const signIn = async (formData: FormData) => {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // console.log("redirecting to /protected", email, password);

  if (error) {
    let message = "An error occured";
    if (error.name === "AuthApiError") {
      message =
        "Please verify your email before logging in. Check your spam folder if you can't find the email in main inbox.";
    }
    return redirect(`/applogin?message=${message}`);
  }

  return redirect("/protected");
};

const signUp = async (formData: FormData) => {
  "use server";

  const origin = headers().get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/login?message=Check email to continue sign in process");
};

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/protected");
  }

  return <LoginLayout signIn={signIn} />;
}
