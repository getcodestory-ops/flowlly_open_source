// MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Play } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  collapse?: boolean;
}

// Custom component for workflow display
const WorkflowComponent: React.FC<{ id: string }> = ({ id }) => {
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

const MarkDownDisplay: React.FC<MarkdownRendererProps> = ({
	content,
	collapse = false,
}) => {
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

				// Check if text contains any workflow patterns
				if (
					text.includes("[START_WORKFLOW:") ||
          text.includes("[WORKFLOW_RESULTS:") ||
          text.includes("[ROUTE_TO_WORKFLOW:")
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

					// Process START_WORKFLOW tags
					let startIndex = text.indexOf("[START_WORKFLOW:");
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
				{content}
			</ReactMarkdown>
		</div>
	);
};

export default MarkDownDisplay;
