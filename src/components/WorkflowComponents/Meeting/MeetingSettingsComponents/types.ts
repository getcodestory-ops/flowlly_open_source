export interface Participant {
	id: string;
	name: string;
	email: string;
	isOwner: boolean;
	canCommentAgenda: boolean;
	canCommentMinutes: boolean;
}

export interface TemplateField {
	id: string;
	label: string;
	type: "text" | "date" | "time" | "list" | "section";
	required: boolean;
	placeholder?: string;
} 