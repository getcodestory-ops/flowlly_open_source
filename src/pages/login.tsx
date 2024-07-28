import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import supabase from "@/utils/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/router";

function Login() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [sessionToken, setSessionToken] = useState<Session | null>();
  const router = useRouter();

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        setSessionToken(data?.session);
      }
    }
    loginCheck();
  }, [router]);

  const handleLogin = async (email: string, password: string) => {
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      let message = "An error occured";
      if (error.name === "AuthApiError") {
        message =
          "Please verify your email before logging in. Check your spam folder if you can't find the email in main inbox.";
      }
      toast({
        title: error.message,
        description: message,
        duration: 5000,
      });
      return;
    }

    toast({
      title: "Login successful !",
      description: "You have been logged in successfully.",
      duration: 5000,
    });

    router.push("/");

    const { data: loginSession } = await supabase.auth.getSession();

    if (loginSession?.session?.user) {
      setSessionToken(loginSession?.session);
    }
  };

  //password reset request

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
    <>
      <Head>
        <title>Construction Documentation</title>
        <meta
          name="description"
          content="Your personal assistant for construction professionals"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Toaster />

        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] ">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Login</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your email below to login to your account
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
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
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        handleLogin(email, password);
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  onClick={() => handleLogin(email, password)}
                >
                  Login
                </Button>
                <Button variant="outline" className="w-full" disabled={true}>
                  Login with Google
                </Button>
              </div>
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
    </>
  );
}

export default Login;
