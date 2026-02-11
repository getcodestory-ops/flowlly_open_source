/**
 * New user tips configuration.
 * Each "message" has a unique ID - when we add new tips, bump the ID
 * so users who've dismissed previous tips will see the new content.
 */
export const NEW_USER_TIPS_MESSAGE_ID = "flowlly-tips-v1";

const LS_KEY = "flowlly_dismissed_tips";

export interface NewUserTip {
	label: string;
	description: string;
	prompt: string;
	emoji: string;
}

export const newUserTips: NewUserTip[] = [
	{
		label: "FE Modelling",
		description: "Structural analysis with OpenSeesPy & Excel output",
		prompt: "Perform an AISC DG11 floor vibration analysis using OpenSeesPy for FEA. Build the input model in Excel, run the analysis, and deliver results as an Excel report with a 3D visualization of the mode shapes.",
		emoji: "🔬",
	},
	{
		label: "3D Models",
		description: "Generate 3D models from drawings as GLB files",
		prompt: "Analyze the attached drawing and create an accurate 3D model of the structure. Export and deliver the final model as a .glb file ready for viewing.",
		emoji: "🏗️",
	},
	{
		label: "2D Plans",
		description: "Create 2D plans and diagrams with Excalidraw",
		prompt: "Using Excalidraw, create a clear 2D visual plan of the construction schedule showing phases, milestones, and key dependencies in an easy-to-read layout.",
		emoji: "📐",
	},
	{
		label: "Advanced Analysis",
		description: "Build financial projections and data models in Excel",
		prompt: "Using the attached financial data, build a projection model in Excel with revenue forecasts, cost breakdowns, and scenario analysis for the next 12 months.",
		emoji: "📊",
	},
];

export function getDismissedMessageIds(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as string[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function markMessageAsDismissed(messageId: string): void {
	if (typeof window === "undefined") return;
	try {
		const existing = getDismissedMessageIds();
		if (existing.includes(messageId)) return;
		const updated = [...existing, messageId];
		localStorage.setItem(LS_KEY, JSON.stringify(updated));
	} catch {
		// ignore
	}
}

export function shouldShowTips(messageId: string): boolean {
	return !getDismissedMessageIds().includes(messageId);
}

// ── Focus-mode nudge ──────────────────────────────────────────────
export const FOCUS_MODE_NUDGE_ID = "flowlly-focus-nudge-v1";
