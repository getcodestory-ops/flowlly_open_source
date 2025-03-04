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
const WorkflowResultsComponent: React.FC = () => {
  return (
    <div className="bg-gray-50 border border-emerald-200 rounded-lg p-4 my-3 shadow-sm">
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-emerald-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <div className="font-medium text-emerald-700">Workflow Results</div>
      </div>
      <div className="mt-2 bg-white bg-opacity-60 rounded p-3 border border-emerald-100">
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <svg
              className="w-4 h-4 text-emerald-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Completed in 2.4s</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <span>Started: 2 minutes ago</span>
            <span>Status: Complete</span>
          </div>
        </div>
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

        // Check for START_WORKFLOW pattern
        if (text.includes("[START_WORKFLOW:")) {
          const match = text.match(/\[START_WORKFLOW:([a-f0-9-]+)\]/);
          if (match && match[1]) {
            return <></>;
          }
        }

        // Check for WORKFLOW_RESULTS pattern
        if (text.includes("[WORKFLOW_RESULTS]")) {
          return <WorkflowResultsComponent />;
        }

        if (text.includes("[ROUTE_TO_WORKFLOW:")) {
          return <></>;
        }
      }

      // Default paragraph rendering
      return <p {...props}>{children}</p>;
    },
  };

  return (
    <div>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
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
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkDownDisplay;
