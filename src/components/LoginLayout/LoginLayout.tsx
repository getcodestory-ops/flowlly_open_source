"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/utils/supabase/client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

import { AuthBackground } from "@/components/AuthBackground/AuthBackground";

export const LoginLayout = ({
	signIn,
}: {
  signIn: (formData: FormData) => Promise<void>;
}) => {
	const { toast } = useToast();

	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [view, setView] = useState<"login" | "forgotPassword" | "resetSent">("login");
	const [resetEmail, setResetEmail] = useState("");
	const [isResetting, setIsResetting] = useState(false);

	const onErrorCallback = (error: Error) => {
		if (error.message?.includes("NEXT_REDIRECT")) {
			toast({
				title: "Login successful",
				description: "You have been logged in successfully",
				duration: 5000,
			});
			return;
		}
		
		setIsLoading(false);
		toast({
			title: "Login Unsuccessful",
			description: error.message || "An error occurred while logging in, please try again",
			duration: 5000,
		});
	};
	const onSuccessCallback = () => {
		setIsLoading(false);
		toast({
			title: "Login successful",
			description: "You have been logged in successfully",
			duration: 5000,
		});
	};

	const handlePasswordReset = async () => {
		const emailToReset = resetEmail.trim();
		if (!emailToReset) {
			toast({
				title: "Email required",
				description: "Please enter your email address",
				duration: 5000,
			});
			return;
		}
		setIsResetting(true);
		const redirectTo = `${window.location.origin}/auth/passwordChange`;
		const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
			redirectTo,
		});
		setIsResetting(false);

		if (error) {
			toast({
				title: "Password reset failed",
				description: error.message,
				duration: 5000,
			});
			return;
		}

		setView("resetSent");
	};

	return (
		<AuthBackground>
			<div className="flex items-center justify-center h-screen ">
				<Card className="mx-auto max-w-sm ">
					{view === "login" && (
						<>
							<CardHeader>
								<CardTitle className="text-3xl text-center">Login</CardTitle>
								<CardDescription>
									Enter your email below to login to your account
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form>
									<div className="grid gap-4">
										<div className="grid gap-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												name="email"
												disabled={isLoading}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="you@example.com"
												required
												type="email"
											/>
										</div>
										<div className="grid gap-2">
											<div className="flex items-center">
												<Label htmlFor="password">Password</Label>
												<button
													type="button"
													className="ml-auto inline-block text-sm underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
													disabled={isLoading}
													onClick={() => {
														setResetEmail(email);
														setView("forgotPassword");
													}}
												>
													Forgot your password?
												</button>
											</div>
											<Input
												id="password"
												name="password"
												disabled={isLoading}
												placeholder="••••••••"
												required
												type="password"
											/>
										</div>
										<Button
											className="w-full"
											disabled={isLoading}
											formAction={(formData) => {
												setIsLoading(true);
												signIn(formData)
													.then(onSuccessCallback)
													.catch(onErrorCallback);
											}}
											type="submit"
										>
											{isLoading ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Logging in...
												</>
											) : (
												"Login"
											)}
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
								</form>
							</CardContent>
						</>
					)}

					{view === "forgotPassword" && (
						<>
							<CardHeader>
								<CardTitle className="text-2xl text-center">Reset password</CardTitle>
								<CardDescription>
									Enter your email and we&apos;ll send you a link to reset your password
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4">
									<div className="grid gap-2">
										<Label htmlFor="reset-email">Email</Label>
										<Input
											autoFocus
											id="reset-email"
											type="email"
											placeholder="you@example.com"
											value={resetEmail}
											disabled={isResetting}
											onChange={(e) => setResetEmail(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													handlePasswordReset();
												}
											}}
										/>
									</div>
									<Button
										className="w-full"
										type="button"
										disabled={isResetting || !resetEmail.trim()}
										onClick={handlePasswordReset}
									>
										{isResetting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Sending...
											</>
										) : (
											"Send reset link"
										)}
									</Button>
								</div>
								<div className="mt-4 text-center text-sm">
									<button
										type="button"
										className="inline-flex items-center gap-1 underline cursor-pointer"
										onClick={() => setView("login")}
									>
										<ArrowLeft className="h-3 w-3" />
										Back to login
									</button>
								</div>
							</CardContent>
						</>
					)}

					{view === "resetSent" && (
						<>
							<CardHeader>
								<CardTitle className="text-2xl text-center">Check your email</CardTitle>
								<CardDescription className="text-center">
									We sent a password reset link to{" "}
									<span className="font-medium text-foreground">{resetEmail}</span>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4">
									<p className="text-sm text-muted-foreground text-center">
										Didn&apos;t receive the email? Check your spam folder or try again.
									</p>
									<Button
										className="w-full"
										variant="outline"
										type="button"
										onClick={() => setView("forgotPassword")}
									>
										Try again
									</Button>
								</div>
								<div className="mt-4 text-center text-sm">
									<button
										type="button"
										className="inline-flex items-center gap-1 underline cursor-pointer"
										onClick={() => setView("login")}
									>
										<ArrowLeft className="h-3 w-3" />
										Back to login
									</button>
								</div>
							</CardContent>
						</>
					)}
				</Card>
			</div>
		</AuthBackground>
	);
};
