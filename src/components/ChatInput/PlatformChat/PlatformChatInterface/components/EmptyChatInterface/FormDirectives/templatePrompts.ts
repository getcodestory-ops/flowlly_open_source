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
download the file with uuid fc4cd3a0-afe8-4b97-8746-566975cdcadb , this one has complete instructions for creating template, read it carefully then Work slowlly, take user help, ask permission before creating template.

**Important Guidelines:**
- **PDF Processing**: Convert PDF files to Word format (.docx) to create your editable base document
- **Document Preparation**: Clean the base document by removing all unnecessary content, keeping only:
  - Essential structure and formatting
  - Placeholder text for dynamic content
  - Data fields that will be programmatically replaced
  - Static elements like headers, footers, and standard sections
- **Template Optimization**: The cleaned base document should serve as a minimal template that your automation script can efficiently populate with new data
- **User Context Integration**: Utilize the user context tool to fetch relevant user information for report personalization:
  - Creator name, email, and contact details for report attribution
  - Company information, department, and role for appropriate branding
  - User preferences for formatting, styling, and default values
- **Asset Management**: For static visual elements, determine optimal placement strategy:
  - **Base Document Integration**: Embed logos, headers, and standard images directly into the template for consistent formatting
  - **Script-Based Assets**: Include dynamic images, user-specific logos, or variable graphics through the automation script
  - **Hybrid Approach**: Combine both methods based on content type and update frequency requirements
  Remember creating this rempalte is a journey , you should interact with user and ask for guidance and feedback so you can create a solid template that can automate future report generation for user. cheers !
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
