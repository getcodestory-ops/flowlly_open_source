"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";

import Link from "next/link";
import Image from "next/image";

import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// const signUp = async (formData: FormData) => {
//   "use server";

//   const origin = headers().get("origin");
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const supabase = createServerCLient();

//   const { error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       emailRedirectTo: `${origin}/auth/callback`,
//     },
//   });

//   if (error) {
//     return redirect("/login?message=Could not authenticate user");
//   }

//   return redirect("/login?message=Check email to continue sign in process");
// };

export const LoginLayout = ({
  signIn,
}: {
  signIn: (formData: FormData) => Promise<void>;
}) => {
  const supabase = createClient();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const handlePasswordReset = async (email: string) => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to reset your password",
        duration: 5000,
      });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast({
        title: "Password reset failed",
        description: error.message,
        duration: 5000,
      });
      return;
    }

    toast({
      title: "Password reset email sent",
      description: "Please check your email for the password reset link",
      duration: 5000,
    });
  };
  return (
    <main>
      <Toaster />

      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Login</h1>
              <p className="text-balance text-muted-foreground">
                Enter your email below to login to your account
              </p>
            </div>
            <form>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <div
                      onClick={() => handlePasswordReset(email)}
                      className="ml-auto inline-block text-sm underline cursor-pointer"
                    >
                      Forgot your password?
                    </div>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    // onChange={(e) => setPassword(e.target.value)}
                    // onKeyUp={(e) => {
                    //   if (e.key === "Enter") {
                    //     handleLogin(email, password);
                    //   }
                    // }}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  //   onClick={() => handleLogin(email, password)}
                  formAction={signIn}
                >
                  Login
                </Button>
                <Button variant="outline" className="w-full" disabled={true}>
                  Login with Google
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="signup" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden bg-white lg:block  flex content-center xl:mt-32">
          <Image
            src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/hero-v2.c5845c47e7c7d49cf5c1.png"
            alt="Logo"
            width="800"
            height="400"
            className="mx-auto"
          />
        </div>
      </div>
    </main>
  );
};
