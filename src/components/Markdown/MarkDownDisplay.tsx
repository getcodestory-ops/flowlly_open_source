// MarkdownRenderer.tsx
import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import type { Components } from "react-markdown";
import { Play, Info } from "lucide-react";
import { visit } from "unist-util-visit";
import ContentEditor from "../DocumentEditor/ContentEditor";

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
	let jsonContent: any;
	try {
		jsonContent = JSON.parse(content);
	} catch (error) {
		console.error("Error parsing JSON content:", error);
	}

	return (
		<div className="bg-gray-50 border border-emerald-200 rounded-lg p-4 my-3 shadow-sm">
			<div className="flex items-center gap-2">
				{content && (
					<div className="text-sm text-gray-500">
						{JSON.stringify(jsonContent?.output?.body)}
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

// Component for rendering document references
const DocumentReference: React.FC<{ documentId: string, content: string }> = ({ documentId, content }) => {
	return (
		<div className="flex items-center gap-1">
		
			<ContentEditor content={content} />
		</div>
	);
};

const CustomViewer: React.FC<{ content: string }> = ({ content }) => {
	return (
		<div className="flex w-full transition-all ">
			<div className="flex justify-center gap-2  bg-gray-100 rounded-md p-2 border border-gray-300 ">
				<Play className="w-4 h-4" />
				<div className="font-medium text-gray-700 text-center text-xs ">
          			{content}
				</div>
			</div>
		</div>
	);
};

// Custom directive plugin that transforms directives to custom components
function remarkDirectiveComponents() {
	return (tree: any) => {
		visit(tree, (node) => {
			// Handle text directives (inline elements like :source[text])
			if (
				(node.type === "textDirective" ||
				node.type === "leafDirective" ||
				node.type === "containerDirective")
			) {
				const data = node.data || (node.data = {});
				const hName = node.name;
				
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
							content: "Read File",
						};
					
						break;
					case "execute_file_code":
						data.hName = "custom-execute-file-code";
						data.hProperties = {
							content: "Execute File Code",
						};
						break;
					case "write_report":
						data.hName = "custom-write-file";
						data.hProperties = {
							content: "Write Report Section",
						};
						break;
					case "edit_report":
						data.hName = "custom-edit-report";
						data.hProperties = {
							content: "Edit Report Section",
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
						
					default:
						// Use the directive name directly if not mapped
						data.hName = `custom-${hName}`;
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
		"custom-read-file": ({ content }: { content: string }) => <CustomViewer content={content} />,
		"custom-execute-file-code": ({ content }: { content: string }) => <CustomViewer content={content} />,
		"custom-write-file": ({ content }: { content: string }) => <CustomViewer content={content} />,
		"custom-edit-report": ({ content }: { content: string }) => <CustomViewer content={content} />,
		"custom-complete-report": ({ content }: { content: string }) => <CustomViewer content={content} />,
		"custom-generate-chart": ({ content }: { content: string }) => <CustomViewer content={content} />,
		"custom-workflow": ({ id }: { id: string }) => <WorkflowComponent id={id} />,
		"custom-workflow-results": ({ content }: { content: string }) => <WorkflowResultsComponent content={content} />,
		"custom-addition": ({ children }: { children: React.ReactNode }) => <AdditionHighlight>{children}</AdditionHighlight>,
		"custom-deletion": ({ children }: { children: React.ReactNode }) => <DeletionHighlight>{children}</DeletionHighlight>,
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
