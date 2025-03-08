// MarkdownRenderer.tsx
import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Play, Info } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  collapse?: boolean;
}

// Custom component for workflow display
const WorkflowComponent: React.FC<{ id?: string }> = ({  }) => {
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



// Custom list item component that handles source tags
const ListItemWithSource: React.FC<any> = ({ children, ...props }) => {
	const extractText = (node: any): string => {
		if (typeof node === "string") return node;
		if (!node) return "";
		
		if (Array.isArray(node)) {
			return node.map(extractText).join("");
		}
		
		if (typeof node === "object" && node !== null) {
			// Safely check for props and children
			const nodeProps = node as { props?: { children?: any } };
			if (nodeProps.props && nodeProps.props.children) {
				return extractText(nodeProps.props.children);
			}
		}
		
		return "";
	};
	
	const childrenText = extractText(children);
	
	// If no source tags, just render the list item normally
	if (!childrenText.includes("[SOURCE")) {
		return <li {...props}>{children}</li>;
	}
	
	// Process the content to replace source tags with source components
	const processContent = (content: React.ReactNode): React.ReactNode => {
		// Handle string content directly
		if (typeof content === "string") {
			if (content.includes("[SOURCE")) {
				// Replace source tags with empty strings and add source components
				const parts: React.ReactNode[] = [];
				let lastIndex = 0;
				let key = 0;
				
				// Find all source tags
				const regex = /\[SOURCE[:\s]+(.*?)\s*\]/g;
				let match;
				const sources: string[] = [];
				
				while ((match = regex.exec(content)) !== null) {
					// Add text before the tag
					if (match.index > lastIndex) {
						parts.push(<span key={key++}>{content.substring(lastIndex, match.index)}</span>);
					}
					
					// Store the source text
					if (match[1]) {
						sources.push(match[1]);
					}
					
					lastIndex = match.index + match[0].length;
				}
				
				// Add any remaining text
				if (lastIndex < content.length) {
					parts.push(<span key={key++}>{content.substring(lastIndex)}</span>);
				}
				
				// Add source components at the end
				sources.forEach((source, index) => {
					parts.push(<SourceComponent key={`source-${index}`} sourceText={source} />);
				});
				
				return parts;
			}
			return content;
		}
		
		// Handle arrays of children
		if (Array.isArray(content)) {
			return content.map((child, index) => {
				if (typeof child === "string") {
					return processContent(child);
				}
				
				if (React.isValidElement(child)) {
					// Process the children of this element
					const childProps = child.props as any;
					const processedChildren = processContent(childProps.children);
					
					// If the children changed, clone the element with the new children
					if (processedChildren !== childProps.children) {
						return React.cloneElement(child, { key: index }, processedChildren);
					}
				}
				
				return child;
			});
		}
		
		// Handle React elements
		if (React.isValidElement(content)) {
			const childProps = content.props as any;
			const processedChildren = processContent(childProps.children);
			
			// If the children changed, clone the element with the new children
			if (processedChildren !== childProps.children) {
				return React.cloneElement(content, {}, processedChildren);
			}
		}
		
		return content;
	};
	
	// Process the children to replace source tags
	const processedChildren = processContent(children);
	
	return <li {...props}>{processedChildren}</li>;
};

const MarkDownDisplay: React.FC<MarkdownRendererProps> = ({
	content,
}) => {
	// Pre-process the content to handle source tags in complex markdown
	const preprocessContent = (content: string): string => {
		// Find all source tags and add a space before them if they don't have one
		// This helps ReactMarkdown parse them correctly
		return content.replace(/(\S)(\[SOURCE)/g, "$1 $2");
	};

	const processedContent = preprocessContent(content);

	// Custom components for ReactMarkdown
	const components: Components = {
		p: ({ node, children, ...props }: any) => {
			// Check if this paragraph contains our special workflow tags
			if (
				typeof children === "string" ||
        (Array.isArray(children) &&
          children.length === 1 &&
          typeof children[0] === "string")
			) {
				const text = typeof children === "string" ? children : children[0];

				// Check if text contains any workflow patterns or source patterns
				if (
					text.includes("[START_WORKFLOW:") ||
					text.includes("[WORKFLOW_RESULTS:") ||
					text.includes("[ROUTE_TO_WORKFLOW:") ||
					text.includes("[SOURCE")
				) {
					// Handle ROUTE_TO_WORKFLOW pattern - if present, just return empty
					if (text.includes("[ROUTE_TO_WORKFLOW:")) {
						return <></>;
					}

					// Process the text to handle workflow patterns
					const processedContent: React.ReactNode[] = [];
					let lastIndex = 0;
					let key = 0;

					// Function to find the closing bracket for a workflow tag
					const findClosingBracket = (
						str: string,
						startIndex: number,
					): number => {
						let openCount = 1;
						let i = startIndex;

						while (i < str.length && openCount > 0) {
							if (str[i] === "[") openCount++;
							if (str[i] === "]") openCount--;
							i++;
						}

						return openCount === 0 ? i - 1 : -1;
					};

					// Process SOURCE tags first
					let startIndex = text.indexOf("[SOURCE");
					while (startIndex !== -1) {
						// Add text before the tag
						if (startIndex > lastIndex) {
							const beforeText = text.substring(lastIndex, startIndex);
							if (beforeText.trim()) {
								processedContent.push(<span key={key++}>{beforeText}</span>);
							}
						}

						const closingIndex = text.indexOf("]", startIndex);
						if (closingIndex !== -1) {
							const fullTag = text.substring(startIndex, closingIndex + 1);
							// Updated regex to properly extract the source text
							const sourceMatch = fullTag.match(/\[SOURCE[:\s]+(.*?)\s*\]/);

							if (sourceMatch && sourceMatch[1]) {
								const sourceText = sourceMatch[1];
								processedContent.push(
									<SourceComponent key={key++} sourceText={sourceText} />,
								);
								
								// Check if there's punctuation immediately after the closing bracket
								if (closingIndex + 1 < text.length && /[.,;!?]/.test(text[closingIndex + 1])) {
									processedContent.push(
										<span key={key++}>{text[closingIndex + 1]}</span>,
									);
									lastIndex = closingIndex + 2; // Skip the punctuation
								} else {
									lastIndex = closingIndex + 1;
								}
							} else {
								lastIndex = closingIndex + 1;
							}
						} else {
							// No closing bracket found, move past this tag
							lastIndex = startIndex + 1;
						}

						startIndex = text.indexOf("[SOURCE", lastIndex);
					}

					// Process START_WORKFLOW tags
					startIndex = text.indexOf("[START_WORKFLOW:");
					while (startIndex !== -1) {
						// Add text before the tag
						if (startIndex > lastIndex) {
							const beforeText = text.substring(lastIndex, startIndex);
							if (beforeText.trim()) {
								processedContent.push(<span key={key++}>{beforeText}</span>);
							}
						}

						const closingIndex = text.indexOf("]", startIndex);
						if (closingIndex !== -1) {
							const tag = text.substring(startIndex, closingIndex + 1);
							const idMatch = tag.match(/\[START_WORKFLOW:([a-f0-9-]+)\]/);

							if (idMatch && idMatch[1]) {
								processedContent.push(
									<WorkflowComponent id={idMatch[1]} key={key++} />,
								);
							}

							lastIndex = closingIndex + 1;
						} else {
							// No closing bracket found, move past this tag
							lastIndex = startIndex + 1;
						}

						startIndex = text.indexOf("[START_WORKFLOW:", lastIndex);
					}

					// Process WORKFLOW_RESULTS tags
					startIndex = text.indexOf("[WORKFLOW_RESULTS");
					while (startIndex !== -1) {
						// Add text before the tag
						if (startIndex > lastIndex) {
							const beforeText = text.substring(lastIndex, startIndex);
							if (beforeText.trim()) {
								processedContent.push(<span key={key++}>{beforeText}</span>);
							}
						}

						// Find the closing bracket, considering nested JSON
						const closingIndex = findClosingBracket(text, startIndex + 1);

						if (closingIndex !== -1) {
							const fullTag = text.substring(startIndex, closingIndex + 1);
							let resultsContent = "";

							// Check if there's content after the colon
							const colonIndex = fullTag.indexOf(":");
							if (colonIndex !== -1 && colonIndex < fullTag.length - 1) {
								resultsContent = fullTag
									.substring(colonIndex + 1, fullTag.length - 1)
									.trim();
							}

							// Create a custom component that displays the JSON content
							processedContent.push(
								<div className="workflow-results" key={key++}>
									{resultsContent && (
										<WorkflowResultsComponent content={resultsContent} />
									)}
								</div>,
							);

							lastIndex = closingIndex + 1;
						} else {
							// No closing bracket found, move past this tag
							lastIndex = startIndex + 1;
						}

						startIndex = text.indexOf("[WORKFLOW_RESULTS", lastIndex);
					}

					// Add any remaining text after the last match
					if (lastIndex < text.length) {
						const remainingText = text.substring(lastIndex);
						if (remainingText.trim()) {
							processedContent.push(<span key={key++}>{remainingText}</span>);
						}
					}

					return <div>{processedContent}</div>;
				}
			}

			// Default paragraph rendering
			return <p {...props}>{children}</p>;
		},
		// Use our custom list item component
		li: (props) => <ListItemWithSource {...props} />,
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
				components={components}
				remarkPlugins={[remarkGfm]}
			>
				{processedContent}
			</ReactMarkdown>
		</div>
	);
};

export default MarkDownDisplay;
