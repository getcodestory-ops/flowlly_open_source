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

	return `Design a comprehensive, reusable HTML report template from the attached existing report(s).

:::instructions

Follow these instructions to create a production-ready HTML template named "${templateName}" that serves as a complete blueprint for generating future reports for you. 
When provided with this template, you will be able to guide user to provide the required data for the report and generate the report for the user in company's style and branding.
This template must capture not just the visual styling but the entire data architecture, business logic, and operational context needed for successful report replication.

1. First, examine the attached existing report(s).

Understand the complete scope of the report requirements, ask user for clarifications. For example you can ask about:

1) REPLICATION SCOPE:
   - Is this the same report type for different time periods? (e.g., Monthly Safety Report July → August)
   - Is this a template for the same company but different projects? (e.g., RFP Template for Project A → Project B)
   - Is this for the same project type but different companies/clients? (e.g., Construction Progress Report Template)
   - Is this a one-time template or recurring automated report generation?

2) AUTHORIZATION & SIGNATURES:
   - Does the cover page have authorized signatures? Will the same people always sign?
   - Are there approval workflows that change based on project/client/time period?
   - Do signature blocks need to be dynamic or static placeholders?
   - Are there different authorization levels for different report sections?

3) VARIABLE VS STATIC CONTENT:
   - Which elements remain exactly the same across all future reports? (company branding, standard disclaimers, regulatory text)
   - Which elements change with each report instance? (dates, project names, data tables, charts)
   - Which elements are conditional? (sections that appear only under certain conditions)
   - Are there seasonal/periodic variations? (quarterly vs monthly sections)

4) DATA DEPENDENCIES:
   - What external systems feed into this report? (Procore, SharePoint, ERP systems, manual Excel files)
   - Are there data validation requirements or business rules?
   - What happens when expected data is missing or incomplete?
   - Are there data retention/archival requirements affecting template structure?

Be thorough in understanding the report, its content, formatting and data dependencies.

COMPREHENSIVE ANALYSIS STEPS:

1) VISUAL IDENTITY FORENSICS:
   - Extract exact color codes, font families, font sizes, and spacing measurements
   - Document header/footer layouts, logo placement rules, and brand guidelines compliance
   - Identify page margins, column layouts, and white space patterns
   - Note any watermarks, background patterns, or security elements

2) STRUCTURAL MAPPING:
   - Create a complete section inventory with hierarchical relationships
   - Document page break rules and pagination logic
   - Identify repeating patterns (e.g., weekly summaries in monthly reports)
   - Map conditional sections and their trigger conditions

3) CONTENT ARCHITECTURE:
   - For each text block: Is it static boilerplate, dynamic data, or user-customizable?
   - For each table: Document exact column headers, data types, sorting rules, and calculation formulas
   - For each chart/graph: Identify data sources, chart types, styling, and update frequencies
   - For each image placeholder: Document size requirements, file formats, and sourcing methods

4) DATA SOURCE MAPPING:
   ${hasLogo ? "- Logo Integration: How should the provided logo be sized, positioned, and used across different sections?" : ""}
   ${hasCover ? "- Cover Image Usage: Should the cover image be background, overlay, or standalone? Any seasonal variations?" : ""}
   - Excel/CSV Integration: What are the exact column names, data formats, and validation rules?
   - API Integration: Which third-party systems (Procore, Microsoft Graph, SharePoint) provide data?
   - Manual Input Requirements: What information must users provide each time?
   - File Attachments: How are supporting documents (photos, PDFs, certificates) incorporated?

DETAILED EDGE CASES & EXAMPLES:

MONTHLY REPORTS:
- "This July Safety Report becomes August Safety Report"
- Data sources: Incident tracking system exports, training completion records, inspection photos
- Variables: Month name, incident counts, training statistics, new safety photos
- Static: Company policies, regulatory requirements, contact information
- Edge cases: Months with no incidents, incomplete training data, missing inspection photos

RFP TEMPLATES:
- "Construction RFP for Hospital Project becomes RFP for School Project"
- Data sources: Project specifications, vendor databases, cost estimation tools
- Variables: Project scope, location, timeline, technical requirements, budget ranges
- Static: Company qualifications, standard terms, submission requirements
- Edge cases: Multi-phase projects, international projects, emergency/fast-track projects

INSPECTION REPORTS:
- "Building Inspection Report Template for different properties"
- Data sources: Inspection checklists, photo documentation, compliance databases
- Variables: Property details, inspection findings, photos, compliance status
- Static: Inspection criteria, regulatory standards, inspector credentials
- Edge cases: Failed inspections, partial inspections, re-inspection requirements

PROJECT STATUS REPORTS:
- "Weekly Construction Progress for Project A becomes Project B"
- Data sources: Project management software, time tracking, budget systems, progress photos
- Variables: Project milestones, budget status, team assignments, progress images
- Static: Reporting format, KPI definitions, escalation procedures
- Edge cases: Project delays, budget overruns, scope changes, weather impacts

TECHNICAL CONSTRAINTS (Critical for Editor Compatibility):

DOM STRUCTURE RULES:
- FLAT HIERARCHY ONLY: No nested containers (div > div). Use semantic HTML: h1/h2/h3, p, ul/ol/li, img, hr, table/thead/tbody/tr/th/td
- NO INLINE STYLES: Our editor strips all inline styles. Only class names survive. Put ALL CSS in <head>
- NO BODY SCRIPTS: JavaScript must be in <head> only. Body scripts are removed by our editor
- PAGED.JS INTEGRATION: Include Paged.js polyfill for pagination and print preview in the <head>

STYLING ARCHITECTURE:
- Use CSS custom properties (--variables) for brand colors, fonts, and spacing
- Implement @page rules for headers, footers, and page numbering
- Create responsive classes that work in both screen and print media
- Design for A4/Letter paper with proper margins and bleed areas

BRANDING IMPLEMENTATION:
- Header/Footer Consistency: Reproduce exact brand elements, color bars, typography
- Logo Integration: Proper sizing, positioning, and quality across different sections
- Color Palette: Extract and implement complete brand color system
- Typography Hierarchy: Match font families, sizes, weights, and line spacing

DATA INTEGRATION EXAMPLES:

EXCEL/CSV DATA MAPPING:
Example: Safety Report with incident data
- Input: safety_incidents.csv with columns [Date, Type, Severity, Description, Status]
- Processing: Group by month, calculate incident rates, sort by severity
- Output: Populate incident summary table and trend charts
- Edge case: Handle missing dates, unknown incident types, incomplete descriptions

API DATA INTEGRATION:
Example: Procore project data
- Input: Procore API endpoints for project status, budget, schedule
- Processing: Aggregate costs, calculate completion percentages, format dates
- Output: Project dashboard with KPIs and status indicators
- Edge case: API timeouts, missing permissions, data synchronization delays

MANUAL INPUT REQUIREMENTS:
Example: Executive summary and recommendations
- Input: User-provided text for summary, key findings, recommendations
- Processing: Format according to brand guidelines, apply proper styling
- Output: Professionally formatted executive summary section
- Edge case: Overly long text, missing required sections, formatting inconsistencies

IMAGE/MEDIA HANDLING:
Example: Inspection photos and videos
- Input: Photo files from mobile devices, drone footage, document scans
- Processing: Resize for web/print, add captions, organize by inspection area
- Output: Properly formatted photo galleries with consistent styling
- Edge case: Large file sizes, unsupported formats, missing metadata

FOLLOW-UP QUESTION TEMPLATES:

For unclear data sources:
"I see a [SECTION NAME] with [SPECIFIC ELEMENT]. How is this data generated? Options:
- Will you upload Excel/CSV files each time? What are the exact column headers?
- Should we connect to [SYSTEM NAME] API? What data points do we need?
- Is this manually entered text? What are the typical length and format requirements?
- Are there approval workflows or data validation rules we should implement?"

For authorization elements:
"I notice signature blocks/authorization sections. Please clarify:
- Do the same people always sign, or does this vary by project/time period?
- Are these digital signatures, scanned images, or text placeholders?
- Are there different authorization levels for different sections?
- Should we include approval dates, titles, or other metadata?"

For conditional content:
"I see sections that might be conditional. Please specify:
- Under what conditions does [SECTION] appear or disappear?
- Are there different versions for different project types/clients/seasons?
- How should we handle missing or incomplete data for optional sections?
- Are there regulatory requirements that affect section inclusion?"

For recurring vs one-time usage:
"To optimize the template design:
- How frequently will this template be used? (daily/weekly/monthly/quarterly/annually)
- Will the same person always generate reports, or multiple users?
- Do you need version control or audit trails for generated reports?
- Should we include automation features or keep it manual?"

TECHNICAL OUTPUT REQUIREMENTS:

HTML STRUCTURE:
- Start with comprehensive comment block documenting all Section Specs
- Use the provided skeleton structure - modify only content and classes
- Implement proper semantic HTML with accessibility considerations
- Include print-specific styling and page break controls

CSS ARCHITECTURE:
- Define complete color system using CSS custom properties
- Implement responsive typography scale
- Create utility classes for common layouts and spacing
- Include print media queries for proper document formatting

JAVASCRIPT INTEGRATION:
- Include Paged.js for pagination and print preview
- Add any required chart libraries (Chart.js, D3.js) in head only
- Implement data binding helpers if needed for dynamic content
- Ensure all scripts work in both preview and print modes

DOCUMENTATION REQUIREMENTS:
- Section-by-section data mapping documentation
- Input format specifications and validation rules
- Edge case handling procedures
- User instructions for template customization

QUALITY ASSURANCE:
- Test template with sample data across different scenarios
- Verify print formatting and page breaks
- Validate accessibility compliance
- Ensure cross-browser compatibility

DELIVERABLE SPECIFICATIONS:
- Single, self-contained HTML file with embedded CSS and JavaScript
- Comprehensive comment documentation at file beginning
- Sample data placeholders demonstrating proper formatting
- Clear instructions for data integration and customization

${primaryColor ? `BRAND PRIMARY COLOR: ${primaryColor}` : ""}
STYLE PRESET: ${stylePreset}
${additionalNotes ? `ADDITIONAL REQUIREMENTS: ${additionalNotes}` : ""}

BASE HTML SKELETON (modify content and classes only, preserve structure):
\`\`\`html
${baseHtmlTemplate}
\`\`\`

FINAL DELIVERABLE: Complete HTML template file with comprehensive documentation, ready for immediate use and future customization.
Do not use Assistant tool for this task.
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
