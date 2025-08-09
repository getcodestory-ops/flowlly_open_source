import React, { useState, useCallback } from "react";
import { Paperclip, FileText, X, CornerDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";
import { usePlatformChat } from "@/components/ChatInput/PlatformChat/usePlatformChat";
import clsx from "clsx";

// Robust JSON parser that handles edge cases and extracts JSON from mixed content
const parseFormConfig = (jsonString: string) => {
	// Helper function to extract JSON object from mixed content
	const extractJsonObject = (str: string): string => {
		const trimmed = str.trim();
		
		// Find the first opening brace
		const start = trimmed.indexOf("{");
		if (start === -1) return str;
		
		// Find the matching closing brace by counting braces
		let braceCount = 0;
		let end = start;
		
		for (let i = start; i < trimmed.length; i++) {
			if (trimmed[i] === "{") braceCount++;
			if (trimmed[i] === "}") braceCount--;
			if (braceCount === 0) {
				end = i;
				break;
			}
		}
		
		// Extract just the JSON portion
		return trimmed.substring(start, end + 1);
	};
	
	try {
		// First try to parse as-is (valid JSON)
		return JSON.parse(jsonString);
	} catch (firstError) {
		try {
			// Extract just the JSON object part
			const extractedJson = extractJsonObject(jsonString);
			
			// Try parsing the extracted JSON
			return JSON.parse(extractedJson);
		} catch (secondError) {
			try {
				// If that fails, normalize quotes and try again
				const extractedJson = extractJsonObject(jsonString);
				const normalizedJson = extractedJson
					.replace(/'/g, "\"")  // Replace single quotes with double quotes
					.replace(/True/g, "true")  // Replace Python True with JSON true
					.replace(/False/g, "false")  // Replace Python False with JSON false
					.replace(/None/g, "null");  // Replace Python None with JSON null
				
				return JSON.parse(normalizedJson);
			} catch (thirdError) {
				// If all attempts fail, throw the original error
				throw firstError;
			}
		}
	}
};



interface FormField {
	name: string;
	label: string;
	type: "text" | "textarea" | "attachment" | "select" | "checkbox" | "radio" | "number" | "email" | "password" | "date" | "tel" | "group";
	required?: boolean;
	placeholder?: string;
	options?: string[] | { label: string; value: string }[]; // Support both string arrays and object arrays
	multiple?: boolean;
	fields?: FormField[]; // For group type - nested fields
}

// Form configuration interface
interface FormConfig {
	title?: string;
	fields?: FormField[];
	groups?: {
		name: string;
		label: string;
		fields: FormField[];
	}[];
}



// Props for the FormDirective component
interface FormDirectiveProps {
	data: string;
}

const FormDirective: React.FC<FormDirectiveProps> = ({ 
	data, 
}) => {
	const activeProject = useStore((state) => state.activeProject);
	const activeChatEntity = useStore((state) => state.activeChatEntity);
	const currentChatId = activeChatEntity?.id || "untitled";
	const { handleChatSubmit, isWaitingForResponse, isPending } = usePlatformChat(activeProject?.project_id || "", "agent", false);
	const { setSidePanel, setCollapsed, selectedContexts, setSelectedContexts } = useChatStore();
	const [formId] = useState(() => `form_${Date.now()}_${Math.random().toString(36)
		.substr(2, 9)}`);
	
	// Helper function to get field-specific context ID for attachment fields
	const getFieldContextId = (fieldName: string, fieldType: string) => {
		return fieldType === "attachment" ? `${formId}_${fieldName}` : formId;
	};
	
	// Helper function to get selected documents for a specific field
	const getSelectedDocuments = (fieldName: string, fieldType: string) => {
		const contextId = getFieldContextId(fieldName, fieldType);
		return selectedContexts[contextId] || [];
	};
	
	// State to store form input values
	const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

	// Document panel component with form-specific configuration
	const loadDocumentPanel = useCallback((fieldName: string, fieldType: string) => {
		const contextId = getFieldContextId(fieldName, fieldType);
		const fieldDocuments = selectedContexts[contextId] || [];
		
		return (
			<Button
				className={clsx(
					"text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2",
					fieldDocuments.length > 0 && "text-indigo-500 bg-indigo-50/50",
				)}
				disabled={false}
				onClick={() => {
					setCollapsed(true);
					setSidePanel({
						isOpen: true,
						type: "folder",
						resourceId: contextId,
						contextId: contextId,
						title: `Select files for form: ${fieldName}`,
					});
				}}
				size="sm"
				title={fieldDocuments.length > 0 ? `${fieldDocuments.length} file(s) selected` : "Add files"}
				type="button"
				variant="ghost"
			>
				<Paperclip className="h-4 w-4" />
			</Button>
		);
	}, [selectedContexts, setCollapsed, setSidePanel, formId]);

	const removeDocument = useCallback((docId: string, fieldName: string, fieldType: string) => {
		const contextId = getFieldContextId(fieldName, fieldType);
		const fieldDocuments = selectedContexts[contextId] || [];
		const newContexts = fieldDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(contextId, newContexts);
	}, [selectedContexts, setSelectedContexts, formId]);



	// Handle form input changes
	const handleFormInputChange = useCallback((fieldName: string, value: any) => {
		setFormValues((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	}, []);


	const isFormValid = useCallback(() => {
		try {
			const parsedConfig = parseFormConfig(data);
			const formConfig: FormConfig = parsedConfig;
			
			// Recursive function to validate fields (including nested fields in groups)
			const validateFields = (fields: FormField[]): boolean => {
				for (const field of fields) {
					if (field.type === "group" && field.fields) {
						// Recursively validate nested fields in groups
						if (!validateFields(field.fields)) {
							return false;
						}
					} else if (field.required) {
						// Validate individual required fields
						const value = formValues[field.name];
						if (field.type === "attachment") {
							const fieldDocuments = getSelectedDocuments(field.name, field.type);
							if (fieldDocuments.length === 0) {
								return false;
							}
						} else {
							// For other fields, check if value exists and is not empty
							if (!value || (typeof value === "string" && value.trim() === "")) {
								return false;
							}
						}
					}
				}
				return true;
			};
			
			// Handle both formats: fields array or groups array
			if (formConfig.fields && Array.isArray(formConfig.fields)) {
				return validateFields(formConfig.fields);
			} else if (formConfig.groups && Array.isArray(formConfig.groups)) {
				// For groups format, validate each group's fields
				for (const group of formConfig.groups) {
					if (!validateFields(group.fields)) {
						return false;
					}
				}
				return true;
			}
			
			return false;
		} catch (error) {
			return false;
		}
	}, [data, formValues, selectedContexts, formId]);

	// Collect all attachments from form fields
	const collectAllAttachments = useCallback(() => {
		const allAttachments: any[] = [];
		
		// Collect attachments from selectedContexts for this form
		Object.keys(selectedContexts).forEach((contextId) => {
			if (contextId.startsWith(formId)) {
				const documents = selectedContexts[contextId] || [];
				allAttachments.push(...documents);
			}
		});
		
		return allAttachments;
	}, [selectedContexts, formId]);

	// Collect form data including attachment field references
	const collectFormData = useCallback(() => {
		const formData = { ...formValues };
		
		// Add attachment field information
		Object.keys(selectedContexts).forEach((contextId) => {
			if (contextId.startsWith(formId)) {
				const documents = selectedContexts[contextId] || [];
				// Extract field name from context ID
				const fieldName = contextId.replace(`${formId}_`, "");
				
				if (documents.length > 0) {
					formData[fieldName] = documents.map((doc) => ({
						id: doc.id,
						name: doc.name,
						extension: doc.extension || "",
					}));
				}
			}
		});
		
		return formData;
	}, [formValues, selectedContexts, formId]);

	// Handle form submission
	const handleFormSubmit = useCallback(() => {
		const allAttachments = collectAllAttachments();
		const completeFormData = collectFormData();
		const message = `
:::instructions
${JSON.stringify(completeFormData, null, 2)}
:::`;
		handleChatSubmit({ message: message, files: allAttachments });
	}, [handleChatSubmit, isFormValid, collectAllAttachments, collectFormData]);

	try {
		const parsedConfig = parseFormConfig(data);


		// Handle both formats: fields array or groups array
		const formConfig: FormConfig = parsedConfig;
		const { title, fields, groups } = formConfig;

		const renderFormField = (field: FormField) => {
			const fieldId = `field-${field.name}`;
			const isRequired = field.required || false;
			const placeholder = field.placeholder || "";
			const fieldValue = formValues[field.name] || "";

			const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
			const labelClasses = `block text-sm font-medium text-gray-700 mb-2 ${isRequired ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}`;

			switch (field.type) {
				case "text":
				case "email":
				case "password":
				case "number":
				case "date":
				case "tel":
					return (
						<div className="mb-4" key={fieldId}>
							<label className={labelClasses} htmlFor={fieldId}>
								{field.label}
							</label>
							<input
								className={inputClasses}
								disabled={isPending}
								id={fieldId}
								name={field.name}
								onChange={(e) => handleFormInputChange(field.name, e.target.value)}
								placeholder={placeholder}
								required={isRequired}
								type={field.type}
								value={fieldValue}
							/>
						</div>
					);

				case "textarea":
					return (
						<div className="mb-4" key={fieldId}>
							<label className={labelClasses} htmlFor={fieldId}>
								{field.label}
							</label>
							<textarea
								className={`${inputClasses} resize-vertical`}
								disabled={isPending}
								id={fieldId}
								name={field.name}
								onChange={(e) => handleFormInputChange(field.name, e.target.value)}
								placeholder={placeholder}
								required={isRequired}
								rows={4}
								value={fieldValue}
							/>
						</div>
					);

				case "select":
					return (
						<div className="mb-4" key={fieldId}>
							<label className={labelClasses} htmlFor={fieldId}>
								{field.label}
							</label>
							<select
								className={inputClasses}
								disabled={isPending}
								id={fieldId}
								name={field.name}
								onChange={(e) => handleFormInputChange(field.name, e.target.value)}
								required={isRequired}
								value={fieldValue}
							>
								<option value="">Choose an option...</option>
								{field.options?.map((option, index) => {
									// Handle both string options and object options {label, value}
									const optionValue = typeof option === "string" ? option : option.value;
									const optionLabel = typeof option === "string" ? option : option.label;
									
									return (
										<option key={index} value={optionValue}>
											{optionLabel}
										</option>
									);
								})}
							</select>
						</div>
					);

				case "checkbox":
					return (
						<div className="mb-4" key={fieldId}>
							<div className="flex items-center">
								<input
									checked={fieldValue === true || fieldValue === "true"}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									disabled={isPending}
									id={fieldId}
									name={field.name}
									onChange={(e) => handleFormInputChange(field.name, e.target.checked)}
									required={isRequired}
									type="checkbox"
								/>
								<label className="ml-2 block text-sm text-gray-700" htmlFor={fieldId}>
									{field.label}
									{isRequired && <span className="text-red-500 ml-1">*</span>}
								</label>
							</div>
						</div>
					);

				case "radio":
					return (
						<div className="mb-4" key={fieldId}>
							<fieldset>
								<legend className={labelClasses.replace("block", "")}>{field.label}</legend>
								<div className="space-y-2">
									{field.options?.map((option, index) => {
										const radioId = `${fieldId}-${index}`;
										// Handle both string options and object options {label, value}
										const optionValue = typeof option === "string" ? option : option.value;
										const optionLabel = typeof option === "string" ? option : option.label;
										
										return (
											<div className="flex items-center" key={radioId}>
												<input
													checked={fieldValue === optionValue}
													className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
													disabled={isPending}
													id={radioId}
													name={field.name}
													onChange={(e) => handleFormInputChange(field.name, optionValue)}
													required={isRequired}
													type="radio"
													value={optionValue}
												/>
												<label className="ml-2 block text-sm text-gray-700" htmlFor={radioId}>
													{optionLabel}
												</label>
											</div>
										);
									})}
								</div>
							</fieldset>
						</div>
					);

				case "attachment":
					const fieldDocuments = getSelectedDocuments(field.name, field.type);
					return (
						<div className="mb-4" key={fieldId}>
							<label className={labelClasses} htmlFor={fieldId}>
								{field.label}
							</label>
							<div className="space-y-3">
								{/* Document selection button */}
								<div className="flex items-center gap-3">
									{loadDocumentPanel(field.name, field.type)}
									<span className="text-sm text-gray-600">
										{fieldDocuments.length === 0 
											? "Click to select documents from your folders"
											: `${fieldDocuments.length} document${fieldDocuments.length !== 1 ? "s" : ""} selected`
										}
									</span>
								</div>
								{fieldDocuments.length > 0 && (
									<div className="space-y-2">
										{fieldDocuments.map((document) => (
											<div 
												className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border border-blue-200"
												key={document.id}
											>
												<FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
												<span className="text-sm text-blue-900 truncate flex-1" title={document.name}>
													{document.name}
												</span>
												<Button
													className="h-6 w-6 p-0 hover:bg-blue-200"
													onClick={() => removeDocument(document.id, field.name, field.type)}
													size="sm"
													type="button"
													variant="ghost"
												>
													<X className="h-3 w-3 text-blue-600" />
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					);

				case "group":
					return (
						<div className="mb-6" key={fieldId}>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
								<h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
									{field.label}
								</h4>
								<div className="space-y-4">
									{field.fields?.map(renderFormField)}
								</div>
							</div>
						</div>
					);

				default:
					// Fallback for invalid field types - provide details and textarea with attachment option
					const fallbackFieldName = `${field.name}_fallback`;
					const fallbackAttachmentName = `${field.name}_fallback_attachments`;
					const fallbackDocuments = getSelectedDocuments(fallbackAttachmentName, "attachment");
					
					return (
						<div className="mb-4" key={fieldId}>
							<div className="bg-orange-50 border border-orange-200 rounded-md p-4">
								<div className="mb-3">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-orange-600 font-medium">⚠ Unsupported field type:</span>
										<code className="bg-orange-100 px-2 py-1 rounded text-sm">{field.type}</code>
									</div>
									<div className="text-sm text-orange-700">
										<p><strong>Field:</strong> {field.label}</p>
										{field.placeholder && <p><strong>Expected:</strong> {field.placeholder}</p>}
										{field.options && <p><strong>Options:</strong> {field.options.join(", ")}</p>}
									</div>
								</div>								
								<div className="space-y-3">
									<div>
										<label className={`${labelClasses} text-orange-800`} htmlFor={`${fieldId}_fallback`}>
											{field.label} (Fallback Input)
											{isRequired && <span className="text-red-500 ml-1">*</span>}
										</label>
										<textarea
											className={`${inputClasses} border-orange-300 focus:ring-orange-500 focus:border-orange-500`}
											disabled={isPending}
											id={`${fieldId}_fallback`}
											name={fallbackFieldName}
											onChange={(e) => handleFormInputChange(fallbackFieldName, e.target.value)}
											placeholder={field.placeholder || "Please provide your input for this field..."}
											required={isRequired}
											rows={3}
											value={formValues[fallbackFieldName] || ""}
										/>
									</div>									
									<div>
										<label className="block text-sm font-medium text-orange-800 mb-2">
											Supporting Documents (Optional)
										</label>
										<div className="space-y-3">
											<div className="flex items-center gap-3">
												{loadDocumentPanel(fallbackAttachmentName, "attachment")}
												<span className="text-sm text-orange-700">
													{fallbackDocuments.length === 0 
														? "Click to attach supporting documents"
														: `${fallbackDocuments.length} document${fallbackDocuments.length !== 1 ? "s" : ""} attached`
													}
												</span>
											</div>
											{fallbackDocuments.length > 0 && (
												<div className="space-y-2">
													{fallbackDocuments.map((document) => (
														<div 
															className="flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-md border border-orange-300"
															key={document.id}
														>
															<FileText className="h-4 w-4 text-orange-600 flex-shrink-0" />
															<span className="text-sm text-orange-900 truncate flex-1" title={document.name}>
																{document.name}
															</span>
															<Button
																className="h-6 w-6 p-0 hover:bg-orange-200"
																onClick={() => removeDocument(document.id, fallbackAttachmentName, "attachment")}
																size="sm"
																type="button"
																variant="ghost"
															>
																<X className="h-3 w-3 text-orange-600" />
															</Button>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					);
			}
		};

		return (
			<div className="my-6 w-full max-w-2xl bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
				{title && (
					<h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
						{title}
					</h3>
				)}
				<form className="space-y-1" onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
					{/* Render fields based on format */}
					{fields && fields.map(renderFormField)}
					{groups && groups.map((group) => (
						<div className="mb-6" key={group.name}>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
								<h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
									{group.label}
								</h4>
								<div className="space-y-4">
									{group.fields.map(renderFormField)}
								</div>
							</div>
						</div>
					))}
					<div className="mt-8 pt-6 border-t-2 border-gray-300">
						<Accordion className="w-full"
							collapsible
							type="single"
						>
							<AccordionItem className="border-none" value="additional-info">
								<AccordionTrigger className="hover:no-underline py-2 px-2 hover:bg-gray-50 rounded-md">
									<div className="flex items-center gap-2">
										<span className="text-md font-semibold text-gray-800">
											Additional Information (Optional)
										</span>
										{(() => {
											const additionalCommentsValue = formValues["additional_comments"] || "";
											const additionalDocs = getSelectedDocuments("additional_attachments", "attachment");
											const hasContent = additionalCommentsValue.trim() || additionalDocs.length > 0;
											return hasContent && (
												<span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
													{[additionalCommentsValue.trim() && "comments", additionalDocs.length > 0 && `${additionalDocs.length} file${additionalDocs.length !== 1 ? "s" : ""}`].filter(Boolean).join(", ")}
												</span>
											);
										})()}
									</div>
								</AccordionTrigger>
								<AccordionContent className="pt-4">
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
										{/* Additional Comments */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="additional_comments">
												Additional Comments
											</label>
											<textarea
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
												disabled={isPending}
												id="additional_comments"
												name="additional_comments"
												onChange={(e) => handleFormInputChange("additional_comments", e.target.value)}
												placeholder="Any additional information, clarifications, or comments you'd like to provide..."
												rows={3}
												value={formValues["additional_comments"] || ""}
											/>
										</div>
										{/* Additional Attachments */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Additional Attachments
											</label>
											<div className="space-y-3">
												<div className="flex items-center gap-3">
													{loadDocumentPanel("additional_attachments", "attachment")}
													<span className="text-sm text-gray-600">
														{(() => {
															const additionalDocs = getSelectedDocuments("additional_attachments", "attachment");
															return additionalDocs.length === 0 
																? "Click to attach any supporting documents, photos, or files"
																: `${additionalDocs.length} additional document${additionalDocs.length !== 1 ? "s" : ""} attached`;
														})()}
													</span>
												</div>
												{(() => {
													const additionalDocs = getSelectedDocuments("additional_attachments", "attachment");
													return additionalDocs.length > 0 && (
														<div className="space-y-2">
															{additionalDocs.map((document) => (
																<div 
																	className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-md border border-blue-300"
																	key={document.id}
																>
																	<FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
																	<span className="text-sm text-blue-900 truncate flex-1" title={document.name}>
																		{document.name}
																	</span>
																	<Button
																		className="h-6 w-6 p-0 hover:bg-blue-200"
																		onClick={() => removeDocument(document.id, "additional_attachments", "attachment")}
																		size="sm"
																		type="button"
																		variant="ghost"
																	>
																		<X className="h-3 w-3 text-blue-600" />
																	</Button>
																</div>
															))}
														</div>
													);
												})()}
											</div>
										</div>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>					
					<div className="flex justify-end pt-4 border-t border-gray-200">
						<Button
							className="bg-indigo-500 hover:bg-indigo-600 text-white px-6"
							disabled={isWaitingForResponse || !isFormValid()}
							onClick={handleFormSubmit}
							type="submit"
						>
							{isWaitingForResponse ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Processing...
								</>
							) : (
								<>
										Submit Form
									<CornerDownLeft className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		);
	} catch (error) {
		return (
			<div className="my-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-red-700">
				Invalid form configuration: {data}
			</div>
		);
	}
};

export default FormDirective; 