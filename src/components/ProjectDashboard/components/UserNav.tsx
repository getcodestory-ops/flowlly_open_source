"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordModal } from "@/components/ChangePasswordModal/ChangePasswordModal";
import { UserProfileModal } from "@/components/UserProfileModal/UserProfileModal";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useStore } from "@/utils/store";
import Image from "next/image";
import { getApiIntegration } from "@/api/integration_routes";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Link from "next/link";
export function UserNav({}: { email: string }): React.ReactNode {
	const { setAppView, session, activeProject } = useStore((state) => ({
		setAppView: state.setAppView,
		session: state.session,
		activeProject: state.activeProject,
	}));
	const email = session?.user?.email ?? "User";
	const [isChangePasswordOpen, setIsChangePasswordOpen] =
    useState<boolean>(false);
	const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
	const router = useRouter();

	const onLogout = async(): Promise<void> => {
		await supabase.auth.signOut();
		setAppView("login");
		router.push("/applogin");
	};
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="h-8 w-8 rounded-full" variant="default">
						<Avatar className="h-8 w-8">
							<AvatarFallback>{email && email[0].toUpperCase()}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-56"
					forceMount
				>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{email ? email.split("@")[0] : ""}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem> 
						<Link className="w-full" href={`/project/${activeProject?.project_id}/integrations`}>
							<div className="flex flex-row justify-between w-full">
								<div>Connect</div>
								<ConnectionIcons />
							</div>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
              				Change Password
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<ChangePasswordModal
				isOpen={isChangePasswordOpen}
				onCancel={() => setIsChangePasswordOpen(false)}
			/>
			<UserProfileModal
				email={email}
				isOpen={isProfileOpen}
				onCancel={() => setIsProfileOpen(false)}
			/>
		</>
	);
}

const ConnectionIcons = (): React.ReactNode => {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const { data: microsoftIntegration } = useQuery({
		queryKey: ["integration", activeProject?.project_id, "microsoft"],
		queryFn: () =>
			getApiIntegration(session!, activeProject?.project_id!, "microsoft"),
		enabled: !!session && !!activeProject?.project_id,
	});

	const { data: procoreIntegration } = useQuery({
		queryKey: ["integration", activeProject?.project_id, "procore"],
		queryFn: () =>
			getApiIntegration(session!, activeProject?.project_id!, "procore"),
		enabled: !!session && !!activeProject?.project_id,
	});
	return (
		<div className="flex flex-row gap-2">
			<IntegrationActiveState
				imageAlt="microsoft"
				imageSrc="/logos/microsoft.png"
				isConnected={!!microsoftIntegration}
			/>
			<IntegrationActiveState
				imageAlt="procore"
				imageSrc="/logos/procore.png"
				isConnected={!!procoreIntegration}
			/>
		</div>
	);
};


const IntegrationActiveState = ({
	imageAlt,
	imageSrc,
	isConnected,
}: {
	imageAlt: string;
	imageSrc: string;
	isConnected: boolean;
}): React.ReactNode => {
	return (
		<div className="relative">
			<Image
				alt={imageAlt}
				className={`${isConnected ? "grayscale-0" : "grayscale"}`}
				height={16}
				src={imageSrc}
				width={16}
			/>
			<span className={cn(isConnected ? "bg-green-500" : "bg-gray-500", "absolute h-2 w-2 -top-1 -right-1 rounded-full border border-white")} />
	
		</div>
	);
};