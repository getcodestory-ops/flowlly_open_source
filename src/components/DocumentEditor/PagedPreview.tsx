import { useEffect, useRef, useState, useCallback } from "react";

interface PagedPreviewProps {
  content: string;
  className?: string;
}

const PagedPreview = ({ content, className = "" }: PagedPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const renderPaged = useCallback(async () => {
    if (!containerRef.current || !content) return;

    setIsRendering(true);

    try {
      // Dynamically import Paged.js (client-side only)
      const Paged = await import("pagedjs");
      const { Previewer } = Paged;

      // Clear previous content
      containerRef.current.innerHTML = "";

      // Create a wrapper for the content
      const contentWrapper = document.createElement("div");
      contentWrapper.innerHTML = content;
      contentWrapper.className = "paged-content-source";

      // Create the previewer instance
      const previewer = new Previewer();

      // Render the content with Paged.js
      const flow = await previewer.preview(
        contentWrapper,
        ["/paged-styles.css"], // We'll inject styles inline instead
        containerRef.current
      );

      setPageCount(flow.total || 0);
    } catch (error) {
      console.error("Paged.js rendering error:", error);
      // Fallback: show content without pagination
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="paged-fallback">${content}</div>`;
      }
    } finally {
      setIsRendering(false);
    }
  }, [content]);

  useEffect(() => {
    // Debounce the rendering to avoid too many re-renders
    const timeoutId = setTimeout(() => {
      renderPaged();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [renderPaged]);

  return (
    <div className={`paged-preview-container ${className}`}>
      {/* Paged.js CSS styles */}
      <style>{`
        /* Paged.js Preview Container */
        .paged-preview-container {
          background: #525659;
          min-height: 100%;
          padding: 40px 20px;
          overflow: auto;
        }

        /* Page styling */
        .pagedjs_pages {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .pagedjs_page {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-bottom: 20px;
          position: relative;
        }

        /* A4 Page Size */
        @page {
          size: A4;
          margin: 25mm 20mm;
        }

        /* Page margin boxes for headers/footers */
        .pagedjs_margin-top-center {
          font-size: 10pt;
          color: #666;
        }

        .pagedjs_margin-bottom-center {
          font-size: 10pt;
          color: #666;
        }

        /* Content styling inside pages */
        .pagedjs_page_content {
          font-family: "Times New Roman", Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #111;
        }

        .pagedjs_page_content h1 {
          font-size: 22pt;
          font-weight: bold;
          margin: 0 0 12pt 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .pagedjs_page_content h2 {
          font-size: 16pt;
          font-weight: bold;
          margin: 16pt 0 8pt 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .pagedjs_page_content h3 {
          font-size: 13pt;
          font-weight: bold;
          margin: 12pt 0 6pt 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .pagedjs_page_content p {
          margin: 0 0 8pt 0;
        }

        .pagedjs_page_content table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5pt;
          margin: 8pt 0;
        }

        .pagedjs_page_content th,
        .pagedjs_page_content td {
          border: 1px solid #ddd;
          padding: 6pt 8pt;
        }

        .pagedjs_page_content th {
          background: #f6f7f9;
          text-align: left;
          font-weight: 600;
        }

        .pagedjs_page_content img {
          max-width: 100%;
          height: auto;
        }

        .pagedjs_page_content ul,
        .pagedjs_page_content ol {
          margin: 8pt 0;
          padding-left: 20pt;
        }

        .pagedjs_page_content li {
          margin-bottom: 4pt;
        }

        /* Page break classes */
        .page-break {
          break-before: page;
        }

        .avoid-break {
          break-inside: avoid;
        }

        /* Loading state */
        .paged-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: white;
          font-size: 14px;
        }

        .paged-loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Fallback styling */
        .paged-fallback {
          background: white;
          max-width: 210mm;
          margin: 0 auto;
          padding: 25mm 20mm;
          min-height: 297mm;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Page count indicator */
        .page-count-indicator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          z-index: 100;
        }
      `}</style>

      {isRendering && (
        <div className="paged-loading">
          <div className="paged-loading-spinner" />
          Rendering pages...
        </div>
      )}

      <div
        ref={containerRef}
        className="paged-preview-content"
        style={{ display: isRendering ? "none" : "block" }}
      />

      {pageCount > 0 && !isRendering && (
        <div className="page-count-indicator">
          {pageCount} {pageCount === 1 ? "page" : "pages"}
        </div>
      )}
    </div>
  );
};

export default PagedPreview;
