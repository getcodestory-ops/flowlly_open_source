"use client";
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
import { useRouter } from "next/navigation";

import { useStore } from "@/utils/store";
function Login() {
	const { toast } = useToast();
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const router = useRouter();

	const setAppView = useStore((state) => state.setAppView);

	const handleLogin = async(email: string, password: string) => {
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
		window.location.reload();
	};

	//password reset request

	const handlePasswordReset = async(email: string) => {
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

	useEffect(() => {
		async function loginCheck() {
			const { data } = await supabase.auth.getSession();

			if (data?.session?.user) {
				router.replace("/");
				setAppView("updates");
			} else {
				setAppView("login");
				//console.log("Sign in to continue !");
			}
		}
		loginCheck();
	}, [router]);

	return (
		<>
			<main className="h-full bg-white w-full">
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
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										onChange={(e) => setEmail(e.target.value)}
										placeholder="m@example.com"
										required
										type="email"
									/>
								</div>
								<div className="grid gap-2">
									<div className="flex items-center">
										<Label htmlFor="password">Password</Label>
										<div
											className="ml-auto inline-block text-sm underline cursor-pointer"
											onClick={() => handlePasswordReset(email)}
										>
                      Forgot your password?
										</div>
									</div>
									<Input
										id="password"
										onChange={(e) => setPassword(e.target.value)}
										onKeyUp={(e) => {
											if (e.key === "Enter") {
												handleLogin(email, password);
											}
										}}
										required
										type="password"
									/>
								</div>
								<Button
									className="w-full"
									onClick={() => handleLogin(email, password)}
									type="submit"
								>
                  Login
								</Button>
								<Button
									className="w-full"
									disabled
									variant="outline"
								>
                  Login with Google
								</Button>
							</div>
							<div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
								<Link className="underline" href="signup">
                  Sign up
								</Link>
							</div>
						</div>
					</div>
					<div className="hidden bg-white lg:block  flex content-center xl:mt-32">
						<Image
							alt="Logo"
							className="mx-auto"
							height="400"
							src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/hero-v2.c5845c47e7c7d49cf5c1.png"
							width="800"
						/>
					</div>
				</div>
			</main>
		</>
	);
}

export default Login;
