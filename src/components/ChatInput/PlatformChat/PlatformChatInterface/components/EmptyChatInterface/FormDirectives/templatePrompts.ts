/**
 * Comprehensive prompt templates for AI-assisted HTML report template generation
 * This file contains detailed prompts with extensive examples, edge cases, and scope clarification
 */

export interface TemplatePromptParams {
  templateName: string;
  hasLogo: boolean;
  hasCover: boolean;
  primaryColor?: string;
  stylePreset: "modern" | "classic";
  additionalNotes?: string;
  baseHtmlTemplate: string;
}

export function generateTemplatePrompt(params: TemplatePromptParams): string {
	const {
		templateName,
		hasLogo,
		hasCover,
		primaryColor,
		stylePreset,
		additionalNotes,
		baseHtmlTemplate,
	} = params;

	return `
:::instructions
I am proividing you with a sample report. The goal is by understanding the style, layout and data in this report, you will be able to generate future reports for me and my team members.
For this you should write a complete prompt and knowledge file which can capture every element of the report and how to reconstruct the given report in detail.

The prompt should capture visual styling, layout, different report sections, formatting for the section, charts images, tables, paragraphs.
Important layout elements are:
-Cover page
(How its been created, what is the logo, what is the title, Is there date, Is there people mentioned such as author, reviewer, approver, etc.)
-Headers and footers (Does header has company logo, title, date etc.)

But really the core of this prompt is being able to understand how the report is built and how you should sequence the section writing. 
For example, Introduction/abstract section even though appears first in most reports, it should be written last since introduction/abstract requires understanding of the entire report.

The second sticky point is how and from where the data for each section is compiled, is it coming from excel files, other documents other softwares like procore, sharepoint or will be provided manually at the time of report generation.
For example dates most probably will depend on when the report is generated, provided user is not late in generating the report.
For safety section, safety data can come from different sources like incident tracking logs, safety officer's input, minutes of the safety meeting.
How this safety data should be compiled, is it a table, a chart or detailed paragraphs, what are the columns in the the table and so on. 
Also dont be lazy and ask user for where all the data is coming from, guide them to provide details for each section. They will need to think about this and provide the details.

The idea is the prompt to be fully detailed and comprehensive so even other team members who have no idea about the report can help you generate the report.
During this prompt generation, you should ask user for all these details which might not be obvious just by looking at the report, so you can capture it in the prompt.

You should think is this report will be generated occassionally or it may be a recurring report like monthly progress report. 
Then do you need previous monthly report to see what changed? If it an occassional report then what are the cases when you might need to generate the report.

Understanding each and every aspect of the report is really the key to a successful prompt.
Think about the images in the report as well, are the progress photos, or logos, what is their origin and where are they coming from.

Also understand the scope of the report, would user want to send similar report to different clients or different projects.
Then for those should the company logo be different for each client or project. OR the template user wants to generate is for a sinle client or a single project, then logos and names could remain same. 

Expand on this theme of understanding the report and its requirements.

So talk to me if any of these aspects are not clear, also show me colors and fonts to double confirm everything using svgs or html elements, so we can make a really robust resusable prompt.



${additionalNotes ? `ADDITIONAL REQUIREMENTS: ${additionalNotes}` : ""}

Based on these paged.js guidelines also write a sample document which you can modify easily to generate the report, so you wont have to start from scratch everytime.
Paged.js Document Implementation for Flowlly

This guide contains the essential implementation details for using Paged.js to create reports or documents. It is designed for Flowlly Platform to have the necessary information to generate paginated documents from HTML and CSS.


Using Paged.js as a polyfill in web browsers

Getting the script:
Local script inclusion:
<script src="js/paged.polyfill.js"></script>
CDN script inclusion:
<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
CSS Rules and HTML Structure
When showing the document not in print preview, adding gray background and margin at the bottom let user see the pagejs implementation. Always keep this style for better user experience
Preview interface CSS (Always add this so when displaying the document without print screen , user can see pagedjs implementation). Define pagedjs_pages and page class style on top of the style and do not add any pagedjs_page class implementation inside @page
body { background-color: #EEE; } This is important to create a contrast between the background and actual page.
pagedjs is automatically injected for visually displaying pages, we should add this style make sure pages are in center and visually distinct from rest of the body.
.pagedjs_pages { display: flex; flex-direction: column; align-items: center; width: 100%; } center pages so they are not lined to the side.
.pagedjs_page { background: white; box-shadow: 0 0 10px rgba(0,0,0,0.2); margin-bottom: 20px; }
adding margin will show user that pages are separated from one another.
Every class implementation should be added only once wether preview or print, do not override styles at different places.



Add all your media query using @media print query:
@media print {
/ All your print styles go here /
}
@page class is automatically injected by paged.js they should be respected, do not add .page or any other classes that might complict with @page.
@page rule - Page size property defines the size of the page to use, this is must for presentations you can use landscape orientation. This is the only place where you should define page sizes, trying to add height and width to anywhere else in html may lead to bleed the content beyond page size. Let paged js handle the rest.

Do not add document specific sizes or anything else, @page is the only place to define page size.
/ Define a custom page size /
@page {
size: 140mm 200mm;
}
/ Use A5 paper /
@page {
size: A5;
}/ Use A4 paper in landscape orientation /
@page {
size: A4 landscape;
}
Available Page Size Keywords: A0, A1, A2, A3, A4, A5, A6, A7, A10, B4, B5, letter, legal, ledger.
CSS variables for page dimensions:
var(--pagedjs-pagebox-width)
var(--pagedjs-pagebox-height)
Margin are essential to ensure not only reports look good but also to ensure that content does not get cut off during printing. 
By default use 20mm unless otherwise explicitly provided.
Do not use any width height padding margin for pages, it will create conflicts with @page rule.



Margin size property: define margin @page , do not add padding etc.
/ All margins are 20mm /
@page {
margin: 20mm;
}
/ Top and bottom margins are 3in, left and right margins are 4in /
@page {
margin: 3in 4in;
}/ All margins are different /
@page {
margin-top: 20mm;
margin-bottom: 25mm;
margin-left: 10mm;
margin-right: 35mm;
}Different margin for different pages

Facing pages / recto/verso:
@page:left {
margin-left: 25mm;
margin-right: 10mm;
}@page:right {
margin-left: 10mm;
margin-right: 25mm;
}Page breaks are essential to ensure that new sections starts on a new page.



Page breaks:
.chapter {
break-before: right; / or page, left, recto, verso /
}h2 {
break-before: page;
}

break-after properties work similarly.
Pseudo class selectors for pages: :first, nth(N) (e.g., @page:nth(3)), :blank
Bleeds:
@page {
bleed: 6mm;
}

Crop and cross marks:

@page {
marks: crop cross;
}
Generated Content - content property:
.note::before {
content: "Note: ";
}/ from data- attribute /
/ HTML: <p class="ref" data-ref-id="0215"></p> /
p.ref::before {
content: "Reference " attr(data-ref-id) ": ";
}

Generated counters:
body {
counter-reset: figureNumber;
}
figcaption {
counter-increment: figureNumber;
}
figcaption::before {
content: counter(figureNumber);
}

Generated images:
.glossary::after {
content: " " url("/images/glossary-icon.png");
}

Generated links (showing href):
a::after {
content: " (" attr(href) ")";
}
Headers and footers can be added using margin boxes

Margin boxes - CSS Selectors:@top-left-corner, @top-left, @top-center, @top-right, @top-right-corner, @left-top, @left-middle, @left-bottom, @right-top, @right-middle, @right-bottom, @bottom-left-corner, @bottom-left, @bottom-center, @bottom-right, @bottom-right-corner.



Adding content to margin box:
@page: right {
@top-right {
content: "My title";
}
}
You can add page counters alike this

Page Counter:
@page {
@bottom-left {
content: counter(page);
/ or /
content: "Page " counter(page) " of " counter(pages);
}
}

Named String (Running Headers/Footers):
h2 {
string-set: title content(text);
}@page {
@bottom-center {
content: string(title);
}
}/* Rule specifically for the cover page, you can use to hide headers and footers /
@page cover {
/ This is the key: it overrides the @bottom-right rule from the general @page style /
@bottom-right {
content: none;
}
}

Running elements (position: running() and element()):
/ HTML: <p class="title">My Title</p> /.title {
position: running(titleRunning);
}@page {
@top-center {
content: element(titleRunning);
}
}

Delete generated content in blank page:

@page: blank {
@top-left {
content: none;
}
}
Named Pages:

.frontmatter {
page: frontmatterLayout;
}@page frontmatterLayout {
/ specifics rules for the frontmatter/
}/* Trick for blank named pages: /
.pagedjs_chapter_page + .pagedjs_blank_page {
/ specific rules for blank pages of named page called "chapter" /
}

Cross-references:
target-counter():
/ HTML: <a class="link" href="#figure-3">figure 3</a> /
.link::after {
content: ", page " target-counter(attr(href url), page);
}



target-text():
/ HTML: <h1 id="chapter-1">Chapter 1</h1> <a class="link" href="#chapter-1">chapter</a> /
.link::after {
content: "(see " target-text(attr(href url)) ")";
}





HTML Body
Keep body flat: use only h1/h2/h3, p, ul/ol/li, img, hr, and .table (table/thead/tbody/tr/th/td).
No nested containers.
No inline styles or scripts in body. Only class names are allowed. All CSS/JS must be in <head>.
Add page-beak before new section, since we are building flat structure we can add page-break in h1 for new section heading.
Display : Any content that is added to the body content to be part of header or footer must be set to display as hidden so it does not show up in body and does not create empty pages.



<body>
<div class="cover">
<h1>Report Title</h1>
<h2>Subtitle</h2>
<p>Date</p>
</div>
<h1 class="page-break">Executive Summary</h1>
<p>Brief summary...</p>
<h2 class="page-break">Section One</h2>
<p>Content...</p>
<h2 class="page-break">Section Two</h2>
<p>Content...</p>
</body


Here is bare minimum template with a covee, do you need cover or you are writing a letter or notice or memo, think about that.
<!doctype html>\n<html>\n<head>\n <meta charset="utf-8"/>\n <meta name="viewport" content="width=device-width, initial-scale=1"/>\n <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>\n <style>\n /* Paged.js preview styles, Flowlly - important to keep for the user to see the preview page layout */\n body { background-color: #EEE; }\n .pagedjs_pages { display: flex; flex-direction: column; align-items: center; width: 100%; }\n .pagedjs_page { background: white; box-shadow: 0 0 10px rgba(0,0,0,0.2); margin-bottom: 20px; }\n /* Basic A4 preset + minimal classes. Flowlly - Expand full styling as required. */\n @page {\n size: A4;\n margin: 20mm 18mm 24mm 18mm;\n /* Example running footer with page numbers (Paged.js) */\n @bottom-right { content: 'Page ' counter(page) ' of ' counter(pages); font-size: 9pt; color: #64748b; }\n }\n :root { --brand: #3b82f6; --text: #0f172a; --muted: #64748b; }\n body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; color: var(--text); line-height: 1.5; font-size: 11pt; }\n h1 { font-size: 24pt; font-weight: 700; color: var(--brand); margin: 0 0 6pt 0; }\n h2 { font-size: 18pt; font-weight: 600; color: var(--brand); margin: 16pt 0 6pt 0; }\n h3 { font-size: 14pt; font-weight: 600; color: var(--brand); margin: 12pt 0 6pt 0; }\n p { margin: 0 0 8pt 0; }\n .cover { page: cover; display: grid; place-items: center; height: 100vh; text-align: center; }\n .content-start { break-before: page; }\n .table { width: 100%; border-collapse: collapse; font-size: 10pt; }\n .table th, .table td { border: 1px solid #e2e8f0; padding: 6pt; }\n </style>\n</head>\n<body>\n <!-- TEMPLATE NOTES: -->\n <!-- 1) Keep body flat: use only h1/h2/h3, p, ul/ol/li, img, hr, and .table (table/thead/tbody/tr/th/td). No nested containers. -->\n <!-- 2) No inline styles or scripts in body. Only class names are allowed. All CSS/JS must be in <head>. -->\n <!-- 3) Add a comment block describing each section's data source, inputs, and mapping before finalizing. -->\n <div class="cover">\n <!-- The agent will reconstruct this cover based on the provided example and brand assets -->\n <h1>Report Title</h1>\n <h2>Subtitle</h2>\n <p>Date</p>\n </div>\n <div class="content-start"></div>\n <!-- IMPORTANT: Keep content flat. Do not nest divs inside divs. Use headings, paragraphs, lists, and tables. -->\n <h1 class="page-break">Executive Summary</h1>\n <p>Brief summary...</p>\n <h2 class="page-break">Section One</h2>\n <p>Content...</p>\n <h2 class="page-break">Section Two</h2>\n <p>Content...</p>\n</body>\n</html>

Debug guide:
1. Error: Applying a Multi-Page Mindset to a Single-Page Document
What I did wrong: I initially approached the task as if it were a complex, multi-page report. I used advanced Paged.js features like page: cover, break-before: page, and running headers/footers (position: running()).
Problem it caused: This was the primary source of the extra pages. The break-before: page rule forced a blank page at the beginning, and the page: cover created another separate page. This complex setup was completely unnecessary and led to a disorganized, multi-page output for a single-page document.
How I corrected it: I removed all of those advanced features. I eliminated the cover page-specific class, all page-break rules, and the running header logic. The final version has a simple, linear HTML structure where the content just flows from top to bottom, which is all that was needed.
2. Error: Conflicting Page Dimension Styles (The "Bleeding" Content)
What I did wrong: In an attempt to make the live preview in the browser look exactly like a printed A4 page (not required, since pagedjs already takes care of that), I added width and padding properties to the main content container (.document-container).
Problem it caused: These styles directly conflicted with the @page { size: A4; margin: 20mm; } rule. While @page tells the printer how to format the page, my other CSS rules were telling the content inside the page to behave differently. This conflict is what caused the content to exceed the print area and get cut off, or "bleed" off the right side of the page.
How I corrected it: You guided me to the correct solution: the @page rule must be the single source of truth for layout. I removed all width, min-height, and padding from the container styles. This allows the content to flow naturally within the boundaries defined only by the @page rule, resolving the bleeding issue entirely.
3. Error: Incorrect Image Handling
What I did wrong: Initially, I tried to link the logo using a relative path (src="FirstLight logo.png") which doesn't work in this environment. My next attempt was to use a complex Base64 encoding scheme, which also failed.
Problem it caused: The logo was showing up as a broken image icon.
How I corrected it: The best and simplest solution, which you suggested, was to use the get_project_document_url tool to get a permanent, stable URL for the logo. Using this direct URL in the <img> tag ensures the image is always found and rendered correctly.
How I Will Avoid These Mistakes in the Future
Clarify the Scope First: Before writing any code, the first question I will ask is: "Is this a single-page document or a multi-page report?" The answer will fundamentally change my entire approach and prevent the use of unnecessary page-breaking logic.

Respect the Single Source of Truth: I now understand that for any document using Paged.js, the @page rule is the only place to define page size and margins. I will not add conflicting layout styles to other CSS classes. I will keep the styling of content separate from the layout of the page itself.

Always Use Stable URLs for Assets: For any external resources like images, I will immediately use the get_project_document_url tool to ensure a reliable link, avoiding broken assets from the start.
Once you have generate the prompt and template file, ask user to review and approve the prompt and template file.

Problem: The Template Was Too Plain

Your Feedback: You noted that the first HTML template was too basic and didn't resemble the professional look of the sample report.
Correction: I created a much more detailed second version that incorporated the cover image, brand colors, custom fonts, and a layout with headers and footers that mirrored the original report.
Problem: Blank First Page and Duplicated Cover Image

Your Feedback: You identified that the improved template was generating a blank page after the cover and that the cover image was sometimes reappearing on a third page.
My Mistake: This was caused by an incorrect page-breaking strategy. I was using break-after: page on the cover page itself, which told the browser to create the cover and then force a new page, which resulted in the blank page. This also confused the rendering engine, causing the duplicated cover.
Correction: The solution was to remove the page break from the cover element. Instead, I applied a break-before: page style to the very first content element after the cover (the "Executive Summary" heading). This ensures the cover is rendered on its own, and the next page starts cleanly with the first section, resolving both the blank page and the duplication issue.
Problem: Header Text Was Cut Off

Your Feedback: You pointed out that the address in the top-right of the header was cramped and getting cut off.
My Mistake: The CSS for the header's right margin box (@top-right) was aligning the text to the right but had no padding, causing it to sit flush against the page margin.
Correction: I added padding to the right side of the header's text, which provided the necessary space and corrected the alignment issue.

When approved use create_report_template tool to create the report template. This prompt is written by system admin, the user does not have expertiese in css, html, js, pagedjs, or internal tools so when interactive with them spare the technical details and keep your response style simple and easy to understand.
:::`;
}

export function generateAttachmentsSection(
	referenceReports: Array<{id: string; name: string}>,
	logoImages: Array<{id: string; name: string}>,
	coverImages: Array<{id: string; name: string}>,
	additionalRefs: Array<{id: string; name: string}>,
): string {
	const formatAttachments = (docs: Array<{id: string; name: string}>, label: string): string => {
		return docs.map((d) => 
			`**${label}:** ${d.name}\n::attachments[[${JSON.stringify({ uuid: d.id, name: d.name })}]]`,
		).join("\n");
	};

	let attachmentSection = "";
  
	if (referenceReports.length > 0) {
		attachmentSection += formatAttachments(referenceReports, "Reference Report") + "\n\n";
	}
  
	if (logoImages.length > 0) {
		attachmentSection += formatAttachments(logoImages, "Logo Image") + "\n\n";
	}
  
	if (coverImages.length > 0) {
		attachmentSection += formatAttachments(coverImages, "Cover Image") + "\n\n";
	}
  
	if (additionalRefs.length > 0) {
		attachmentSection += formatAttachments(additionalRefs, "Additional Reference") + "\n\n";
	}

	return attachmentSection;
}
