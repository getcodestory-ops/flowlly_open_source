import { useState } from "react";
import { Modal } from "react-bootstrap";

import { useToast } from "@chakra-ui/react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/utils/store";
import { MemberEntity } from "@/types/members";
import { updateMemberEntity } from "@/api/membersRoutes";

interface UserProfileModalProps {
  onCancel: () => void;
  isOpen: boolean;
  email: string;
}

export function UserProfileModal({
	onCancel,
	isOpen,
	email,
}: UserProfileModalProps) {
	const toast = useToast();
	const members = useStore((state) => state.members);
	const userMember = members.find((member) => member.email === email);
	return (
		<Modal
			backdrop
			centered
			onHide={onCancel}
			show={isOpen}
		>
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<UserProfileComponent
					isOpen={isOpen}
					onCancel={onCancel}
					toast={toast}
					userMember={userMember}
				/>
			</div>
		</Modal>
	);
}
interface UserProfileComponentProps {
  onCancel: () => void;
  userMember: MemberEntity | undefined;
  isOpen: boolean;

  onError?: () => void;
  onSuccess?: () => void;
}
export const UserProfileComponent = ({
	onCancel,
	toast,
	isOpen,
	userMember,
}: UserProfileComponentProps & { toast: ReturnType<typeof useToast> }) => {
	const [isUpdated, setIsUpdated] = useState(false);

	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const projectId = activeProject?.project_id;

	const handleProfileUpdate = async(
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		if (!isUpdated) return;
		if (!isOpen) return;

		//pick all values from form
		const formData = new FormData(event.currentTarget);
		const firstName = formData.get("firstName") as string;
		const lastName = formData.get("lastName") as string;
		const phone = formData.get("phone") as string;
		//console.log({ firstName, lastName, phone });

		if (!userMember) {
			toast({
				title: "User not found",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}
		if (
			firstName === userMember.first_name &&
      lastName === userMember.last_name &&
      phone === userMember.phone
		) {
			toast({
				title: "No changes detected",
				status: "info",
				duration: 5000,
				isClosable: true,
			});
			return;
		}
		if (!session || !projectId) {
			toast({
				title: "Session or project id not found",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		try {
			await updateMemberEntity(session, projectId, {
				first_name: firstName,
				last_name: lastName,
				phone: phone,
				id: userMember.id,
				email: userMember.email,
			});

			//sucess
			toast({
				title: "Profile updated successfully",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
		} catch (error: any) {
			toast({
				title: "Error updating profile",
				description: error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}
	};

	if (!userMember) return <div>User could not be found</div>;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl text-center">User Profile</CardTitle>
			</CardHeader>
			<form autoComplete="off" onSubmit={handleProfileUpdate}>
				<CardContent>
					<div className="grid  items-center gap-6">
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="area">First Name</Label>
								<Input
									className="w-[150px]"
									defaultValue={userMember.first_name}
									id="firstName"
									name="firstName"
									onChange={(e) => {
										e.preventDefault();
										setIsUpdated(true);
									}}
									placeholder="Your first name"
									type="text"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="security-level">Last Name</Label>
								<Input
									className="w-[150px]"
									defaultValue={userMember.last_name}
									id="lastName"
									name="lastName"
									onChange={(e) => {
										e.preventDefault();
										setIsUpdated(true);
									}}
									placeholder="Your last name"
									type="text"
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="text"
								value={userMember.email}
								placeholder="Your phone number"
								//cannot be edited by user
								readOnly
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								defaultValue={userMember.phone}
								id="phone"
								name="phone"
								onChange={(e) => {
									e.preventDefault();
									setIsUpdated(true);
								}}
								placeholder="Your phone number"
								type="text"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="role">Role</Label>
								<Select defaultValue="member">
									<SelectTrigger id="role">
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem disabled value="admin">
                      Admin
										</SelectItem>
										<SelectItem value="member">Member</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="language-selection">Language</Label>
								<Select
									defaultValue="english"
									onValueChange={(value) => {
										setIsUpdated(true);
									}}
								>
									<SelectTrigger id="language">
										<SelectValue placeholder="Select level" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="english">English</SelectItem>
										<SelectItem disabled value="french">
                      French
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button onClick={onCancel} variant="outline">
            Cancel
					</Button>
					<Button
						disabled={!isUpdated}
						type="submit"
						variant={`${isUpdated ? "default" : "link"}`}
					>
            Update
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
};
