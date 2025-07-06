// MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import type { Components } from "react-markdown";
import { Play, Info, Eye, CheckCircle, Pencil, FileText, Code, BarChart2, Save, Calendar, FolderSearch2, Search, Loader2, MessageCircle, FilePen, NotebookTabs, TextSearch, NotebookPen, FileOutput, FileInput, FilePlus, Terminal, Database, Network, FolderOpen, BookOpen, Brain, File, ExternalLink, Paperclip, ListTodo } from "lucide-react";
import { visit } from "unist-util-visit";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderLine from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
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
			Markdown.configure({
				html: true,
			}),
			UnderLine,
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

// Update CustomViewer to accept an icon
const CustomViewer: React.FC<{ content: string; icon?: React.ReactNode; className?: string }> = ({ content, icon, className }) => {
	return (
		<div className={`flex my-1 w-full transition-all  ${className}`}>
			<div className="flex justify-center gap-2 bg-gray-100  rounded-md p-0.5 px-2 border border-gray-300 ">
				<div>
					{icon || <Play className="w-4 h-4" />}
				</div>
				<div className="font-medium  text-center text-xs ">
          			{content}
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
	"workflow",
	"workflow-results",
	"addition",
	"deletion",
	"document",
	"read_file",
	"execute_file_code",
	"write_report_content",
	"edit_report_content",
	"complete_report",
	"generate_chart",
	"workflow_result",
	"lookup_log",
	"complete_log_update",
	"project_document_search",
	"google_search",
	"workflow_started",
	"workflow_completed",
	"follow_up_started",
	"look_up_project_schedule",
	"respond_to_user",
	"start_writing_or_editing_report",
	"edit_report",
	"attachments",
	"extract_file_insights",
	"get_report_template",
	"get_task_guidelines",
	"chart",
	"write_project_document_to_sandbox",
	"read_complete_project_document",
	"read_project_document_summary",
	"copy_file_from_sandbox_to_project_document",
	"read_file_from_sandbox",
	"get_all_files_in_sandbox",
	"execute_code_in_jupyter_notebook",
	"run_command_in_sandbox",
	"create_new_file_in_sandbox",
	"update_file_in_sandbox",
	"edit_file_in_sandbox",
	"append_to_file_in_sandbox",
	"expose_sandbox_port",
	"mark_task_complete",
	"programming_expert",
	"examine_project_document_file",
	"examine_file_from_sandbox",
	"edit_project_document",
	"append_to_project_document",
	"create_new_project_document",
	"send_message_to_user",
	"programming_assistant",
	"save_checkpoint",
	"instructions",
	"uuid",
	"form",
	"assistant",
	"integration",
];

// Add Attachment interface
interface Attachment {
	name: string;
	uuid: string;
	type: string;
	url?: string;
}

// Update AttachmentsComponent to use AttachmentViewer
const AttachmentsComponent: React.FC<{ attachments: string }> = ({ attachments }) => {
	try {
		const parsedAttachments = JSON.parse(attachments);
		
		const files = parsedAttachments.map((attachment: Attachment) => ({	
			resource_id: attachment.uuid,
			resource_name: attachment.name,
			extension: attachment.type,
			url: attachment.url, // Include URL if present
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
							data: node.children?.[0]?.children[0]?.value || "{}",
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
							data: node.children?.[0]?.children[0]?.value || "{}",
						};
						break;
					case "instructions":
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
					default:
						// Use the directive name directly if not mapped
						data.hName = `custom-${hName}`;
						data.id = id;
						data.hProperties = node.attributes || {};
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
		// Define components for each custom element
		"custom-source": ({ sourceText }: { sourceText: string }) => <SourceComponent sourceText={sourceText} />,
		"custom-viewer": ({ content }: { content: string }) => <CustomViewer content={content} />,
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
		"custom-instructions": ({ content }: { content: string }) => <CustomViewer content="instructions" icon={<ListTodo className="w-4 h-4" />} />,
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
