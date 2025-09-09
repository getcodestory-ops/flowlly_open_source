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

## Phase 3: Template Development & Self-Validating Script Creation
After confirming data sources and requirements:

### 3.1 Document Preparation
1. **Edit the base document** using the sandbox tool or Python scripts
2. **For Word documents**: Use the sandbox Word document tool to see if the document can be edited using existing tools
3. **Clean and prepare** the base document with proper placeholders and structure

### 3.2 Self-Validating Script Development
Create a comprehensive, self-documenting automation script that includes:

#### A. Script Structure & Self-Documentation
- **Built-in help system**: Include a print_instructions() function that provides:
  - Complete usage examples with sample JSON input
  - Detailed field descriptions and data types
  - Valid options for enumerated fields (e.g., review statuses)
  - Expected date formats and validation rules
  - Error handling guidance and troubleshooting tips
- **Command-line interface**: Support -h or --help flags for easy access to documentation
- **Input validation**: Validate all input data before processing

#### B. Universal Processing Functions
- **Universal placeholder replacement**: Create flexible functions that can handle:
  - Multiple placeholder variations for the same field (e.g., [Project Name], [PROJECT_NAME])
  - Case-insensitive matching where appropriate
  - Fallback placeholder options
  - Both paragraph text and table cell content
- **Smart field mapping**: Define comprehensive placeholder mappings that cover all possible variations
- **Error recovery**: Handle missing placeholders gracefully with informative warnings

#### C. Advanced Document Manipulation
- **Radio button/checkbox handling**: Implement functions for exclusive selections (like review status)
- **Dynamic content insertion**: Support for conditional content based on input data
- **Table manipulation**: Handle dynamic table rows, data insertion, and formatting
- **Image handling**: Support for logo replacement and dynamic image insertion

#### D. Robust Error Handling & Validation
- **Input validation**: Verify JSON structure, required fields, and data formats
- **File validation**: Check for template file existence and accessibility
- **Processing validation**: Validate each step of document modification
- **Output validation**: Confirm successful document generation and saving
- **Detailed error messages**: Provide specific, actionable error descriptions

#### E. Progress Reporting & Logging
- **Step-by-step feedback**: Print progress updates for each major operation
- **Replacement summary**: Report what placeholders were found and replaced
- **Validation results**: Confirm successful operations and highlight any issues
- **Final summary**: Provide comprehensive completion report with file locations

#### F. Example Script Template Structure
Your script should follow this modular structure with comprehensive self-documentation:
- **print_instructions()**: Comprehensive usage instructions with examples and field descriptions
- **validate_input_data(data)**: Validate all input fields, data types, and format validation
- **replace_all_placeholders(doc, data)**: Universal placeholder replacement with comprehensive mapping
- **handle_special_fields(doc, data)**: Process radio buttons, checkboxes, and conditional content  
- **process_document(template_path, data, output_path)**: Main document processing with full error handling
- **main()**: Command-line interface with argument parsing, help system, and error recovery

Each function should include detailed docstrings, error handling, and progress reporting to create a truly self-validating and self-documenting automation script.

### 3.3 Testing & Validation
4. **Test the script** with various input scenarios and edge cases
5. **Validate output formatting** to ensure consistent results
6. **Present the edited template** and script to the user for feedback and refinements

## Phase 4: Template Finalization & Comprehensive Documentation
Once the template format is approved:

### 4.1 Database & Tracking Setup
1. **Create a tracking database** using the context tool to manage document versions, tracking information and metadata
   - Example: Submittal tracking database will track each submittal, revision, status, dates, etc. like Procore submittal tracking database
   - Include fields for: document ID, version, creation date, last modified, creator, status, project association, etc.

### 4.2 Asset Upload & UUID Generation
2. **Upload your automation script** and base document to get UUIDs for template registration

### 4.3 Comprehensive Instruction Documentation
3. **Write a detailed instruction markdown file** that serves as a complete guide for future users. This file should be self-contained and include:

#### A. Quick Start Guide
- **Prerequisites**: Required software, dependencies, environment setup
- **Installation steps**: How to download script and base document
- **Basic usage example**: Simple command with sample data
- **Expected output**: What files are generated and where

#### B. Detailed Field Reference
- **Complete field catalog**: Every available input field with:
  - Field name and data type
  - Description and purpose
  - Required vs optional status
  - Valid values/formats (especially for enums like review status)
  - Default values if any
  - Field dependencies and relationships
- **Data validation rules**: Format requirements, length limits, special characters
- **Example values**: Real-world examples for each field type

#### C. Data Source Integration Guide
- **Manual data entry**: How to structure JSON input for manual updates
- **Excel/CSV integration**: How to format and import spreadsheet data
- **API integrations**: Instructions for pulling data from Procore, project management systems
- **File attachments**: How to handle images, additional documents, references

#### D. Advanced Usage Scenarios
- **Batch processing**: How to process multiple documents
- **Template customization**: How to modify the base template for specific needs
- **Custom field addition**: Steps to add new fields to both script and template
- **Output customization**: How to modify formatting, styling, layout

#### E. Database Integration & Tracking
- **Database connection**: How to connect to and use the tracking database
- **Version management**: How to track document versions and revisions
- **Audit trail**: How to maintain change history and user tracking
- **Reporting**: How to generate reports from tracking data

#### F. Troubleshooting & Error Resolution
- **Common errors**: Detailed list of frequent issues and solutions
- **Debugging steps**: How to diagnose problems with script execution
- **Template issues**: How to fix placeholder problems, formatting issues
- **Performance optimization**: Tips for handling large documents or batch processing
- **Recovery procedures**: How to handle corrupted files or failed processes

#### G. Maintenance & Updates
- **Script updates**: How to update the automation script while preserving data
- **Template versioning**: How to manage template changes over time
- **Backup procedures**: How to backup templates, scripts, and tracking data
- **Migration guide**: How to move to new versions or different systems

#### H. Integration Examples
- **Real-world scenarios**: Step-by-step examples of common use cases
- **Sample data sets**: Complete example JSON inputs for different document types
- **Output samples**: Screenshots or examples of generated documents
- **Workflow integration**: How to integrate with existing business processes

### 4.4 Script Quality Assurance & Best Practices
Ensure your automation script follows these production-ready standards:

#### A. Code Quality Standards
- **Modular design**: Break functionality into focused, reusable functions
- **Clear function documentation**: Every function should have comprehensive docstrings
- **Consistent error handling**: Use try-catch blocks with specific error messages
- **Input sanitization**: Validate and clean all user inputs before processing
- **Type hints**: Use Python type hints for better code maintainability

#### B. Self-Validation Features
- **Built-in testing**: Include sample data and validation functions within the script
- **Dry-run mode**: Allow users to preview changes without modifying files
- **Rollback capability**: Provide options to undo changes or restore original files
- **Checksum validation**: Verify file integrity before and after processing

#### C. Performance & Scalability
- **Memory efficiency**: Handle large documents without excessive memory usage
- **Processing optimization**: Minimize redundant operations and file I/O
- **Batch processing support**: Enable processing multiple documents efficiently
- **Progress tracking**: Show progress for long-running operations

#### D. Security & Safety
- **File path validation**: Prevent directory traversal and unauthorized file access
- **Input validation**: Sanitize all inputs to prevent injection attacks
- **Backup creation**: Automatically backup original files before modification
- **Permission checking**: Verify file permissions before attempting operations

#### E. Maintainability Features
- **Version information**: Include script version and compatibility information
- **Configuration management**: Support external configuration files for settings
- **Logging system**: Implement comprehensive logging for debugging and auditing
- **Update mechanism**: Provide guidance for script updates and migrations

## Phase 5: Template Registration
Finally, use the report creation tool with:
- Database ID for tracking
- Instruction file name
- Template name: "${templateName}"

**Deliverables**: A reusable template system including automation script, base document (to be used by script for edits), detailed instructions, tracking database, and registered template for future use.
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
