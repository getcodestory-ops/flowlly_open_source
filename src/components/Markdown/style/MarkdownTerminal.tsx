import React from "react";
import MarkDownDisplay from "../MarkDownDisplay";

interface MarkdownTerminalProps {
	content: string;
}

const MarkdownTerminal: React.FC<MarkdownTerminalProps> = ({ content }) => {
	return (
		<div className="rounded-md p-3 border border-gray-300 font-mono bg-gray-50 shadow-sm">
			<div className="text-gray-800">
				<style>{`
					.terminal-log-container {
						font-size: 10px;
						line-height: 1.4;
						color: #374151 !important;
					}
					.terminal-log-container * {
						color: #374151 !important;
					}
					.terminal-log-container p {
						font-size: 10px !important;
						margin: 0.15rem 0 !important;
						line-height: 1.4 !important;
						position: relative;
						padding-left: 0.8rem;
						color: #374151 !important;
					}
					.terminal-log-container p:before {
						content: "▸ ";
						color: #059669 !important;
						font-weight: bold;
						position: absolute;
						left: 0;
					}
					.terminal-log-container pre {
						font-size: 10px !important;
						background: #f9fafb !important;
						border: 1px solid #d1d5db !important;
						padding: 0.5rem !important;
						margin: 0.25rem 0 !important;
						border-radius: 0.375rem !important;
						color: #1f2937 !important;
						box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
					}
					.terminal-log-container pre * {
						color: #1f2937 !important;
					}
					.terminal-log-container code {
						font-size: 10px !important;
						background: #f3f4f6 !important;
						color: #047857 !important;
						padding: 0.1rem 0.3rem !important;
						border-radius: 0.25rem !important;
						border: 1px solid #e5e7eb !important;
					}
					.terminal-log-container h1, 
					.terminal-log-container h2, 
					.terminal-log-container h3 {
						font-size: 11px !important;
						color: #1e40af !important;
						margin: 0.4rem 0 0.2rem 0 !important;
						font-weight: bold !important;
						border-bottom: 1px solid #e5e7eb !important;
						padding-bottom: 0.1rem !important;
					}
					.terminal-log-container ul, 
					.terminal-log-container ol {
						margin: 0.2rem 0 !important;
						padding-left: 1rem !important;
					}
					.terminal-log-container li {
						font-size: 10px !important;
						margin: 0.1rem 0 !important;
						color: #374151 !important;
					}
					.terminal-log-container strong {
						color: #dc2626 !important;
						font-weight: bold !important;
					}
					.terminal-log-container em {
						color: #7c3aed !important;
						font-style: italic !important;
					}
					.terminal-log-container blockquote {
						color: #6b7280 !important;
						border-left: 3px solid #059669 !important;
						padding-left: 0.5rem !important;
						margin: 0.25rem 0 !important;
						background: #f9fafb !important;
						padding: 0.3rem 0.5rem !important;
						border-radius: 0 0.25rem 0.25rem 0 !important;
					}
					.terminal-log-container a {
						color: #2563eb !important;
						text-decoration: underline !important;
					}
					.terminal-log-container a:hover {
						color: #1d4ed8 !important;
					}
				`}</style>
				<div className="terminal-log-container">
					<MarkDownDisplay content={content} />
				</div>
			</div>
		</div>
	);
};

export default MarkdownTerminal;
