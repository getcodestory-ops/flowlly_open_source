"use client";

import React, { useState } from "react";
import { distributeEmails } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { ToolTipedButton } from "../DocumentEditor/ToolBar";
import { AiOutlineEnter } from "react-icons/ai";

// Email validation regex
const isValidEmail = (email: string) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

enum EmailStatus {
  VALID = "valid",
  INVALID = "invalid",
  EMPTY = "empty",
  DUPLICATE = "duplicate",
}

interface EmailModalProps {
  content?: string;
  sessionToken?: Session;
  editor?: any;
  subject?: string;
}

const EmailModal: React.FC<EmailModalProps> = ({
	content,
	sessionToken,
	editor,
	subject = "Minutes of the Meeting",
}) => {
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [emails, setEmails] = useState<string[]>([]);
	const [emailInput, setEmailInput] = useState("");
	const [emailStatus, setEmailStatus] = useState<EmailStatus>(EmailStatus.EMPTY);

	const clearInput = () => {
		setEmailInput("");
		setEmailStatus(EmailStatus.EMPTY);
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const email = e.target.value;
		setEmailInput(email);
		if (email === "") {
			setEmailStatus(EmailStatus.EMPTY);
		} else if (isValidEmail(email)) {
			if (emails.includes(email)) {
				setEmailStatus(EmailStatus.DUPLICATE);
			} else {
				setEmailStatus(EmailStatus.VALID);
			}
		} else {
			setEmailStatus(EmailStatus.INVALID);
		}
	};

 
	const handleAddEmail = () => {
		if (emailStatus === EmailStatus.INVALID || emailStatus === EmailStatus.DUPLICATE || emailStatus === EmailStatus.EMPTY) {
			return;
		}
		setEmails([...emails, emailInput]);
		clearInput();
	};

	const handleRemoveEmail = (email: string) => {
		setEmails(emails.filter((e) => e !== email));
	};

	const handleDistributeEmails = () => {
		if (!sessionToken || emails.length === 0) return;
		if (content) distributeEmails(sessionToken, content, emails, subject);
		else if (editor)
			distributeEmails(sessionToken, editor.getHTML(), emails, subject);
		else {
			toast({
				title: "Error",
				description: "No content found to send",
				variant: "destructive",
			});
			return;
		}
		toast({
			title: "Email(s) sent",
			description: "The report has been sent to the email(s)",
		});
		setEmails([]);
		clearInput();
		setIsOpen(false);
	};

	return (
		<>
			<ToolTipedButton
				onClick={() => setIsOpen(true)}
				tooltip="Distribute report"
			>
				<MdOutlinePeopleAlt className="h-4 w-4" />
			</ToolTipedButton>
			<Dialog
				onOpenChange={() => {
					clearInput();
					if (isOpen) {
						setIsOpen(false);
					}
				}}
				open={isOpen}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Add Recipients</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col items-center gap-1 h-[60px]">
						<div className="flex flex-row items-center gap-2 justify-between w-full relative">
							<Input
								className={`flex-grow flex-1 ${emailStatus === EmailStatus.DUPLICATE ? "border-red-500" : ""}`}
								id="email"
								onChange={handleEmailChange}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleAddEmail();
									}
								}}
								placeholder="Enter email"
								type="email"
								value={emailInput}
							/>
							<ToolTipedButton
								className="ml-auto px-2 absolute right-2 z-10"
								disabled={emailStatus === EmailStatus.INVALID || emailStatus === EmailStatus.DUPLICATE || emailStatus === EmailStatus.EMPTY}
								onClick={handleAddEmail}
								tooltip="Add Email"
								variant="ghost"
							>
								<AiOutlineEnter className="h-6 w-6" />
							</ToolTipedButton>
						</div>
						{emailStatus === EmailStatus.INVALID && (
							<p className="text-red-500 text-xs w-full">Please enter a valid email.</p>
						)}
						{emailStatus === EmailStatus.VALID && (
							<p className="text-gray-500 text-xs ml-auto">Press enter to add email</p>
						)}
						{emailStatus === EmailStatus.DUPLICATE && (
							<p className="text-red-500 text-xs w-full">Email already exists.</p>
						)}
					</div>
					<div className="flex flex-wrap gap-2 mt-4">
						{emails.map((email) => (
							<Badge key={email} variant="secondary">
								{email}
								<Button
									className="ml-2 h-4 w-4 p-0"
									onClick={() => handleRemoveEmail(email)}
									size="sm"
									variant="ghost"
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						))}
					</div>
					<DialogFooter>
						<Button onClick={() => {setIsOpen(false); setEmailInput(""); setEmailStatus(EmailStatus.EMPTY);}} variant="outline">
              Cancel
						</Button>
						<Button
							disabled={emails.length === 0}
							onClick={handleDistributeEmails}
						>
              Send Report
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default EmailModal;
