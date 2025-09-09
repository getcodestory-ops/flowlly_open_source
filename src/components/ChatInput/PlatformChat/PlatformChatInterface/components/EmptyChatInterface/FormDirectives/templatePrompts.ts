/**
 * Comprehensive prompt templates for AI-assisted HTML report template generation
 * This file contains detailed prompts with extensive examples, edge cases, and scope clarification
 */

export interface TemplatePromptParams {
  templateName: string;
}

export function generateTemplatePrompt(params: TemplatePromptParams): string {
	const {
		templateName,
	} = params;

	return `
:::instructions
You are tasked with creating a comprehensive report template based on the provided document. Follow this structured approach:

## Phase 1: Document Analysis & Element Identification
First, thoroughly analyze the provided report/document to identify all elements that need to be customizable for future iterations:
- **Editable Elements**: Report title, sections, table of contents, data fields, dates, metrics, charts, etc.
- **Static Elements**: Company branding, logos, standard formatting, boilerplate text, regulatory disclaimers
- **Variable Content**: Data tables, charts, images, project-specific information

Present your analysis clearly, listing what can be edited vs. what remains static. Ask for user confirmation of your understanding before proceeding.

## Phase 2: Data Source Identification
Once the editable elements are confirmed, identify where the data for future reports will come from:
- **User-provided data**: Excel files, CSV exports, manual input fields
- **System integrations**: Procore API for construction data, financial systems, project management tools
- **Static references**: Company information, standard templates, regulatory requirements
Break down each section and thoroughly discuss with the user the data sources and formatting for each section.

Confirm with the user the expected data sources and formats for each editable element.

## Phase 3: Template Development & Testing
After confirming data sources and requirements:
1. **Edit the base document** using the sandbox tool or Python scripts
2. **For Word documents**: Use the sandbox Word document tool to see if the document can be edited using existing tools.
3. **Create automation scripts** that can programmatically update the template with new data.
4. **Test the formatting** to ensure the output matches requirements
5. **Present the edited template** to the user for feedback and refinements

## Phase 4: Template Finalization & Documentation
Once the template format is approved:
1. **Create a tracking database** using the context tool to manage document versions, tracking information and metadata
    Example submittal tracking database will track each submittal, revision etc. etc. like procore submittal tracking database.
2. **Upload your automation script** and base document to get UUIDs.
3. **Write comprehensive instructions** in a markdown file covering:
   - How to download and use the script and base document
   - Data requirements and sources for each field, formatting, error handling, etc.
   - Step-by-step process for generating new reports
   - Database tracking procedures
   - Troubleshooting guidelines

## Phase 5: Template Registration
Finally, use the report creation tool with:
- Database ID for tracking
- Instruction file name
- Template name: "${templateName}"

**Deliverables**: A reusable template system including automation script, base document (to be used by script for edits), detailed instructions, tracking database, and registered template for future use.
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
