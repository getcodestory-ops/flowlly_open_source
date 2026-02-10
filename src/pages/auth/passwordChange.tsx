import React, { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
import { AuthBackground } from "@/components/AuthBackground/AuthBackground";
import { ChangePasswordComponent } from "@/components/ChangePasswordModal/ChangePasswordModal";

function ResetPassword() {
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		async function loginCheck() {
			const { token_hash, type } = router.query;

			if (!token_hash) {
				router.replace("/login");
				return;
			}
			if (typeof token_hash === "string") {
				const rawType = typeof type === "string" ? type : "";
				const otpType = rawType === "resetPassword" ? "recovery" : rawType || "recovery";
				const { data: userSession, error } = await supabase.auth.verifyOtp({
					type: otpType as "recovery" | "email",
					token_hash,
				});

				const { session } = userSession;

				if (session) {
					const { access_token, refresh_token } = session;
					await supabase.auth.setSession({ access_token, refresh_token });
					// setSessionToken(session);
				}
				if (error) {
					toast({
						title: "Error",
						description: error.message,
						duration: 9000,
					});
					router.replace("/login");
					return;
				}
			}

			const { data } = await supabase.auth.getSession();

			if (!data?.session?.user) {
				router.replace("/login");
			}
			// else {
			// setSessionToken(data?.session);
			// }
		}
		
		// Run the check whenever router.query is ready
		if (router.isReady) {
			loginCheck();
		}
	}, [router, toast]);

	const handlePasswordChangeSuccess = () => {
		// Redirect to main page after successful password change
		router.push("/");
	};

	return (
		<AuthBackground>
			<div className="flex items-center justify-center h-screen ">
				<ChangePasswordComponent
					isOpen
					onAuthPage
					onCancel={() => {
						// router.push("/");
					}}
					onError={() => {
						router.replace("/login");
					}}
					onSuccess={handlePasswordChangeSuccess}
					toast={toast}
				/>
			</div>
		</AuthBackground>
	);
}

export default function AcceptInvite() {
	return <ResetPassword />;
}
