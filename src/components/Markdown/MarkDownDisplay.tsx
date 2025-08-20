// MarkdownRenderer.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import type { Components } from "react-markdown";
import { Play, Info, Eye, EyeOff, CheckCircle, Pencil, FileText, Code, BarChart2, Save, Calendar, FolderSearch2, Search, Loader2, MessageCircle, FilePen, NotebookTabs, TextSearch, NotebookPen, FileOutput, FileInput, FilePlus, Terminal, Database, Network, FolderOpen, BookOpen, Brain, File, ExternalLink, Paperclip, ListTodo, Globe } from "lucide-react";
import { visit } from "unist-util-visit";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
// import { Markdown } from "tiptap-markdown"; // Temporarily disabled - not compatible with Tiptap v3
import { DiffStyleExtension } from "@/components/DocumentEditor/extensions/DiffStyleExtension";
import EditorProvider from "../DocumentEditor/EditorProvider";
import AttachmentViewer from "../AiActions/AttachmentViewer";
import  ChartComponent  from "./chart/ChartComponent";
import { useChatStore } from "@/hooks/useChatStore";
import FormDirective from "./form/FormDirective";
import  IntegrationDirective  from "./integration/IntegrationDirective";

interface MarkdownRendererProps {
  content: string;
  collapse?: boolean;
}

// Custom component for workflow display
const WorkflowComponent: React.FC<{ id?: string }> = ({ id }) => {
	return (
		<div className="flex w-full transition-all ">
			<div className="flex justify-center gap-2  bg-gray-100 rounded-md p-2 border border-gray-300 ">
				<Play className="w-4 h-4" />
				<div className="font-medium text-gray-700 text-center text-xs ">
          			Starting Workflow
				</div>
			</div>
		</div>
	);
};

// Custom component for source references
const SourceComponent: React.FC<{ sourceText: string }> = ({ sourceText }) => {
	return (
		<span className="inline-block relative group">
			<span className="inline-flex items-center gap-1 text-xs text-gray-600 px-1.5 py-0.5 rounded cursor-help mx-1">
				<Info className="w-3 h-3" />
			</span>
			<span className="absolute left-0 bottom-full mb-2 w-64 bg-white p-2 rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
				<p className="text-xs text-gray-700">{sourceText}</p>
			</span>
		</span>
	);
};

// Custom component for workflow results
const WorkflowResultsComponent: React.FC<{ content?: any }> = ({ content }) => {
	return (
		<div className="bg-white  rounded-lg p-4 my-3 shadow-sm">
			<div className="flex flex-col gap-2">
				{content && (
					<div className="text-sm text-gray-700 whitespace-pre-wrap">
						{content}
					</div>
				)}
			</div>
		</div>
	);
};

// Components for rendering highlighted content
const AdditionHighlight: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<span style={{ 
			backgroundColor: "rgba(0, 255, 0, 0.15)", 
			padding: "2px 4px", 
			borderRadius: "3px",
			display: "inline-block",
			margin: "2px 0",
		}}
		>
			{children}
		</span>
	);
};

const DeletionHighlight: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<span style={{ 
			backgroundColor: "rgba(255, 0, 0, 0.15)", 
			padding: "2px 4px", 
			borderRadius: "3px",
			display: "inline-block",
			margin: "2px 0",
		}}
		>
			{children}
		</span>
	);
};

// Add this new component for document references
const SimpleDocumentEditor: React.FC<{ content: string }> = ({ content }) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			// Markdown.configure({ // Temporarily disabled - not compatible with Tiptap v3
			// 	html: true,
			// }),
			Underline,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			DiffStyleExtension.configure({
				showDiffButtons: true,
			}),
		],
		content: content,
		editable: false,
	});

	return (<>
		{editor && <EditorProvider editor={editor} />}
	</>
	);
};

// Modify the DocumentReference component
const DocumentReference: React.FC<{ documentId: string, content: string }> = ({ documentId, content }) => {
	return (
		<div className="flex prose-p:text-sm h-[450px]">
			<SimpleDocumentEditor content={content} />
		</div>
	);
};

// Update CustomViewer to accept an icon string and map it to the correct icon component
const CustomViewer: React.FC<{ content: string; details?: string; icon?: React.ReactNode | string; className?: string, hide?: boolean }> = ({ content, details, icon, className, hide }) => {
	const [isVisible, setIsVisible] = useState(!hide);

	// Icon mapping for string names to React components
	const iconMap: { [key: string]: React.ReactNode } = {
		FilePlus: <FilePlus className="w-4 h-4" />,
		Edit: <Pencil className="w-4 h-4" />,
		FileInput: <FileInput className="w-4 h-4" />,
		Eye: <Eye className="w-4 h-4" />,
		Play: <Play className="w-4 h-4" />,
		Terminal: <Terminal className="w-4 h-4" />,
		Globe: <Globe className="w-4 h-4" />,
		FileSearch: <FileText className="w-4 h-4" />, // Using FileText as FileSearch isn't available
		Save: <Save className="w-4 h-4" />,
		FileText: <FileText className="w-4 h-4" />,
		BookOpen: <BookOpen className="w-4 h-4" />,
		FileDown: <FileInput className="w-4 h-4" />, // Using FileInput as FileDown isn't available
		Search: <Search className="w-4 h-4" />,
		ClipboardList: <ListTodo className="w-4 h-4" />, // Using ListTodo as ClipboardList isn't available
		Rocket: <ExternalLink className="w-4 h-4" />, // Using ExternalLink as Rocket isn't available
		MessageCircle: <MessageCircle className="w-4 h-4" />,
		Code: <Code className="w-4 h-4" />,
		Database: <Database className="w-4 h-4" />,
		Network: <Network className="w-4 h-4" />,
		FolderOpen: <FolderOpen className="w-4 h-4" />,
		Brain: <Brain className="w-4 h-4" />,
		File: <File className="w-4 h-4" />,
		CheckCircle: <CheckCircle className="w-4 h-4" />,
		Calendar: <Calendar className="w-4 h-4" />,
		BarChart2: <BarChart2 className="w-4 h-4" />,
		Loader2: <Loader2 className="w-4 h-4 animate-spin" />,
		FolderSearch2: <FolderSearch2 className="w-4 h-4" />,
		NotebookPen: <NotebookPen className="w-4 h-4" />,
		TextSearch: <TextSearch className="w-4 h-4" />,
		FileOutput: <FileOutput className="w-4 h-4" />,
		Info: <Info className="w-4 h-4" />,
		NotebookTabs: <NotebookTabs className="w-4 h-4" />,
		Settings: <Save className="w-4 h-4" />, // Using Save as Settings isn't available in current imports
	};

	// Determine which icon to use
	const getIcon = () => {
		if (typeof icon === "string") {
			return iconMap[icon] || <Play className="w-4 h-4" />;
		}
		return icon || <Play className="w-4 h-4" />;
	};

	return (
		<div className={`flex my-1 w-full transition-all  ${className}`}>
			<div className="flex justify-center gap-2 bg-gray-100  rounded-md p-0.5 px-2 border border-gray-300 ">
				<div>
					 {getIcon()} 
				</div>
				<div className="flex flex-col">
					
					<div className={`font-medium text-start text-xs ${!isVisible ? "hidden" : ""}`}>
						{content}
					</div>
					{details && isVisible && (
						<div className="text-xs text-gray-500 text-center mt-0.5">
							{details}
						</div>
					)}
					{hide && (
						<div className="flex justify-start">
							<button
								className="text-gray-500 flex  justify-start hover:text-gray-700 cursor-pointer p-1 hover:bg-gray-200 rounded transition-colors"
								onClick={() => setIsVisible(!isVisible)}
								title={isVisible ? "Hide details" : "Show details"}
							>
								{isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const UUIDViewer: React.FC<{ content: string }> = ({ content }) => {
	const { setSidePanel } = useChatStore();

	const handleClick = () => {
		setSidePanel({
			isOpen: true,
			type: "sources",
			resourceId: content,
			filename: "",
		});
	};

	return (
		<div className="inline-block text-xs text-gray-500 font-mono cursor-pointer"
			onClick={handleClick}
		>
			<ExternalLink className="w-3 h-3" />
		</div>
	);
};

// Add this constant with valid directive names
const VALID_DIRECTIVES = [
	"source",
	"respond_to_user",
	"attachments",
	"chart",
	"mark_task_complete",
	"instructions",
	"uuid",
	"form",
	"custom-viewer",
	"integration",
	"context",
];

// Add Attachment interface
interface Attachment {
	name: string;
	uuid: string;
	type?: string;
	url?: string;
	extension?: string;
	is_sandbox_file?: boolean;
	focus?: boolean;
}

// Update AttachmentsComponent to use AttachmentViewer
const AttachmentsComponent: React.FC<{ attachments: string }> = ({ attachments }) => {
	try {
		let parsedAttachments;
		
		try {
			// First try to parse as-is (valid JSON)
			parsedAttachments = JSON.parse(attachments);
		} catch (firstError) {
			// If that fails, try to convert Python dict format to JSON
			const jsonString = attachments
				.replace(/'/g, "\"")  // Replace single quotes with double quotes
				.replace(/True/g, "true")  // Replace Python True with JSON true
				.replace(/False/g, "false")  // Replace Python False with JSON false
				.replace(/None/g, "null");  // Replace Python None with JSON null
			
			parsedAttachments = JSON.parse(jsonString);
		}
		
		const files = parsedAttachments.map((attachment: Attachment) => ({	
			resource_id: attachment.is_sandbox_file 
				? `${attachment.uuid}::${attachment.name}` // Use sandbox_id::filename for unique identification
				: attachment.uuid,
			resource_name: attachment.name,
			extension: attachment.type || attachment.extension,
			url: attachment.url, // Include URL if present
			type: attachment.is_sandbox_file ? "sandbox" : "storage",
			focus: attachment.focus,
			sandbox_id: attachment.is_sandbox_file ? attachment.uuid : undefined, // Explicit sandbox ID for API calls
		}));
		
		return <AttachmentViewer files={files} />;
	} catch (error) {
		console.error("Error parsing attachments:", error);
		console.error("Attachments string that failed:", attachments);
		return (
			<div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
				<div className="text-red-700 font-medium">Error parsing attachments</div>
				<div className="text-red-600 text-xs mt-1">Raw data: {attachments}</div>
			</div>
		);
	}
};

// Custom directive plugin that transforms directives to custom components
function remarkDirectiveComponents() {
	return (tree: any) => {
		// Helper function to extract complete text content from all child nodes
		const extractCompleteContent = (node: any): string => {
			if (!node.children) return "";
			
			let content = "";
			const traverse = (children: any[]) => {
				for (const child of children) {
					if (child.type === "text") {
						content += child.value;
					} else if (child.children) {
						traverse(child.children);
					}
				}
			};
			traverse(node.children);
			return content;
		};

		visit(tree, (node) => {
			if (
				(node.type === "textDirective" ||
				node.type === "leafDirective" ||
				node.type === "containerDirective")
			) {
				const data = node.data || (node.data = {});
				const hName = node.name;
				
				// Check if the directive name is valid
				if (!VALID_DIRECTIVES.includes(hName)) {
					// For invalid directives, render them as plain text
					data.hName = "span";
					data.hProperties = {
						className: "invalid-directive",
						style: "color: #666;",
					};
					return;
				}

				const attributes = node.attributes || {};
				const id = attributes.id || "";
				
				// Map directive names to component names based on the directive name
				switch (hName) {
					case "source":
						// Extract the sourceText from the content
						data.hName = "custom-source";
						data.hProperties = {
							sourceText: extractCompleteContent(node),
						};
						break;
					
					case "workflow":
						data.hName = "custom-workflow";
						data.hProperties = {
							id: node.attributes?.id || "",
						};
						break;
					
					case "workflow-results":
						data.hName = "custom-workflow-results";
						data.hProperties = {
							content: extractCompleteContent(node),
						};
						break;
					
					case "addition":
						data.hName = "custom-addition";
						// Children will be passed through automatically
						break;
					
					case "deletion":
						data.hName = "custom-deletion";
						// Children will be passed through automatically
						break;
					
					case "document":
						data.hName = "custom-document-reference";
						data.hProperties = {
							documentId: node.attributes?.id || "",
							position: node.position,
						};
						break;
					case "read_file":
						data.hName = "custom-read-file";
						data.hProperties = {
							content: "Reading File",
						};
					
						break;
					case "execute_file_code":
						data.hName = "custom-execute-file-code";
						data.hProperties = {
							content: "Code analysis",
						};
						break;
					case "write_report_content":
						data.hName = "custom-write-file";
						data.hProperties = {
							content: "Writing Report Section",
						};
						break;
					case "edit_report":
						data.hName = "custom-edit-report";
						data.hProperties = {
							content: "Editing Report Section",
						};
						break;
					case "complete_report":
						data.hName = "custom-complete-report";
						data.hProperties = {
							content: "Saving Report",
						};
						break;
					case "generate_chart":
						data.hName = "custom-generate-chart";
						data.hProperties = {
							content: "Generating Chart",
						};
						break;
					case "workflow_result":
						data.hName = "custom-workflow-result";
						data.hProperties = {
							content: extractCompleteContent(node),
							id: id,
						};
						break;
					case "lookup_log":
						data.hName = "custom-lookup-log";
						data.hProperties = {
							content: "Looking up Log",
						};
						break;
					case "complete_log_update":
						data.hName = "custom-complete-log-update";
						data.hProperties = {
							content: "Completing Log Update",
						};
						break;
					case "project_document_search":
						data.hName = "custom-project-document-search";
						data.hProperties = {
							content: "Searching Project Documents",
						};
						break;
					case "google_search":
						data.hName = "custom-google-search";
						data.hProperties = {
							content: "Searching the web",
						};
						break;
					case "workflow_started":
						data.hName = "custom-workflow-started";
						data.hProperties = {
							content: "Workflow started",
						};
						break;
					case "workflow_completed":
						data.hName = "custom-workflow-completed";
						data.hProperties = {
							content: "Workflow completed",
						};
						break;
					case "follow_up_started":
						data.hName = "custom-follow-up-started";
						data.hProperties = {
							content: "Follow-up started",
						};
						break;
					case "look_up_project_schedule":
						data.hName = "custom-look-up-project-schedule";
						data.hProperties = {
							content: "Looking up project schedule",
						};
						break;
					case "respond_to_user":
						data.hName = "custom-respond-to-user";
						data.hProperties = {
							content: "Workflow will continue after your response",
						};
						break;
					case "start_writing_or_editing_report":
						data.hName = "custom-start-writing-or-editing-report";
						data.hProperties = {
							content: "Setting editor ",
						};
						break;
					case "edit_report":
						data.hName = "custom-edit-report";
						data.hProperties = {
							content: "Editing Report Section",
						};
						break;
					case "attachments":
						data.hName = "custom-attachments";
						data.hProperties = {
							attachments: extractCompleteContent(node) || "[]",
						};
						break;
					case "extract_file_insights":
						data.hName = "custom-extract-file-insights";
						data.hProperties = {
							content: "Extracting file insights",
						};
						break;
					case "get_task_guidelines":
						data.hName = "custom-get-task-guidelines";
						data.hProperties = {
							content: "Checking if there are any existing guidelines to follow",
						};
						break;
					case "chart":
						data.hName = "custom-chart";
						data.hProperties = {
							data: extractCompleteContent(node) || "{}",
						};
						break;
					case "write_project_document_to_sandbox":
						data.hName = "custom-write-project-document-to-sandbox";
						data.hProperties = {
							content: "Writing Project Document to Sandbox",
						};
						break;
					case "read_complete_project_document":
						data.hName = "custom-read-complete-project-document";
						data.hProperties = {
							content: "Reading Complete Project Document",
						};
						break;
					case "read_project_document_summary":
						data.hName = "custom-read-project-document-summary";
						data.hProperties = {
							content: "Reading Project Document Summary",
						};
						break;
					case "copy_file_from_sandbox_to_project_document":
						data.hName = "custom-copy-file-from-sandbox-to-project-document";
						data.hProperties = {
							content: "Copying File from Sandbox to Project",
						};
						break;
					case "read_file_from_sandbox":
						data.hName = "custom-read-file-from-sandbox";
						data.hProperties = {
							content: "Reading File from Sandbox",
						};
						break;
					case "get_all_files_in_sandbox":
						data.hName = "custom-get-all-files-in-sandbox";
						data.hProperties = {
							content: "Getting All Files in Sandbox",
						};
						break;
					case "execute_code_in_jupyter_notebook":
						data.hName = "custom-execute-code-in-jupyter-notebook";
						data.hProperties = {
							content: "Executing Code in Jupyter Notebook",
						};
						break;
					case "run_command_in_sandbox":
						data.hName = "custom-run-command-in-sandbox";
						data.hProperties = {
							content: "Running Command in Sandbox",
						};
						break;
					case "create_new_file_in_sandbox":
						data.hName = "custom-create-new-file-in-sandbox";
						data.hProperties = {
							content: "Creating New File in Sandbox",
						};
						break;
					case "update_file_in_sandbox":
					case "edit_file_in_sandbox":
						data.hName = "custom-update-file-in-sandbox";
						data.hProperties = {
							content: "Updating File in Sandbox",
						};
						break;
					case "append_to_file_in_sandbox":
						data.hName = "custom-append-to-file-in-sandbox";
						data.hProperties = {
							content: "Appending to File in Sandbox",
						};
						break;
					case "expose_sandbox_port":
						data.hName = "custom-expose-sandbox-port";
						data.hProperties = {
							content: "Exposing Sandbox Port",
						};
						break;
					case "mark_task_complete":
						data.hName = "custom-mark-task-complete";
						data.hProperties = {
							content: "Marking Task as Complete",
						};
						break;
					case "programming_expert":
						data.hName = "custom-programming-expert";
						data.hProperties = {
							content: "Programming Expert",
						};
						break;
					case "examine_project_document_file":
						data.hName = "custom-visually-examine-project-document-file";
						data.hProperties = {
							content: "Visually Examining Project Document File",
						};
						break;
					case "examine_file_from_sandbox":
						data.hName = "custom-visually-examine-file-from-sandbox";
						data.hProperties = {
							content: "Visually Examining File from Sandbox",
						};
						break;
					case "uuid":
						data.hName = "custom-uuid";
						data.hProperties = {
							content: extractCompleteContent(node),
						};
						break;
					case "edit_project_document":
						data.hName = "custom-edit-project-document";
						data.hProperties = {
							content: "Editing Project Document",
						};
						break;
					case "append_to_project_document":
						data.hName = "custom-append-to-project-document";
						data.hProperties = {
							content: "Appending to Project Document",
						};
						break;
					case "create_new_project_document":
						data.hName = "custom-create-new-project-document";
						data.hProperties = {
							content: "Creating New Project Document",
						};
						break;
					case "programming_assistant":
						data.hName = "custom-programming-assistant";
						data.hProperties = {
							content: "Assistant",
						};
						break;
					case "save_checkpoint":
						data.hName = "custom-save-checkpoint";
						data.hProperties = {
							content: "Saving Checkpoint",
						};
						break;
					case "form":
						data.hName = "custom-form";
						data.hProperties = {
							data: extractCompleteContent(node) || "{}",
						};
						break;
					case "instructions":
					case "context":
						data.hName = "custom-instructions";
						data.hProperties = {
							content: extractCompleteContent(node),
						};
						break;
					case "send_message_to_user":
						data.hName = "custom-send-message-to-user";
						data.hProperties = {
							content: "",
						};
						break;
					case "assistant":
						data.hName = "custom-assistant";
						data.hProperties = {
							content: extractCompleteContent(node),
						};
						break;
					case "integration":
						data.hName = "custom-integration";
						data.hProperties = {
							data: extractCompleteContent(node) || "{}",
						};
						break;
					case "custom-viewer":
						data.hName = "custom-viewer";
						try {
							const jsonData = JSON.parse(extractCompleteContent(node) || "{}");
							data.hProperties = {
								data: jsonData,
							};
						} catch (error) {
							console.error("Error parsing custom-viewer data:", error);
							data.hProperties = {
								data: {
									description: "Error parsing data",
									icon: "Info",
									color: "text-red-600",
								},
							};
						}
						break;
					default:
						// Use the directive name directly if not mapped
						data.hName = `${hName}`;
						data.id = id;
						data.hProperties = {
							data: extractCompleteContent(node) || "{}",
						};
				}
			}
		});
	};
}

// Extend the Components type to allow our custom components
type CustomMarkdownComponents = Components & {
	[key: string]: React.ComponentType<any>;
};

const MarkDownDisplay: React.FC<MarkdownRendererProps> = React.memo(({
	content,
}) => {
	// Custom components for ReactMarkdown
	const components: CustomMarkdownComponents = {
		// Custom link component that opens in new tab and shows "click here" for URLs
		a: ({ href, children, ...props }: any) => {
			// Check if the link text is the same as the URL (auto-generated link)
			const linkText = typeof children === "string" ? children : children?.[0];
			const isAutoLink = href === linkText || (typeof linkText === "string" && linkText.startsWith("http"));
			
			return (
				<a 
					{...props}
					className="inline-flex items-center gap-1 px-2 py-1 mx-1 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300 transition-all duration-200 no-underline group"
					href={href}
					rel="noopener noreferrer"
					target="_blank"
				>
					<span>{isAutoLink ? "click here" : children}</span>
					<Globe className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
				</a>
			);
		},
		// Define components for each custom element
		"custom-source": ({ sourceText }: { sourceText: string }) => <SourceComponent sourceText={sourceText} />,
		"custom-viewer": ({ data }: { data: { description: string, details?: string, icon: string, className?: string, color?: string } }) => <CustomViewer 
			className={data.className || data.color}
			content={data.description}
			details={data.details}
			icon={data.icon}
		                                                                                                                                      />,
		"custom-read-file": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FileText className="w-4 h-4" />} />,
		"custom-lookup-log": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Eye className="w-4 h-4" />} />,
		"custom-complete-log-update": ({ content }: { content: string }) => <CustomViewer content={content} icon={<CheckCircle className="w-4 h-4" />} />,
		"custom-execute-file-code": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Code className="w-4 h-4" />} />,
		"custom-write-file": ({ content }: { content: string }) => <CustomViewer 
			content={content}
			icon={<Pencil className="w-4 h-4" />}
		                                                           />,
		"custom-get-report-template": ({ content }: { content: string }) => <CustomViewer content={content} icon={<NotebookTabs className="w-4 h-4" />} />,
		"custom-edit-report": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Pencil className="w-4 h-4" />} />,
		"custom-complete-report": ({ content }: { content: string }) => <CustomViewer className="text-green-500"
			content={content}
			icon={<Save className="w-4 h-4" />}
		                                                                />,
		"custom-generate-chart": ({ content }: { content: string }) => <CustomViewer content={content} icon={<BarChart2 className="w-4 h-4" />} />,
		"custom-workflow": ({ id }: { id: string }) => <WorkflowComponent id={id} />,
		"custom-workflow-results": ({ content }: { content: string }) => <WorkflowResultsComponent content={content} />,
		"custom-addition": ({ children }: { children: React.ReactNode }) => <AdditionHighlight>{children}</AdditionHighlight>,
		"custom-deletion": ({ children }: { children: React.ReactNode }) => <DeletionHighlight>{children}</DeletionHighlight>,
		"custom-workflow-result": ({ content }: { content: string }) => <WorkflowResultsComponent content={content} />,
		"custom-google-search": ({ content }: { content: string }) => <CustomViewer className="text-blue-500"
			content={content}
			icon={<Search className="w-4 h-4" />}
		                                                              />,
		"custom-workflow-started": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Loader2 className="w-4 h-4 animate-spin" />} />,
		"custom-programming-assistant": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Brain className="w-4 h-4" />} />,
		"custom-attachments": ({ attachments }: { attachments: string }) => (
			<AttachmentsComponent attachments={attachments} />
		),
		"custom-respond-to-user": ({ content }: { content: string }) => <CustomViewer className="text-yellow-500"
			content={content}
			icon={<MessageCircle className="w-4 h-4 " />}
		                                                                />,
		"custom-workflow-completed": ({ content }: { content: string }) => <CustomViewer content={content} icon={<CheckCircle className="w-4 h-4" />} />,
		"custom-project-document-search": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FolderSearch2 className="w-4 h-4" />} />,
		"custom-follow-up-started": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Loader2 className="w-4 h-4 animate-spin" />} />,
		"custom-look-up-project-schedule": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Calendar className="w-4 h-4" />} />,
		"custom-start-writing-or-editing-report": ({ content }: { content: string }) => <CustomViewer content={content} icon={<NotebookPen className="w-4 h-4" />} />,
		"custom-get-task-guidelines": ({ content }: { content: string }) => <CustomViewer content={content} icon={<TextSearch className="w-4 h-4" />} />,
		"custom-extract-file-insights": ({ content }: { content: string }) => <CustomViewer content={content} icon={<TextSearch className="w-4 h-4" />} />,
		"custom-chart": ({ data }: { data: string }) => <ChartComponent data={data} />,
		"custom-visually-examine-project-document-file": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Eye className="w-4 h-4" />} />,
		"custom-visually-examine-file-from-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Eye className="w-4 h-4" />} />,
		"custom-write-project-document-to-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FileOutput className="w-4 h-4" />} />,
		"custom-read-complete-project-document": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FileInput className="w-4 h-4" />} />,
		"custom-read-project-document-summary": ({ content }: { content: string }) => <CustomViewer content={content} icon={<TextSearch className="w-4 h-4" />} />,
		"custom-copy-file-from-sandbox-to-project-document": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FilePlus className="w-4 h-4" />} />,
		"custom-edit-project-document": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Pencil className="w-4 h-4" />} />,
		"custom-append-to-project-document": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FilePlus className="w-4 h-4" />} />,
		"custom-create-new-project-document": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FilePlus className="w-4 h-4" />} />,
		"custom-read-file-from-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FileText className="w-4 h-4" />} />,
		"custom-get-all-files-in-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FolderSearch2 className="w-4 h-4" />} />,
		"custom-execute-code-in-jupyter-notebook": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Code className="w-4 h-4" />} />,
		"custom-run-command-in-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Terminal className="w-4 h-4" />} />,
		"custom-create-new-file-in-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FilePlus className="w-4 h-4" />} />,
		"custom-update-file-in-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Pencil className="w-4 h-4" />} />,
		"custom-append-to-file-in-sandbox": ({ content }: { content: string }) => <CustomViewer content={content} icon={<FilePlus className="w-4 h-4" />} />,
		"custom-send-message-to-user": ({ content }: { content: string }) => <div className="mt-4"> </div>,
		"custom-expose-sandbox-port": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Network className="w-4 h-4" />} />,
		"custom-mark-task-complete": ({ content }: { content: string }) => <CustomViewer className="text-green-500"
			content={content}
			icon={<CheckCircle className="w-4 h-4" />}
		                                                                   />,
		"custom-assistant": ({ content }: { content: string }) => <CustomViewer className="text-blue-500"
			content={content}
			icon={<Brain className="w-4 h-4" />}
		                                                          />,
		"custom-programming-expert": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Brain className="w-4 h-4" />} />,
		"custom-uuid": ({ content }: { content: string }) => (
			<UUIDViewer content={content} />
		),
		"custom-save-checkpoint": ({ content }: { content: string }) => <CustomViewer content={content} icon={<Save className="w-4 h-4" />} />,
		"custom-form": ({ data }: { data: string }) => <FormDirective data={data} />,
		"custom-instructions": ({ content }: { content: string }) => <CustomViewer content={content}
			hide
			icon={<ListTodo className="w-4 h-4" />}
		                                                             />,
		"custom-integration": ({ data }: { data: string }) => <IntegrationDirective data={data} />,
		// Use a normal paragraph component for li elements
		li: ({ children, ...props }: any) => {
			return <li {...props}>{children}</li>;
		},
	};

	return (
		<div>
			<ReactMarkdown
				className=" m-2 w-full prose prose-sm max-w-none
                prose-headings:mb-2 prose-headings:mt-1.5 
                prose-p:my-0.5 prose-p:leading-relaxed 
                prose-li:my-0 
                prose-ol:pl-5 
                prose-ol:list-decimal
                prose-headings:text-gray-800
                prose-p:text-gray-700
                prose-strong:text-gray-800
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg 
                prose-code:bg-gray-100 prose-code:text-gray-900 prose-code:break-words prose-code:whitespace-pre-wrap
                prose-pre:bg-gray-100 prose-pre:text-gray-900 prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap prose-pre:break-words
                [&>*]:max-w-4xl [&>*]:mx-auto px-2 "
				components={components as Components}
				remarkPlugins={[remarkGfm, remarkDirective, remarkDirectiveComponents]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
});

// Add display name for better debugging
MarkDownDisplay.displayName = "MarkDownDisplay";

export default MarkDownDisplay;
