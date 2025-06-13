import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2, FileSpreadsheet, FileText, FileCode, Search } from "lucide-react";
import Image from "next/image";
import AtSelectorComponent from "../../../components/AtSelectorComponent";
import { useChatStore } from "@/hooks/useChatStore";
import BidLevelling from "./FormDirectives/BidLevelling";
import DailyReport from "./FormDirectives/DailyReport";
import ReportWriting from "./FormDirectives/ReportWriting";
import KnowledgeManager from "./FormDirectives/KnowledgeManager";
interface EmptyChatInterfaceProps {
	chatInput: string;
	setChatInput: (value: string) => void;
	isPending: boolean;
	isWaitingForResponse: boolean;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

export default function EmptyChatInterface({
	chatInput,
	setChatInput,
	isPending,
	isWaitingForResponse,
	handleSubmit,
	loadDocumentPanel,
}: EmptyChatInterfaceProps) {
	const { chatDirectiveType, setChatDirectiveType } = useChatStore();

	const chatTypes: Array<{
		id: "chat" | "bidLevelling" | "dailyReport" | "reportWriting" | "knowledgeManager" | "none";
		title: string;
		description: string;
		icon: any;
		color: string;
		iconColor: string;
	}> = [
		{
			id: "bidLevelling",
			title: "Bid Levelling Chat",
			description: "Analyze and compare bids, pricing strategies, and project costs",
			icon: FileSpreadsheet,
			color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
			iconColor: "text-emerald-600",
		},
		{
			id: "dailyReport",
			title: "Daily Report Generator",
			description: "Generate comprehensive daily reports with weather, images, and progress analysis",
			icon: FileText,
			color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
			iconColor: "text-blue-600",
		},
		{
			id: "reportWriting",
			title: "Report Writing Assistant",
			description: "Create professional reports using templates, reference documents, and data sources",
			icon: FileCode,
			color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
			iconColor: "text-purple-600",
		},
		{
			id: "knowledgeManager",
			title: "Knowledge Search & Discovery",
			description: "Search and find specific information across your project documents and folders",
			icon: Search,
			color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
			iconColor: "text-orange-600",
		},
	];

	// If bid levelling is selected, show only the form
	if (chatDirectiveType === "bidLevelling") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<BidLevelling
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If daily report is selected, show only the form
	if (chatDirectiveType === "dailyReport") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<DailyReport
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If report writing is selected, show only the form
	if (chatDirectiveType === "reportWriting") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<ReportWriting
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// If knowledge manager is selected, show only the form
	if (chatDirectiveType === "knowledgeManager") {
		return (
			<div className="flex flex-col items-center px-4 py-6">
				<KnowledgeManager
					handleSubmit={handleSubmit}
					isPending={isPending}
					isWaitingForResponse={isWaitingForResponse}
					loadDocumentPanel={loadDocumentPanel}
					setChatInput={setChatInput}
				/>
			</div>
		);
	}

	// Otherwise, show the full chat interface
	return (
		<div className="flex flex-col items-center px-4 py-6">
			<div className="max-w-2xl w-full bg-white rounded-xl p-6 mb-6 shadow-sm">
				<div className="text-center mb-8">
					<Image 
						alt="Flowlly AI" 
						className="mx-auto mb-3" 
						height={96} 
						src="/logos/FlowllyGuy.png" 
						width={96}
					/>
					<h3 className="text-lg font-medium text-indigo-900 mb-2">
						Chat with Flowlly
					</h3>
					<p className="text-slate-500 text-sm mb-6">
						🚀 Hey there! I&apos;m your AI assistant, ready to help with your 
						project tasks, docs, and workflows. Choose your chat type below! ✨
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					{chatTypes.map((type) => {
						const IconComponent = type.icon;
						const isSelected = chatDirectiveType === type.id;
						
						return <div
							className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${isSelected 
								? `${type.color} border-current` 
								: "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
							}`}
							key={type.id}
							onClick={() => setChatDirectiveType(type.id)}
						       >
							<div className="flex items-start space-x-3">
								<div className={`p-2 rounded-lg ${isSelected ? type.color : "bg-white"}`}>
									<IconComponent 
										className={`h-5 w-5 ${isSelected ? type.iconColor : "text-gray-600"}`} 
									/>
								</div>
								<div className="flex-1">
									<h4 className={`font-medium text-sm mb-1 ${isSelected ? type.iconColor : "text-gray-900"}`}>
										{type.title}
									</h4>
									<p className="text-xs text-gray-600 leading-relaxed">
										{type.description}
									</p>
								</div>
							</div>
						</div>;
					})}
				</div>
			</div>
			<div className="w-full relative overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm focus-within:ring-1 focus-within:ring-indigo-300 transition-shadow">
				<Label className="sr-only" htmlFor="empty-message">
					Message
				</Label>
				<div className="absolute top-0 left-2 z-10 pt-2">
					<AtSelectorComponent />
				</div>
				<Textarea
					className="min-h-20 resize-none border-0 p-4 pl-12 mt-4 shadow-none focus-visible:ring-0 text-slate-800"
					disabled={isPending}
					id="empty-message"
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit();
						}
					}}
					placeholder="Type your message here..."
					value={chatInput}
				/>
				<div className="flex items-center p-3 pt-0">
					{loadDocumentPanel()}
					<Button
						className="ml-auto gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
						disabled={
							isWaitingForResponse ||
							(!chatInput.trim())
						}
						onClick={handleSubmit}
						size="sm"
						type="submit"
					>
						{isWaitingForResponse ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							</>
						) : (
							<>
								Send
								<CornerDownLeft className="h-3.5 w-3.5" />
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
