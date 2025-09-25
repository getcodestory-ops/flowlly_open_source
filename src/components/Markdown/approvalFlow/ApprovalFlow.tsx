import React, { useState } from "react";
import { Check, X, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformChat } from "@/components/ChatInput/PlatformChat/usePlatformChat";
import { useStore } from "@/utils/store";
import { FunctionApproval, ApprovalFlowProps, ApprovalData, ApprovalStatus } from "@/types/agentChats";


const ApprovalFlow: React.FC<ApprovalFlowProps> = ({ data }) => {
	const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
	const [isLoading, setIsLoading] = useState(false);
	
	// Get required hooks for API calls
	const activeProject = useStore((state) => state.activeProject);
	const { handleChatSubmit, isWaitingForResponse } = usePlatformChat(
		activeProject?.project_id || "", 
		"agent", 
		false,
	);

	// Parse the approval data
	let approvalData: ApprovalData;
	try {
		approvalData = JSON.parse(data);
	} catch (error) {
		console.error("Error parsing approval data:", error);
		return (
			<div className="bg-white border border-red-200 rounded-lg p-4 my-3 shadow-sm">
				<div className="flex items-center gap-2 text-red-700 font-medium mb-2">
					<XCircle className="w-4 h-4" />
					Error parsing approval data
				</div>
				<div className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded border border-red-200 font-mono">
					{data}
				</div>
			</div>
		);
	}

	const handleApproval = async(approved: boolean): Promise<void> => {
		setIsLoading(true);
		
		try {
			// Create FunctionApproval object matching backend model
			const functionApproval: FunctionApproval = {
				approved: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
				fn_call_id: approvalData.fn_call_id,
				comments: approved ? "approved" : "rejected", // Default comments based on action
			};
			
			// Use handleChatSubmit with FunctionApproval object - now supports JSON objects
			await handleChatSubmit({
				message: functionApproval, // Send the object directly
				files: [],
			});
			
			setStatus(approved ? "approved" : "rejected");
		} catch (error) {
			console.error("Error making approval API call:", error);
			// Reset status on error
			setStatus("pending");
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusIcon = (): React.ReactNode => {
		switch (status) {
			case "approved":
				return <CheckCircle className="w-4 h-4 text-green-600" />;
			case "rejected":
				return <XCircle className="w-4 h-4 text-red-600" />;
			default:
				return <Clock className="w-4 h-4 text-gray-600" />;
		}
	};


	const getStatusColor = (): string => {
		switch (status) {
			case "approved":
				return "bg-white border-green-200 shadow-sm";
			case "rejected":
				return "bg-white border-red-200 shadow-sm";
			default:
				return "bg-white border-gray-200 shadow-sm";
		}
	};

	return (
		<div className={`rounded-lg border p-4 my-3 transition-all duration-200 ${getStatusColor()}`}>
			<div className="flex items-start">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						{getStatusIcon()}
						<p className="text-sm text-gray-600 mb-3">{approvalData.message}</p>
					</div>
					{status === "pending" && (
						<div className="flex gap-2 ml-4">
							<Button
								className="bg-green-600 hover:bg-green-700 text-white"
								disabled={isLoading || isWaitingForResponse}
								onClick={() => handleApproval(true)}
								size="sm"
							>
								{(isLoading || isWaitingForResponse) ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3" />}
								Approve
							</Button>
							<Button
								disabled={isLoading || isWaitingForResponse}
								onClick={() => handleApproval(false)}
								size="sm"
								variant="destructive"
							>
								{(isLoading || isWaitingForResponse) ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <X className="w-3 h-3" />}
								Reject
							</Button>
						</div>
					)}
					{status !== "pending" && (
						<div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
							<Clock className="w-3 h-3" />
							Action completed at {new Date().toLocaleTimeString()}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ApprovalFlow;