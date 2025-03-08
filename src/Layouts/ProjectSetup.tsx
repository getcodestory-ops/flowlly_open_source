"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useStore } from "@/utils/store";
import { MemberEntity } from "@/types/members";
import { Edit, Save, Trash2, X } from "lucide-react";
import { usePhoneRegistration } from "@/components/PhoneRegistration/usePhoneRegistration";
import ConsentModal from "@/components/PhoneRegistration/ConsentModal";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function ProjectSetup() {
	const { activeProject } = useStore((state) => ({
		activeProject: state.activeProject,
	}));

	const {
		registerPhoneNumber,
		deleteMember,
		members,
		handleSaveMember,
		handleInputChange,
		handleMemberEdit,
		addingMember,
		setAddingMember,
		editMember,
		newMember,
		setEditMember,
		updatememberDetails,
	} = usePhoneRegistration();

	const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

	const handleAddMemberClick = () => setAddingMember(!addingMember);

	const renderProjectMembers = () => (
		<div className="flex flex-col pt-4 overflow-auto">
			<ConsentModal
				isOpen={isConsentModalOpen}
				onClose={() => setIsConsentModalOpen(false)}
				onOpen={() => setIsConsentModalOpen(true)}
			/>
			<Button
				className="self-start mb-4"
				onClick={handleAddMemberClick}
				size="sm"
				variant="outline"
			>
        Add Member
			</Button>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>First Name</TableHead>
						<TableHead>Last Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Phone Number</TableHead>
						<TableHead>Enroll IN SMS</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Language</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{addingMember && (
						<TableRow>
							<TableCell>
								<Input
									onChange={(e) => handleInputChange(e, "first_name")}
									placeholder="First Name"
									type="text"
									value={newMember.first_name}
								/>
							</TableCell>
							<TableCell>
								<Input
									onChange={(e) => handleInputChange(e, "last_name")}
									placeholder="Last Name"
									type="text"
									value={newMember.last_name}
								/>
							</TableCell>
							<TableCell>
								<Input
									onChange={(e) => handleInputChange(e, "email")}
									placeholder="Email"
									type="email"
									value={newMember.email}
								/>
							</TableCell>
							<TableCell>
								<PhoneInput
									defaultCountry="US"
									international
									onChange={(value) => handleInputChange(value, "phone")}
									value={newMember.phone}
								/>
							</TableCell>
							<TableCell>
								<Checkbox
									checked={newMember.enable_sms}
									onCheckedChange={(checked) => {
										handleInputChange({ target: { checked } }, "enable_sms");
										if (checked) setIsConsentModalOpen(true);
									}}
								/>
							</TableCell>
							<TableCell>
								<Input
									onChange={(e) => handleInputChange(e, "role")}
									placeholder="Role"
									type="text"
									value={newMember.role}
								/>
							</TableCell>
							<TableCell>
								<Input
									onChange={(e) => handleInputChange(e, "language")}
									placeholder="Language"
									type="text"
									value={newMember.language}
								/>
							</TableCell>
							<TableCell>
								<Button
									onClick={handleSaveMember}
									size="icon"
									variant="ghost"
								>
									<Save className="h-4 w-4" />
								</Button>
								<Button
									onClick={handleAddMemberClick}
									size="icon"
									variant="ghost"
								>
									<X className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					)}
					{members?.data?.map((member: MemberEntity) => (
						<TableRow key={member.id}>
							{editMember?.id !== member.id ? (
								<>
									<TableCell>{member.first_name}</TableCell>
									<TableCell>{member.last_name}</TableCell>
									<TableCell>{member.email}</TableCell>
									<TableCell>{member.phone}</TableCell>
									<TableCell>
										{!member.phone ? (
											<span className="font-bold">
                        Add phone number to enroll
											</span>
										) : (
											<Checkbox
												checked={
													!!member?.phone_registration?.[0]?.phone_number
												}
												onCheckedChange={(checked) =>
													registerPhoneNumber(!!checked, member.phone)
												}
											/>
										)}
									</TableCell>
									<TableCell>{member.role}</TableCell>
									<TableCell>{member?.language ?? "English"}</TableCell>
									<TableCell>
										<Button
											onClick={() => {
												const { phone_registration, ...otherProps } = member;
												setEditMember({ ...otherProps });
											}}
											size="icon"
											variant="ghost"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											onClick={() => deleteMember(member.email)}
											size="icon"
											variant="ghost"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</>
							) : (
								<>
									<TableCell>
										<Input
											onChange={(e) => handleMemberEdit(e, "first_name")}
											placeholder="First Name"
											type="text"
											value={editMember.first_name}
										/>
									</TableCell>
									<TableCell>
										<Input
											onChange={(e) => handleMemberEdit(e, "last_name")}
											placeholder="Last Name"
											type="text"
											value={editMember.last_name}
										/>
									</TableCell>
									<TableCell>
										<Input
											onChange={(e) => handleMemberEdit(e, "email")}
											placeholder="Email"
											type="email"
											value={editMember.email}
										/>
									</TableCell>
									<TableCell>
										<PhoneInput
											defaultCountry="US"
											international
											onChange={(value) => {
												handleMemberEdit(value, "phone");
											}}
											value={editMember.phone ?? ""}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={editMember.enable_sms}
											onCheckedChange={(checked) => {
												handleMemberEdit({ target: { checked } }, "enable_sms");
												if (checked) setIsConsentModalOpen(true);
											}}
										/>
									</TableCell>
									<TableCell>
										<Input
											onChange={(e) => handleMemberEdit(e, "role")}
											placeholder="Role"
											type="text"
											value={editMember.role}
										/>
									</TableCell>
									<TableCell>
										<Input
											onChange={(e) => handleMemberEdit(e, "language")}
											placeholder="Language"
											type="text"
											value={editMember.language}
										/>
									</TableCell>
									<TableCell>
										<Button
											onClick={updatememberDetails}
											size="icon"
											variant="ghost"
										>
											<Save className="h-4 w-4" />
										</Button>
										<Button
											onClick={() => {
												setAddingMember(false);
												setEditMember(null);
											}}
											size="icon"
											variant="ghost"
										>
											<X className="h-4 w-4" />
										</Button>
									</TableCell>
								</>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);

	if (!activeProject) {
		return (
			<div className="flex items-center justify-center h-full text-3xl font-black text-primary">
        Select or create a project at the top left corner
			</div>
		);
	}

	return (
		<div className="w-full h-full bg-background rounded-xl p-4">
			{renderProjectMembers()}
		</div>
	);
}
