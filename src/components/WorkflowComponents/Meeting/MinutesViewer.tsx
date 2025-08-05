import React from "react";
import { Mail, FileText } from "lucide-react";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import type { NodeData } from "../types";

interface MinutesViewerProps {
	minutesNode?: NodeData;
	distributeNode?: NodeData;
}

// Helper component for displaying email list
const EmailList: React.FC<{ emails: string[] }> = ({ emails }) => (
	<div className="space-y-4">
		<div>
			<h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
				<Mail className="h-4 w-4" />
				Email Distribution
			</h4>
			<p className="text-xs text-gray-600">Meeting minutes sent to these recipients</p>
		</div>
		<div className="space-y-1">
			{emails.map((email, index) => (
				<div 
					className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors"
					key={index}
				>
					<div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
						<span className="text-xs font-medium text-gray-600">
							{email.charAt(0).toUpperCase()}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-gray-900 truncate">{email}</p>
						<p className="text-xs text-gray-500">Recipient</p>
					</div>
					<div className="flex-shrink-0">
						<div className="w-2 h-2 rounded-full bg-green-500" title="Email sent" />
					</div>
				</div>
			))}
		</div>
	</div>
);

// Helper component for no data state
const NoDataAvailable: React.FC<{ message: string }> = ({ message }) => (
	<div className="flex items-center justify-center h-full text-gray-500">
		<div className="text-center">
			<FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
			<p>{message}</p>
		</div>
	</div>
);

export const MinutesViewer: React.FC<MinutesViewerProps> = ({
	minutesNode,
	distributeNode,
}) => {
	// Parse email list from distribute node output
	const parseEmailList = (distributeNode: NodeData): string[] => {
		let emails: string[] = [];
		
		if (Array.isArray(distributeNode.output)) {
			emails = distributeNode.output.filter((item: unknown) => 
				typeof item === "string" && item.includes("@"),
			);
		} else if (typeof distributeNode.output === "string") {
			// Try to parse if it's a JSON string
			try {
				const parsed = JSON.parse(distributeNode.output);
				if (parsed?.email_list && Array.isArray(parsed.email_list)) {
					emails = parsed.email_list.filter((item: unknown) => 
						typeof item === "string" && item.includes("@"),
					);
				}
			} catch {
				// If not JSON, split by common delimiters
				emails = distributeNode.output
					.split(/[,;\n]/)
					.map((email: string) => email.trim())
					.filter((email: string) => email.includes("@"));
			}
		} else if (distributeNode.output?.email_list && Array.isArray(distributeNode.output.email_list)) {
			// Handle case where output is an object with email_list property
			emails = distributeNode.output.email_list.filter((item: unknown) => 
				typeof item === "string" && item.includes("@"),
			);
		} else if (distributeNode.output?.emails && Array.isArray(distributeNode.output.emails)) {
			emails = distributeNode.output.emails;
		}
		
		return emails;
	};

	if (!minutesNode) {
		return <NoDataAvailable message="Meeting minutes not available" />;
	}

	const emails = distributeNode ? parseEmailList(distributeNode) : [];

	return (
		<div className="h-full flex gap-4">
			{/* Main minutes content */}
			<div className="flex-1 min-w-0">
				<ResourceTextViewer 
					resource_id={minutesNode.output?.resource_id} 
					showComments 
				/>
			</div>
			{distributeNode && (
				<div className="w-80 flex-shrink-0 border p-4 rounded-lg">
					{emails.length > 0 ? (
						<EmailList emails={emails} />
					) : (
						<div className="text-center py-8">
							<Mail className="h-8 w-8 text-gray-300 mx-auto mb-3" />
							<p className="text-sm text-gray-500">No emails sent</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default MinutesViewer;