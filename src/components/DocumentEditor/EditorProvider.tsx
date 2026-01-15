import { type Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
	PAGE_SIZES,
	PAGE_MARGINS,
	getPageContentHeight,
	isPagedView,
	type PageSizeType,
	type ZoomLevel,
	DEFAULT_ZOOM,
} from "./extensions/PageSizeConfig";

// Re-export for backwards compatibility
export { PAGE_SIZES, type PageSizeType } from "./extensions/PageSizeConfig";

interface EditorProviderProps {
    editor: Editor;
    pageSize?: PageSizeType;
    zoom?: ZoomLevel;
}

const EditorProvider = ({ editor, pageSize = "a4", zoom = DEFAULT_ZOOM }: EditorProviderProps ) : React.ReactNode => {
	const pagedView = isPagedView(pageSize);
	const contentRef = useRef<HTMLDivElement>(null);
	const [pageCount, setPageCount] = useState(1);

	// Get current page dimensions
	const currentPageSize = PAGE_SIZES[pageSize];
	const pageContentHeight = useMemo(() => 
		getPageContentHeight(pageSize),
		[pageSize]
	);
	
	// Calculate zoom scale factor
	const zoomScale = zoom / 100;

	// Calculate page count based on actual content height
	const updatePageCount = useCallback(() => {
		if (!contentRef.current || !pagedView) return;
		
		// Get the actual ProseMirror content element
		const proseMirror = contentRef.current.querySelector(".ProseMirror");
		if (!proseMirror) return;
		
		// Measure actual content height (not including wrapper padding)
		const contentHeight = proseMirror.scrollHeight;
		const pages = Math.max(1, Math.ceil(contentHeight / pageContentHeight));
		setPageCount(pages);
	}, [pagedView, pageContentHeight]);

	// Monitor content changes
	useEffect(() => {
		if (!pagedView) return;

		const resizeObserver = new ResizeObserver(() => {
			updatePageCount();
		});

		if (contentRef.current) {
			resizeObserver.observe(contentRef.current);
		}

		// Also listen to editor updates
		const handleUpdate = () => {
			setTimeout(updatePageCount, 50);
		};
		editor.on("update", handleUpdate);

		return () => {
			resizeObserver.disconnect();
			editor.off("update", handleUpdate);
		};
	}, [editor, pagedView, updatePageCount]);

	// Non-paged view (original)
	if (!pagedView) {
		return (
			<div className="flex-grow bg-gray-50 overflow-auto rounded-b-lg border w-full" style={{ maxHeight: "calc(100% - 40px)" }}>
				<div className="px-10 py-6 w-[768px] mx-auto bg-white my-0 border-l border-r border-gray-200">
					<EditorContent
						className="
							text-sm font-arial leading-normal
							prose-hr:my-4
							prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:ml-[-10px] prose-h1:mb-6
							prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-7 prose-h2:ml-[-8px] prose-h2:mb-5
							prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:ml-[-6px] prose-h3:mb-4
							prose-h4:text-lg prose-h4:font-bold prose-h4:mt-5 prose-h4:ml-[-4px] prose-h4:mb-3
							prose-ul:list-disc prose-ol:list-decimal prose-li:text-sm prose-li:ml-5 prose-li:mb-2 prose-li:mt-4
							prose-p:leading-normal 
							prose-strong:font-semibold
							prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:cursor-pointer prose-img:transition-all prose-img:duration-200 hover:prose-img:shadow-lg
							prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
							prose-table:border-collapse prose-table:w-full prose-table:text-xs prose-table:p-2 prose-table:ml-4 prose-table:mb-8 prose-table:mt-4 prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden
							prose-th:bg-gray-50 prose-th:text-left prose-th:font-medium prose-th:border prose-th:border-gray-200 prose-th:font-bold prose-th:p-3
							prose-td:border prose-td:border-gray-200 prose-td:p-3 hover:prose-td:bg-gray-50 prose-td:transition-colors
							[&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-blue-500 [&_.ProseMirror-selectednode]:ring-opacity-50
							[&_table]:border-separate [&_table]:border-spacing-0
							[&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-blue-500 [&_img.ProseMirror-selectednode]:ring-opacity-50
							[&_img]:max-w-full [&_img]:height-auto [&_img]:display-block
						"
						editor={editor}
					/>
				</div>
			</div>
		);
	}

	// Paged view - A4 style pages
	return (
		<div 
			className="flex-grow overflow-auto rounded-b-lg border w-full bg-gray-50"
			style={{ 
				maxHeight: "calc(100% - 40px)",
				padding: "40px 20px",
			}}
		>
			{/* Page count indicator */}
			<div className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs z-50">
				{pageCount} {pageCount === 1 ? "page" : "pages"} • {zoom}%
			</div>

			{/* Zoom wrapper - centers and scales the page */}
			<div 
				style={{
					transform: `scale(${zoomScale})`,
					transformOrigin: "top center",
					marginBottom: `${(zoomScale - 1) * currentPageSize.height}px`,
				}}
			>
				{/* Single page container with white background */}
				<div 
					ref={contentRef}
					className="mx-auto bg-white relative"
					style={{ 
						width: currentPageSize.width,
						minHeight: currentPageSize.height,
						paddingTop: PAGE_MARGINS.top,
						paddingBottom: PAGE_MARGINS.bottom,
						paddingLeft: PAGE_MARGINS.left,
						paddingRight: PAGE_MARGINS.right,
						boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
					}}
				>
				{/* Page break indicators */}
				{pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, index) => (
					<div
						key={index}
						className="absolute left-0 right-0 pointer-events-none"
						style={{
							top: (index + 1) * currentPageSize.height - PAGE_MARGINS.top,
							height: 0,
							borderTop: "2px dashed #cbd5e1",
							zIndex: 10,
						}}
					>
						{/* Page break label */}
						<div 
							className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded"
						>
							Page {index + 1} / {index + 2}
						</div>
					</div>
				))}

				{/* Page number at bottom */}
				<div 
					className="absolute text-xs text-gray-400 pointer-events-none"
					style={{
						bottom: PAGE_MARGINS.bottom / 2 - 8,
						left: "50%",
						transform: "translateX(-50%)",
					}}
				>
					{pageCount} {pageCount === 1 ? "page" : "pages"}
				</div>
					<EditorContent
						className="
							text-sm font-arial leading-normal
							prose-hr:my-4
							prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:ml-[-10px] prose-h1:mb-6
							prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-7 prose-h2:ml-[-8px] prose-h2:mb-5
							prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:ml-[-6px] prose-h3:mb-4
							prose-h4:text-lg prose-h4:font-bold prose-h4:mt-5 prose-h4:ml-[-4px] prose-h4:mb-3
							prose-ul:list-disc prose-ol:list-decimal prose-li:text-sm prose-li:ml-5 prose-li:mb-2 prose-li:mt-4
							prose-p:leading-normal 
							prose-strong:font-semibold
							prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:cursor-pointer prose-img:transition-all prose-img:duration-200 hover:prose-img:shadow-lg
							prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
							prose-table:border-collapse prose-table:w-full prose-table:text-xs prose-table:p-2 prose-table:ml-4 prose-table:mb-8 prose-table:mt-4 prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden
							prose-th:bg-gray-50 prose-th:text-left prose-th:font-medium prose-th:border prose-th:border-gray-200 prose-th:font-bold prose-th:p-3
							prose-td:border prose-td:border-gray-200 prose-td:p-3 hover:prose-td:bg-gray-50 prose-td:transition-colors
							[&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-blue-500 [&_.ProseMirror-selectednode]:ring-opacity-50
							[&_table]:border-separate [&_table]:border-spacing-0
							[&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-blue-500 [&_img.ProseMirror-selectednode]:ring-opacity-50
							[&_img]:max-w-full [&_img]:height-auto [&_img]:display-block
							[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]
						"
						editor={editor}
					/>
				</div>
			</div>
		</div>
	);
};

export default EditorProvider;
