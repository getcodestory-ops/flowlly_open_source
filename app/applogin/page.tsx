import "@/styles/globals.css";
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

  if (error) {
    let message = "An error occured";
    if (error.name === "AuthApiError") {
      message =
        "Please verify your email before logging in. Check your spam folder if you can't find the email in main inbox.";
    }
    throw new Error(message);
  }
  return redirect("/protected");
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
