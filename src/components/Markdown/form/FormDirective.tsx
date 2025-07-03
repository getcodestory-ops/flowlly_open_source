import React, { useState, useCallback } from "react";
import { Paperclip, FileText, X, CornerDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";
import { usePlatformChat } from "@/components/ChatInput/PlatformChat/usePlatformChat";
import clsx from "clsx";



interface FormField {
	name: string;
	label: string;
	type: "text" | "textarea" | "attachment" | "select" | "checkbox" | "radio" | "number" | "email" | "password" | "date" | "tel";
	required?: boolean;
	placeholder?: string;
	options?: string[];
	multiple?: boolean;
}

// Form configuration interface
interface FormConfig {
	title?: string;
	fields: FormField[];
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
	const { handleChatSubmit, isWaitingForResponse, isPending } = usePlatformChat(activeProject?.project_id || "", "agent", "gemini-2.5-pro", false);
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
			const parsedConfig = JSON.parse(data);
			if (parsedConfig.fields && Array.isArray(parsedConfig.fields)) {
				const formConfig: FormConfig = parsedConfig;
				
				// Check if all required fields are filled
				const requiredFields = formConfig.fields.filter((field) => field.required);
				for (const field of requiredFields) {
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
				return true;
			}
		} catch (error) {
			return false;
		}
		return false;
	}, [data, formValues, selectedContexts, formId]);

	// Handle form submission
	const handleFormSubmit = useCallback(() => {
		const message = `
:::instructions
${JSON.stringify(formValues)}
:::`;
		handleChatSubmit({ message: message, files: [] });
	}, [handleChatSubmit, isFormValid, formValues]);

	try {
		const parsedConfig = JSON.parse(data);


		// Handle new format
		const formConfig: FormConfig = parsedConfig;
		const { title, fields } = formConfig;

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
								{field.options?.map((option, index) => (
									<option key={index} value={option}>
										{option}
									</option>
								))}
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
										return (
											<div className="flex items-center" key={radioId}>
												<input
													checked={fieldValue === option}
													className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
													disabled={isPending}
													id={radioId}
													name={field.name}
													onChange={(e) => handleFormInputChange(field.name, option)}
													required={isRequired}
													type="radio"
													value={option}
												/>
												<label className="ml-2 block text-sm text-gray-700" htmlFor={radioId}>
													{option}
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
								{fieldDocuments.length > 0 && <div className="space-y-2">
									{fieldDocuments.map((document) => <div 
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
									</div>)}
								</div>}
							</div>
						</div>
					);

				default:
					return (
						<div className="mb-4" key={fieldId}>
							<div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-red-700">
								Invalid field type: {field.type}
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
					{fields.map(renderFormField)}
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