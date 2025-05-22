// MarkdownRenderer.tsx
import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import type { Components } from "react-markdown";
import { Play, Info, Eye, CheckCircle, Pencil, FileText, Code, BarChart2, Save, Calendar, FolderSearch2, Search, Loader2, MessageCircle, FilePen, NotebookTabs, TextSearch } from "lucide-react";
import { visit } from "unist-util-visit";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderLine from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import { DiffStyleExtension } from "@/components/DocumentEditor/extensions/DiffStyleExtension";
import EditorProvider from "../DocumentEditor/EditorProvider";
import AttachmentViewer from "../AiActions/AttachmentViewer";

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
];

// Add Attachment interface
interface Attachment {
	name: string;
	uuid: string;
	type: string;
}

// Update AttachmentsComponent to use AttachmentViewer
const AttachmentsComponent: React.FC<{ attachments: string }> = ({ attachments }) => {
	try {
		const parsedAttachments = JSON.parse(attachments);
		const files = parsedAttachments.map((attachment: Attachment) => ({	
			resource_id: attachment.uuid,
			resource_name: attachment.name,
			extension: attachment.type,
		}));
		
		return <AttachmentViewer files={files} />;
	} catch (error) {
		return <div>Attachments: {attachments}</div>;
	}
};

// Custom directive plugin that transforms directives to custom components
function remarkDirectiveComponents() {
	return (tree: any) => {
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
							sourceText: node.children?.[0]?.value || "",
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
							content: node.children?.[0]?.value || "",
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
							content: node.children?.[0]?.value || "",
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
							content: "Selecting report template",
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
							attachments: node.children?.[0]?.value || "[]",
						};
						break;
					case "extract_file_insights":
						data.hName = "custom-extract-file-insights";
						data.hProperties = {
							content: "Extracting file insights",
						};
						break;
					case "get_report_template":
						data.hName = "custom-get-report-template";
						data.hProperties = {
							content: "Getting report template",
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

const MarkDownDisplay: React.FC<MarkdownRendererProps> = ({
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
		"custom-start-writing-or-editing-report": ({ content }: { content: string }) => <CustomViewer content={content} icon={<NotebookTabs className="w-4 h-4" />} />,
		"custom-extract-file-insights": ({ content }: { content: string }) => <CustomViewer content={content} icon={<TextSearch className="w-4 h-4" />} />,
		"custom-document-reference": ({ documentId, position }: { documentId: string, position: any }) => {
			let documentContent = "";
			if (position && position.start && position.end) {
				const fullContent = content.substring(
					position.start.offset, 
					position.end.offset,
				);
				
				const startMarker = `:::document{#${documentId}}`;
				const endMarker = ":::";
				
				documentContent = fullContent
					.substring(startMarker.length, fullContent.length - endMarker.length)
					.trim();
			}
			
			return <DocumentReference content={documentContent} documentId={documentId} />;
		},
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
                prose-code:bg-gray-100 prose-code:text-gray-900
                prose-pre:bg-gray-100 prose-pre:text-gray-900
                [&>*]:max-w-4xl [&>*]:mx-auto px-2 "
				components={components as Components}
				remarkPlugins={[remarkGfm, remarkDirective, remarkDirectiveComponents]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
};

export default MarkDownDisplay;
