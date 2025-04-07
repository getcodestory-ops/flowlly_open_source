import { WorkflowNode } from "@/types/projectEvents";
import RunningLogNode from "./RunningLogNode";
import { OutlookAttachmentsNode } from "./OutlookAttachmentsNode";
import { NodeType } from "../../types";
import { ProcoreNodeConfig } from "../../types";

interface NodeConfig {
  value: string;
  label: string;
  icon: string;
  getDescription: (node: WorkflowNode) => string;
}

export const nodeConfigs: Record<string, NodeConfig> = {
	// validate: {
	// 	value: "validate",
	// 	label: "Validate Information",
	// 	icon: "✓",
	// 	getDescription: (node) =>
	// 		(node.config as any).validationPrompt?.slice(0, 50) + "...",
	// },
	// conversation: {
	// 	value: "conversation",
	// 	label: "Conversation",
	// 	icon: "💬",
	// 	getDescription: (node) => (node.config as any).prompt?.slice(0, 50) + "...",
	// },
	// loop: {
	// 	value: "loop",
	// 	label: "Loop",
	// 	icon: "🔄",
	// 	getDescription: (node) =>
	// 		`Repeat ${(node.config as any).times || "multiple"} times`,
	// },
	// condition: {
	// 	value: "condition",
	// 	label: "Condition",
	// 	icon: "⋈",
	// 	getDescription: (node) =>
	// 		(node.config as any).condition?.slice(0, 50) + "...",
	// },
	// extract: {
	// 	value: "extract",
	// 	label: "Extract Data",
	// 	icon: "⇥",
	// 	getDescription: (node) =>
	// 		`Extract ${(node.config as any).columns?.length || 0} columns`,
	// },
	// microsoftExcel: {
	// 	value: "microsoftExcel",
	// 	label: "Microsoft Excel",
	// 	icon: "📊",
	// 	getDescription: (node) =>
	// 		(node.config as any).operation || "Excel operation",
	// },
	// dataCollection: {
	// 	value: "dataCollection",
	// 	label: "Data Collection",
	// 	icon: "📝",
	// 	getDescription: (node) =>
	// 		`Collect ${(node.config as any).fields?.length || 0} fields`,
	// },
	user_input: {
		value: "user_input",
		label: "💬 Workflow instructions and files requirements",
		icon: "💬",
		getDescription: (node) =>
			`Collect user input with prompt: ${
				(node.config as any).instructions?.slice(0, 50) || "..."
			}`,
	},
	reportGeneration: {
		value: "reportGeneration",
		label: "📄 Write a report",
		icon: "📄",
		getDescription: (node) =>
			`Generate report in ${
				(node.config as any).folderPath || "default folder"
			}/${(node.config as any).fileName || "report"}`,
	},
	// documentExtraction: {
	// 	value: "documentExtraction",
	// 	label: "Document Extraction",
	// 	icon: "📄",
	// 	getDescription: (node) =>
	// 		`Extract ${(node.config as any).columns?.length || 0} fields from ${
	// 			(node.config as any).selectedItems?.length || 0
	// 		} source${(node.config as any).selectedItems?.length === 1 ? "" : "s"}`,
	// },
	// documentSelection: {
	// 	value: "documentSelection",
	// 	label: "Document Selection",
	// 	icon: "📄",
	// 	getDescription: (node) =>
	// 		`Select ${(node.config as any).selectedItems?.length || 0} documents`,
	// },
	// updateResource: {
	// 	value: "updateResource",
	// 	label: "Update Resource",
	// 	icon: "📄",
	// 	getDescription: (node) =>
	// 		`Update ${(node.config as any).resourceName || "resource"} with prompt: ${
	// 			(node.config as any).prompt?.slice(0, 50) || "..."
	// 		}`,
	// },
	// chat: {
	// 	value: "chat",
	// 	label: "Chat",
	// 	icon: "💭",
	// 	getDescription: (node) =>
	// 		`${(node.config as any).config.message?.slice(0, 50) || ""}...`,
	// },
	runningLog: {
		value: "runningLog",
		label: "📝 Log",
		icon: "📝",
		getDescription: (node) =>
			`Log ${(node.config as any).logName || "log"} with prompt: ${
				(node.config as any).systemPrompt?.slice(0, 50) || "..."
			}`,
	},
	// outlook_attachments: {
	// 	value: "outlook_attachments",
	// 	label: "Outlook Attachments",
	// 	icon: "📄",
	// 	getDescription: (node) => "Get attachments from Outlook email",
	// },
	// outlook_reply: {
	// 	value: "outlook_reply",
	// 	label: "Outlook Reply",
	// 	icon: "✉️",
	// 	getDescription: (node) =>
	// 		`Reply to Outlook email${
	// 			node.config.include_original_message
	// 				? " (including original message)"
	// 				: ""
	// 		}`,
	// },
	// recipe: {
	// 	value: "recipe",
	// 	label: "Recipe",
	// 	icon: "🧪",
	// 	getDescription: (node) => `Execute recipe: ${node.config.recipe_name}`,
	// },
	// procore: {
	// 	value: NodeType.PROCORE,
	// 	label: "Procore Integration",
	// 	icon: "🏗️",
	// 	getDescription: (node: WorkflowNode) => {
	// 		const config = node.config as ProcoreNodeConfig;
	// 		return `Procore ${config.action} action on ${config.endpoint}`;
	// 	},
	// },

	// document_comparison: {
	// 	value: "document_comparison",
	// 	label: "Document Comparison",
	// 	icon: "📄",
	// 	getDescription: (node) =>
	// 		`Compare documents${
	// 			node.config.analyze_implications ? " with implications analysis" : ""
	// 		}`,
	// },
	document_search: {
		value: "document_search",
		label: "🔍 Document Search",
		icon: "🔍",
		getDescription: () => "Search in project documents",
	},
} as const;

// Helper functions that use the combined config
export const nodeTypes = Object.values(nodeConfigs).map(({ value, label }) => ({
	value,
	label,
}));

export const getNodeIcon = (type: string) => nodeConfigs[type]?.icon || "•";

export const getNodeDescription = (node: WorkflowNode) =>
	nodeConfigs[node.type]?.getDescription(node) || "No description available";
