import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { getAgentChatHistoryItem } from "@/api/agentRoutes";
import { Antartifact } from "@/types/agentChats";
import ArtifactViewer from "@/components/AiActions/ArtifactViewer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

const queryClient = new QueryClient();

function Viewer() {
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [sessionToken, setSessionToken] = useState<Session | null>();
	const [chatData, setChatData] = useState<Antartifact | null>();
	const { toast } = useToast();
	const router = useRouter();

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
		const { data: loginSession } = await supabase.auth.getSession();

		if (loginSession?.session?.user) {
			setSessionToken(loginSession?.session);
		}
	};

	useEffect(() => {
		async function loginCheck() {
			const { data } = await supabase.auth.getSession();

			if (data?.session?.user) {
				setSessionToken(data?.session);
			}
		}
		loginCheck();
	}, [router]);

	useEffect(() => {
		async function retrieveChat(chatHistoryId: string) {
			if (!sessionToken) {
				return;
			}
			const chatData = await getAgentChatHistoryItem(
				sessionToken,
				chatHistoryId,
			);
			if (chatData && chatData.message && chatData.message.antartifact) {
				setChatData(chatData.message.antartifact);
				if (!chatData.message.antartifact.result) {
					let retries = 0;
					const maxRetries = 6;
					const retryInterval = 20000;

					const retry = setInterval(async() => {
						retries++;
						const updatedChatData = await getAgentChatHistoryItem(
							sessionToken,
							chatHistoryId,
						);
						if (
							updatedChatData &&
              updatedChatData.message &&
              updatedChatData.message.antartifact
						) {
							setChatData(updatedChatData.message.antartifact);
							if (
								updatedChatData.message.antartifact.result ||
                retries >= maxRetries
							) {
								clearInterval(retry);
							}
						} else if (retries >= maxRetries) {
							clearInterval(retry);
						}
					}, retryInterval);
				}
			}
		}
		const { chatHistoryId } = router.query;

		if (typeof chatHistoryId === "string") {
			retrieveChat(chatHistoryId);
		}
	}, [router, sessionToken]);

	const { projectId, childTaskId } = router.query;

	return (
		<QueryClientProvider client={queryClient}>
			<div className="flex h-screen justify-center items-center w-screen bg-background">
				{sessionToken && (
					<div className="w-full">
						<div className="p-2 w-full h-screen flex items-center flex-col">
							<div className="p-6 rounded-lg w-full text-foreground overflow-auto ">
								{typeof projectId === "string" &&
                  typeof childTaskId === "string" && (
									<ArtifactViewer
										childTaskId={childTaskId}
										projectId={projectId}
										sessionToken={sessionToken}
									/>
								)}
							</div>
						</div>
					</div>
				)}
				{!sessionToken && (
					<div className="w-full">
						<div className="p-2 w-full h-screen bg-background flex items-center flex-col">
							<div className="p-6 rounded-lg w-full">
								<h1 className="text-3xl mb-4 text-center font-bold tracking-tight text-primary flex items-center flex-col">
									<Image
										alt="logo"
										className="mb-4"
										height={60}
										src="https://qfktimnmlcnfowxuoune.supabase.co/storage/v1/object/public/logos/logo_full.svg"
										width={240}
									/>
                  AI Project Management Assistant
								</h1>
							</div>
							<div className="p-8 bg-card rounded-md w-80 m-8 text-card-foreground">
								<div className="mb-4">
									<Label htmlFor="email">Email address</Label>
									<Input
										id="email"
										onChange={(e) => setEmail(e.target.value)}
										type="email"
										value={email}
									/>
								</div>
								<div className="mb-4">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										onChange={(e) => setPassword(e.target.value)}
										onKeyUp={(e) => {
											if (e.key === "Enter") {
												handleLogin(email, password);
											}
										}}
										type="password"
										value={password}
									/>
									<Button
										className="mt-4"
										onClick={() => handleLogin(email, password)}
										variant="secondary"
									>
                    Login with Email
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</QueryClientProvider>
	);
}

export default Viewer;
