import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

import { AuthBackground } from "@/components/AuthBackground/AuthBackground";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
// );

export default function Signup() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { toast } = useToast();

	const handleSignup = async() => {
		try {
			const { data, error } = await supabase.auth.signUp({ email, password });
			if (error) {
				throw error;
			}
			toast({
				title: "Signup successful",
				description: "You have been signed up successfully.",
			});
			router.push("/meetings");
		} catch (error) {
			toast({
				title: " Signup failed",
				description: "Something went wrong. Please try again.",
			});
		}
	};

	return (
		<AuthBackground>
			<div className="flex items-center justify-center h-screen ">
				<Card className="mx-auto max-w-sm ">
					<CardHeader>
						<CardTitle className="text-3xl text-center">Sign Up</CardTitle>
						<CardDescription>
              Enter your information to create an account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="first-name">First name</Label>
									<Input
										id="first-name"
										placeholder="Max"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="last-name">Last name</Label>
									<Input
										id="last-name"
										placeholder="Robinson"
										required
									/>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									required
									type="email"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									type="password"
								/>
							</div>
							<Button
								className="w-full"
								onClick={handleSignup}
								type="submit"
							>
                Create an account
							</Button>
							<Button
								className="w-full"
								disabled
								variant="outline"
							>
                Sign up with Google
							</Button>
						</div>
						<div className="mt-4 text-center text-sm">
              Already have an account?{" "}
							<Link className="underline" href="login">
                Sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthBackground>
	);
}
