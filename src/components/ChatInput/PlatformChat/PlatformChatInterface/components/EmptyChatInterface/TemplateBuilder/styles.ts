// Shared CSS presets and header includes for Template Builder

export const CLASSIC_A4_CSS = `
/* Classic A4 Report */
@page {
	size: A4;
	margin: 25mm;
	@top-left { 
		content: var(--top-left-content, ""); 
		font-size: 10pt; 
		width: 120px; 
		height: 25px; 
		object-fit: contain;
	}
	@top-right { content: string(section); font-size: 10pt; }
	@bottom-center { content: counter(page) " / " counter(pages); font-size: 10pt; }
}

@page cover {
	@top-left-corner { content: none; }
	@top-left { content: none; }
	@top-center { content: none; }
	@top-right { content: none; }
	@top-right-corner { content: none; }
	@left-top { content: none; }
	@left-middle { content: none; }
	@left-bottom { content: none; }
	@right-top { content: none; }
	@right-middle { content: none; }
	@right-bottom { content: none; }
	@bottom-left-corner { content: none; }
	@bottom-left { content: none; }
	@bottom-center { content: none; }
	@bottom-right { content: none; }
	@bottom-right-corner { content: none; }
}
:root { 
	--text: var(--custom-text, #111); 
	--muted: var(--custom-muted, #555); 
	--brand: var(--custom-brand, #225adb); 
	--border: var(--custom-border, #ddd);
	--header-bg: var(--custom-header-bg, transparent);
}
body { 
	font-family: "Times New Roman", Times, serif; 
	color: var(--text); 
	line-height: 1.35; 
	font-size: 11pt; 
	background-color: #EEE;
}
.pagedjs_pages {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}
.pagedjs_page {
	background: white;
	box-shadow: 0 0 10px rgba(0,0,0,0.2);
	margin-bottom: 20px;
}
h1, h2, h3 { margin: 0 0 6pt 0; line-height: 1.2; color: var(--brand); }
h1 { font-size: 22pt; }
h2 { font-size: 16pt; margin-top: 16pt; }
h3 { font-size: 13pt; margin-top: 12pt; }
p { margin: 0 0 8pt 0; }
h1, h2 { string-set: section content(text); }
.page-break { break-before: page; }
.enhanced-response { background: #f9f9f9; padding: 12pt; border-left: 4pt solid var(--brand); margin: 8pt 0; }
.cover { page: cover; display: grid; place-items: center; height: 100vh; text-align: center; }
.cover[style*="position: relative"] { display: block; text-align: left; }
.cover-element { position: absolute; }
.cover-text { display: flex; align-items: center; padding: 4px; box-sizing: border-box; word-wrap: break-word; overflow: hidden; }
.cover-image { display: block; }
.header-logo { max-height: 40px; width: auto; margin-right: 12pt; }
.header-section { background: var(--header-bg); padding: 8pt; margin-bottom: 12pt; display: flex; align-items: center; }
.content-start { break-before: page; }
`;

export const MODERN_A4_CSS = `
/* Modern A4 Report */
@page {
	size: A4;
	margin: 20mm 18mm 24mm 18mm;
	@top-left { 
		content: var(--top-left-content, ""); 
		font-size: 9pt; 
		color: #64748b; 
		width: 100px; 
		height: 20px; 
		object-fit: contain;
	}
	@bottom-center { content: counter(page); font-size: 9pt; color: #64748b; }
}

@page cover {
	@top-left-corner { content: none; }
	@top-left { content: none; }
	@top-center { content: none; }
	@top-right { content: none; }
	@top-right-corner { content: none; }
	@left-top { content: none; }
	@left-middle { content: none; }
	@left-bottom { content: none; }
	@right-top { content: none; }
	@right-middle { content: none; }
	@right-bottom { content: none; }
	@bottom-left-corner { content: none; }
	@bottom-left { content: none; }
	@bottom-center { content: none; }
	@bottom-right { content: none; }
	@bottom-right-corner { content: none; }
}
:root { 
	--text: var(--custom-text, #0f172a); 
	--muted: var(--custom-muted, #64748b); 
	--brand: var(--custom-brand, #3b82f6); 
	--border: var(--custom-border, #e2e8f0);
	--header-bg: var(--custom-header-bg, #f8fafc);
}
body { 
	font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; 
	color: var(--text); 
	line-height: 1.5; 
	font-size: 11pt; 
	background-color: #EEE;
}
.pagedjs_pages {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}
.pagedjs_page {
	background: white;
	box-shadow: 0 0 10px rgba(0,0,0,0.2);
	margin-bottom: 20px;
}
h1 { font-size: 24pt; font-weight: 700; color: var(--brand); }
h2 { font-size: 18pt; margin-top: 18pt; font-weight: 600; color: var(--brand); }
h3 { font-size: 14pt; margin-top: 12pt; font-weight: 600; color: var(--brand); }
p { margin: 0 0 10pt 0; }
.page-break { break-before: page; }
.enhanced-response { background: #f8fafc; padding: 14pt; border: 1px solid var(--border); border-radius: 6pt; margin: 10pt 0; }
.cover { page: cover; display: grid; place-items: center; height: 100vh; text-align: center; }
.cover[style*="position: relative"] { display: block; text-align: left; }
.cover-element { position: absolute; }
.cover-text { display: flex; align-items: center; padding: 4px; box-sizing: border-box; word-wrap: break-word; overflow: hidden; }
.cover-image { display: block; }
.header-logo { max-height: 40px; width: auto; margin-right: 12pt; }
.header-section { background: var(--header-bg); padding: 12pt; margin-bottom: 16pt; display: flex; align-items: center; border-bottom: 2px solid var(--brand); }
.content-start { break-before: page; }
`;

export const headerBase = `
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
`;


