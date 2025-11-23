import React, { useEffect, useRef } from "react";

interface MinutesHTMLViewerProps {
	htmlContent: string;
	cssContent?: string;
	headerContent?: string;
	onTimestampClick?: (seconds: number) => void;
}

export const MinutesHTMLViewer: React.FC<MinutesHTMLViewerProps> = ({
	htmlContent,
	cssContent,
	headerContent,
	onTimestampClick,
}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const createEnhancedHtmlContent = (): string => {
		if (!htmlContent) return "";
		let workingHtmlContent = htmlContent;
		let headContent = "";

		try {
			const hasBaseTag = /<base\s[^>]*href=/i.test(workingHtmlContent);
			const baseHref = typeof document !== "undefined" ? document.baseURI : "/";
			if (!hasBaseTag && baseHref) {
				headContent += `\n<base href="${baseHref}">\n`;
			}
		} catch {}

		if (cssContent) {
			headContent += `\n<style type="text/css">\n${cssContent}\n</style>\n`;
		}

		if (headerContent) {
			headContent += `${headerContent}\n`;
		}

		// Add script to handle timestamp link clicks
		const timestampScript = `
			<script>
				(function() {
					// Function to handle timestamp link clicks
					function handleTimestampClick(event) {
						const link = event.target.closest('.timestamp-link');
						if (!link) return;
						
						const time = link.getAttribute('data-time');
						if (time !== null) {
							event.preventDefault();
							// Send message to parent window
							window.parent.postMessage({
								type: 'TIMESTAMP_CLICK',
								seconds: parseFloat(time)
							}, '*');
						}
					}

					// Add click listeners when DOM is ready
					if (document.readyState === 'loading') {
						document.addEventListener('DOMContentLoaded', function() {
							document.addEventListener('click', handleTimestampClick, true);
						});
					} else {
						document.addEventListener('click', handleTimestampClick, true);
					}

					// Also handle dynamically added content
					const observer = new MutationObserver(function(mutations) {
						mutations.forEach(function(mutation) {
							mutation.addedNodes.forEach(function(node) {
								if (node.nodeType === 1) { // Element node
									if (node.classList && node.classList.contains('timestamp-link')) {
										node.addEventListener('click', handleTimestampClick);
									}
									// Check children
									const links = node.querySelectorAll && node.querySelectorAll('.timestamp-link');
									if (links) {
										links.forEach(function(link) {
											link.addEventListener('click', handleTimestampClick);
										});
									}
								}
							});
						});
					});

					observer.observe(document.body, {
						childList: true,
						subtree: true
					});
				})();
			</script>
		`;

		if (headContent || timestampScript) {
			const headRegex = /<head[^>]*>/i;
			const headMatch = workingHtmlContent.match(headRegex);
			if (headMatch) {
				const headEndIndex = headMatch.index! + headMatch[0].length;
				workingHtmlContent =
					workingHtmlContent.slice(0, headEndIndex) +
					headContent +
					timestampScript +
					workingHtmlContent.slice(headEndIndex);
			} else {
				const htmlRegex = /<html[^>]*>/i;
				const htmlMatch = workingHtmlContent.match(htmlRegex);
				if (htmlMatch) {
					const htmlEndIndex = htmlMatch.index! + htmlMatch[0].length;
					const headSection = `\n<head>${headContent}${timestampScript}</head>\n`;
					workingHtmlContent =
						workingHtmlContent.slice(0, htmlEndIndex) +
						headSection +
						workingHtmlContent.slice(htmlEndIndex);
				} else {
					workingHtmlContent = `<!DOCTYPE html>\n<html>\n<head>${headContent}${timestampScript}</head>\n<body>\n${workingHtmlContent}\n</body>\n</html>`;
				}
			}
		}

		return workingHtmlContent;
	};

	// Listen for messages from iframe
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data && event.data.type === "TIMESTAMP_CLICK" && event.data.seconds !== undefined) {
				if (onTimestampClick) {
					onTimestampClick(event.data.seconds);
				}
			}
		};

		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [onTimestampClick]);

	const enhancedHtmlContent = createEnhancedHtmlContent();
	// Allow scripts and same-origin for postMessage to work
	const sandboxAttrs = "allow-same-origin allow-scripts";

	return (
		<div className="w-full h-full overflow-auto">
			<iframe
				ref={iframeRef}
				className="border-0 bg-white w-full h-full"
				sandbox={sandboxAttrs}
				srcDoc={enhancedHtmlContent}
				title="Meeting Minutes"
			/>
		</div>
	);
};

export default MinutesHTMLViewer;

