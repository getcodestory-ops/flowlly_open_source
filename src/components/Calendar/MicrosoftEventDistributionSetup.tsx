import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
	Plus, 
	X, 
	Save,
	Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/utils/store";
import { SAMPLE_TEMPLATE_DATA } from "@/components/WorkflowComponents/Meeting/emailTemplates";
import { TemplateSelector } from "@/components/WorkflowComponents/Meeting/TemplateSelector";
import type { DistributionSettings, TemplateId, UpdateDistributionSettingsRequest, CreateDistributionSettingsRequest } from "@/components/WorkflowComponents/Meeting/distributionTypes";
import { 
	getDistributionSettings, 
	createDistributionSettings, 
	updateDistributionSettings 
} from "@/api/distributionSettingsRoutes";

interface Recipient {
	email: string;
	name?: string;
	selected: boolean;
}

interface MicrosoftEventDistributionSetupProps {
	meetingName: string;
	initialEmails: string[];
}

interface OriginalSettings {
	template: string;
	subject: string;
	recipients: Recipient[];
	customPrompt: string;
}

// Email validation
const isValidEmail = (email: string): boolean => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Compare recipients arrays
const areRecipientsEqual = (a: Recipient[], b: Recipient[]): boolean => {
	if (a.length !== b.length) return false;
	const sortedA = [...a].sort((x, y) => x.email.localeCompare(y.email));
	const sortedB = [...b].sort((x, y) => x.email.localeCompare(y.email));
	return sortedA.every((item, index) => 
		item.email === sortedB[index].email && item.selected === sortedB[index].selected
	);
};

export const MicrosoftEventDistributionSetup: React.FC<MicrosoftEventDistributionSetupProps> = ({
	meetingName,
	initialEmails,
}) => {
	const { toast } = useToast();
	const { session, activeProject } = useStore();
	
	// Get projectAccessId from activeProject
	const projectAccessId = activeProject?.project_id;
	
	// Template state
	const [selectedTemplate, setSelectedTemplate] = useState<string>("notion");
	
	// Recipients state
	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const [removedRecipients, setRemovedRecipients] = useState<Recipient[]>([]);
	const [newEmail, setNewEmail] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [emailSubject, setEmailSubject] = useState("Meeting Minutes - " + SAMPLE_TEMPLATE_DATA.DATE);
	const [customPrompt, setCustomPrompt] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	
	// UI state
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	
	// Existing settings from backend
	const [existingSettingsId, setExistingSettingsId] = useState<string | null>(null);
	
	// Track original settings for change detection
	const [originalSettings, setOriginalSettings] = useState<OriginalSettings>({
		template: "notion",
		subject: "Meeting Minutes - " + SAMPLE_TEMPLATE_DATA.DATE,
		recipients: [],
		customPrompt: "",
	});
	const isInitialized = useRef(false);

	// Check if settings have changed
	const hasChanges = useMemo(() => {
		if (!isInitialized.current) return false;
		
		const templateChanged = selectedTemplate !== originalSettings.template;
		const subjectChanged = emailSubject !== originalSettings.subject;
		const recipientsChanged = !areRecipientsEqual(recipients, originalSettings.recipients);
		const customPromptChanged = customPrompt !== originalSettings.customPrompt;
		
		return templateChanged || subjectChanged || recipientsChanged || customPromptChanged;
	}, [selectedTemplate, emailSubject, recipients, customPrompt, originalSettings]);

	// Fetch existing settings from backend
	useEffect(() => {
		const fetchSettings = async () => {
			if (!session || !projectAccessId || !meetingName) return;
			
			setIsLoading(true);
			try {
				const settings = await getDistributionSettings(session, projectAccessId, meetingName);
				if (settings) {
					setExistingSettingsId(settings.id);
					setSelectedTemplate(settings.template_id);
					setEmailSubject(settings.subject);
					
					// Load custom prompt if available
					if (settings.custom_prompt) {
						setCustomPrompt(settings.custom_prompt);
					}
					
					// Apply selected_recipients to recipients after they're loaded
					if (settings.selected_recipients && settings.selected_recipients.length > 0) {
						setRecipients(prev => prev.map(r => ({
							...r,
							selected: settings.selected_recipients!.includes(r.email)
						})));
					}
					
					// Update original settings to match saved state
					setOriginalSettings(prev => ({
						...prev,
						template: settings.template_id,
						subject: settings.subject,
						customPrompt: settings.custom_prompt || "",
					}));
				}
			} catch (error) {
				console.error("Failed to fetch distribution settings:", error);
			} finally {
				setIsLoading(false);
			}
		};
		
		fetchSettings();
	}, [session, projectAccessId, meetingName]);

	// Initialize recipients from initialEmails prop
	useEffect(() => {
		if (initialEmails.length > 0) {
			const parsedRecipients = initialEmails.map(email => ({
				email,
				selected: true,
			}));
			setRecipients(parsedRecipients);
			
			// Set original settings after initial load
			if (!isInitialized.current) {
				setOriginalSettings({
					template: "notion",
					subject: emailSubject,
					recipients: parsedRecipients,
					customPrompt: "",
				});
				isInitialized.current = true;
			}
		} else if (!isInitialized.current) {
			// No emails provided, still mark as initialized
			setOriginalSettings({
				template: "notion",
				subject: emailSubject,
				recipients: [],
				customPrompt: "",
			});
			isInitialized.current = true;
		}
	}, [initialEmails]);

	// Handle adding new recipient
	const handleAddRecipient = (): void => {
		if (!newEmail.trim()) {
			setEmailError("Please enter an email address");
			return;
		}
		
		if (!isValidEmail(newEmail)) {
			setEmailError("Please enter a valid email address");
			return;
		}
		
		if (recipients.some(r => r.email.toLowerCase() === newEmail.toLowerCase())) {
			setEmailError("This email is already in the list");
			return;
		}
		
		setRecipients([...recipients, { email: newEmail.trim(), selected: true }]);
		setNewEmail("");
		setEmailError(null);
	};

	// Handle removing recipient
	const handleRemoveRecipient = (email: string): void => {
		const removed = recipients.find(r => r.email === email);
		if (removed) {
			setRemovedRecipients(prev => [...prev, { ...removed, selected: false }]);
		}
		setRecipients(recipients.filter(r => r.email !== email));
	};

	// Handle toggling recipient selection
	const handleToggleRecipient = (email: string): void => {
		setRecipients(recipients.map(r => 
			r.email === email ? { ...r, selected: !r.selected } : r
		));
	};

	// Handle select all
	const handleSelectAll = (): void => {
		const allSelected = recipients.every(r => r.selected);
		setRecipients(recipients.map(r => ({ ...r, selected: !allSelected })));
	};

	// Handle save setup
	const handleSaveSetup = async (): Promise<void> => {
		if (!session) {
			toast({
				title: "Error",
				description: "You must be logged in to save settings.",
				variant: "destructive",
			});
			return;
		}
		
		if (!meetingName) {
			toast({
				title: "Error",
				description: "Meeting name is required.",
				variant: "destructive",
			});
			return;
		}
		
		setIsSaving(true);
		
		try {
			// Get selected emails
			const selectedEmails = recipients.filter(r => r.selected).map(r => r.email);
			
			// Check if we should send empty array (meaning "all") or explicit list
			// Send empty only if: same recipient count as original AND all are selected
			const allSelected = recipients.every(r => r.selected);
			const sameCount = recipients.length === originalSettings.recipients.length;
			const shouldSendAll = allSelected && sameCount;
			
			if (existingSettingsId) {
				// Update existing settings
				const updates: UpdateDistributionSettingsRequest = {
					template_id: selectedTemplate as TemplateId,
					subject: emailSubject,
					// Send explicit list if any removed or unselected, empty means "all"
					selected_recipients: shouldSendAll ? [] : selectedEmails,
					// Only include custom_prompt if using custom template
					custom_prompt: selectedTemplate === "custom" ? customPrompt : null,
				};
				
				const updated = await updateDistributionSettings(session, existingSettingsId, updates);
				console.log("Updated distribution settings:", updated);
			} else {
				// Create new settings
				if (!projectAccessId) {
					toast({
						title: "Error",
						description: "Project access ID is required to create settings.",
						variant: "destructive",
					});
					setIsSaving(false);
					return;
				}
				
				const createRequest: CreateDistributionSettingsRequest = {
					meeting_name: meetingName,
					project_access_id: projectAccessId,
					template_id: selectedTemplate as TemplateId,
					subject: emailSubject,
					// Send explicit list if any removed or unselected, empty means "all"
					selected_recipients: shouldSendAll ? [] : selectedEmails,
					// Only include custom_prompt if using custom template
					custom_prompt: selectedTemplate === "custom" ? customPrompt : null,
				};
				
				const created = await createDistributionSettings(session, createRequest);
				setExistingSettingsId(created.id);
				console.log("Created distribution settings:", created);
			}
			
			// Update original settings to current values after save
			setOriginalSettings({
				template: selectedTemplate,
				subject: emailSubject,
				recipients: [...recipients],
				customPrompt: selectedTemplate === "custom" ? customPrompt : "",
			});
			
			toast({
				title: "Setup saved",
				description: "Distribution settings have been saved.",
			});
		} catch (error) {
			console.error("Failed to save distribution settings:", error);
			toast({
				title: "Error",
				description: "Failed to save settings. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const selectedCount = recipients.filter(r => r.selected).length;

	// Get suggestions: unselected recipients + removed recipients
	const suggestions = useMemo(() => {
		const unselected = recipients.filter(r => !r.selected);
		const removed = removedRecipients.filter(
			r => !recipients.some(rec => rec.email.toLowerCase() === r.email.toLowerCase())
		);
		const allSuggestions = [...unselected, ...removed];
		
		// Filter by search term if user is typing
		if (newEmail.trim()) {
			return allSuggestions.filter(r => 
				r.email.toLowerCase().includes(newEmail.toLowerCase())
			);
		}
		return allSuggestions;
	}, [recipients, removedRecipients, newEmail]);

	// Handle selecting a suggestion
	const handleSelectSuggestion = (email: string): void => {
		// Check if it's an unselected recipient
		const existingRecipient = recipients.find(r => r.email === email);
		if (existingRecipient) {
			// Re-select the existing recipient
			setRecipients(recipients.map(r => 
				r.email === email ? { ...r, selected: true } : r
			));
		} else {
			// Add from removed list
			const removedRecipient = removedRecipients.find(r => r.email === email);
			if (removedRecipient) {
				setRecipients([...recipients, { ...removedRecipient, selected: true }]);
				setRemovedRecipients(removedRecipients.filter(r => r.email !== email));
			}
		}
		setNewEmail("");
		setShowSuggestions(false);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-white">
			{/* Email compose header */}
			<div className="flex-shrink-0 border-b border-gray-200">
				{/* Subject row */}
				<div className="flex items-center px-4 py-2 border-b border-gray-100">
					<span className="text-sm text-gray-500 w-16 flex-shrink-0">Subject</span>
					<Input 
						placeholder="Meeting Minutes - [Date]"
						value={emailSubject}
						onChange={(e) => setEmailSubject(e.target.value)}
						className="border-0 shadow-none focus-visible:ring-0 px-2 h-8"
					/>
				</div>

				{/* Recipients row */}
				<div className="flex items-start px-4 py-2">
					<span className="text-sm text-gray-500 w-16 flex-shrink-0 pt-1">To</span>
					<div className="flex-1 flex flex-wrap gap-1.5 items-center min-h-[32px]">
						{recipients.map((recipient) => (
							<div
								key={recipient.email}
								onClick={() => handleToggleRecipient(recipient.email)}
								className={`
									inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs cursor-pointer transition-all
									${recipient.selected 
										? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
										: "bg-gray-100 text-gray-500 hover:bg-gray-200"
									}
								`}
							>
								<span className={recipient.selected ? "" : "line-through opacity-60"}>
									{recipient.email}
								</span>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleRemoveRecipient(recipient.email);
									}}
									className="p-0.5 rounded-full hover:bg-black/10"
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
						{/* Add email input with suggestions */}
						<div className="relative flex items-center gap-1">
							<Input
								ref={inputRef}
								placeholder={recipients.length === 0 ? "Add recipients..." : "Add more..."}
								value={newEmail}
								onChange={(e) => {
									setNewEmail(e.target.value);
									setEmailError(null);
								}}
								onFocus={() => setShowSuggestions(true)}
								onBlur={() => {
									// Delay to allow click on suggestion
									setTimeout(() => setShowSuggestions(false), 150);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										if (suggestions.length > 0 && newEmail) {
											handleSelectSuggestion(suggestions[0].email);
										} else {
											handleAddRecipient();
										}
									}
									if (e.key === "Escape") {
										setShowSuggestions(false);
									}
								}}
								className={`
									border-0 shadow-none focus-visible:ring-0 px-1 h-7 w-40 text-xs
									${emailError ? "text-red-500" : ""}
								`}
							/>
							{newEmail && (
								<Button
									variant="ghost"
									size="icon"
									onClick={handleAddRecipient}
									className="h-6 w-6"
								>
									<Plus className="h-3 w-3" />
								</Button>
							)}
							
							{/* Suggestions dropdown */}
							{showSuggestions && suggestions.length > 0 && (
								<div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 max-h-48 overflow-auto">
									<div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wide">
										{suggestions.some(s => recipients.some(r => r.email === s.email && !r.selected)) 
											? "Re-select or add back"
											: "Add back"
										}
									</div>
									{suggestions.map((suggestion) => {
										const isUnselected = recipients.some(r => r.email === suggestion.email && !r.selected);
										return (
											<button
												key={suggestion.email}
												onClick={() => handleSelectSuggestion(suggestion.email)}
												className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center gap-2"
											>
												<div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
													<span className="text-[10px] font-medium text-gray-600">
														{suggestion.email.charAt(0).toUpperCase()}
													</span>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs text-gray-900 truncate">{suggestion.email}</p>
													<p className="text-[10px] text-gray-400">
														{isUnselected ? "Currently unselected" : "Previously removed"}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>
					</div>
					{recipients.length > 0 && (
						<div className="flex items-center gap-2 ml-2">
							<span className="text-xs text-gray-400">
								{selectedCount}/{recipients.length}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSelectAll}
								className="text-xs h-6 px-2"
							>
								{recipients.every(r => r.selected) ? "None" : "All"}
							</Button>
						</div>
					)}
				</div>
				{emailError && (
					<p className="text-xs text-red-500 px-4 pb-2 -mt-1">{emailError}</p>
				)}
			</div>

			{/* Template Preview - takes remaining space */}
			<div className="flex-1 min-h-0 p-4 overflow-hidden">
				<TemplateSelector
					selectedTemplate={selectedTemplate}
					onSelect={setSelectedTemplate}
					customPrompt={customPrompt}
					onCustomPromptChange={setCustomPrompt}
				/>
			</div>

			{/* Footer with save button */}
			<div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 flex justify-end">
				<Button
					onClick={handleSaveSetup}
					disabled={isSaving || !hasChanges}
					className="gap-2"
				>
					{isSaving ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Save className="h-4 w-4" />
					)}
					Save Setup
				</Button>
			</div>
		</div>
	);
};

export default MicrosoftEventDistributionSetup;
