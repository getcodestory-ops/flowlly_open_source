import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import {
	getApiIntegration,
	getMicrosoftWebhook,
} from "@/api/integration_routes";

// Integration data types
export interface IntegrationData {
	integration_id: string;
	project_id: string;
	integration_type: string;
	access_token?: string;
	refresh_token?: string;
	token_expiry?: string;
	created_at: string;
	updated_at: string;
	[key: string]: unknown;
}

export interface WebhookData {
	subscription_id: string;
	project_id: string;
	subscription_type: "events" | "messages";
	expiration_date: string;
	created_at: string;
	updated_at: string;
	[key: string]: unknown;
}

interface IntegrationStore {
	// Integration states
	microsoftIntegration: IntegrationData | null;
	procoreIntegration: IntegrationData | null;

	// Webhook states
	microsoftCalendarWebhook: WebhookData | null;
	microsoftMailWebhook: WebhookData | null;

	// Loading states
	isLoadingMicrosoft: boolean;
	isLoadingProcore: boolean;
	isLoadingCalendarWebhook: boolean;
	isLoadingMailWebhook: boolean;

	// Error states
	microsoftError: Error | null;
	procoreError: Error | null;

	// Actions to set data
	setMicrosoftIntegration: (data: IntegrationData | null) => void;
	setProcoreIntegration: (data: IntegrationData | null) => void;
	setMicrosoftCalendarWebhook: (data: WebhookData | null) => void;
	setMicrosoftMailWebhook: (data: WebhookData | null) => void;

	// Actions to fetch data
	fetchMicrosoftIntegration: (
		session: Session,
		projectId: string
	) => Promise<void>;
	fetchProcoreIntegration: (
		session: Session,
		projectId: string
	) => Promise<void>;
	fetchMicrosoftCalendarWebhook: (
		session: Session,
		projectId: string
	) => Promise<void>;
	fetchMicrosoftMailWebhook: (
		session: Session,
		projectId: string
	) => Promise<void>;

	// Convenience method to fetch all integrations
	fetchAllIntegrations: (session: Session, projectId: string) => Promise<void>;

	// Clear all data (useful when changing projects)
	clearIntegrations: () => void;

	// Invalidate specific integrations (to trigger refetch)
	invalidateMicrosoft: () => void;
	invalidateProcore: () => void;
}

export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
	// Initial states
	microsoftIntegration: null,
	procoreIntegration: null,
	microsoftCalendarWebhook: null,
	microsoftMailWebhook: null,
	isLoadingMicrosoft: false,
	isLoadingProcore: false,
	isLoadingCalendarWebhook: false,
	isLoadingMailWebhook: false,
	microsoftError: null,
	procoreError: null,

	// Setters
	setMicrosoftIntegration: (data) =>
		set({ microsoftIntegration: data, microsoftError: null }),
	setProcoreIntegration: (data) =>
		set({ procoreIntegration: data, procoreError: null }),
	setMicrosoftCalendarWebhook: (data) =>
		set({ microsoftCalendarWebhook: data }),
	setMicrosoftMailWebhook: (data) => set({ microsoftMailWebhook: data }),

	// Fetch Microsoft integration
	fetchMicrosoftIntegration: async(session, projectId) => {
		set({ isLoadingMicrosoft: true, microsoftError: null });
		try {
			const data = await getApiIntegration(session, projectId, "microsoft");
			set({ microsoftIntegration: data, isLoadingMicrosoft: false });
		} catch (error) {
			console.error("Error fetching Microsoft integration:", error);
			set({
				microsoftIntegration: null,
				microsoftError: error as Error,
				isLoadingMicrosoft: false,
			});
		}
	},

	// Fetch Procore integration
	fetchProcoreIntegration: async(session, projectId) => {
		set({ isLoadingProcore: true, procoreError: null });
		try {
			const data = await getApiIntegration(session, projectId, "procore");
			set({ procoreIntegration: data, isLoadingProcore: false });
		} catch (error) {
			console.error("Error fetching Procore integration:", error);
			set({
				procoreIntegration: null,
				procoreError: error as Error,
				isLoadingProcore: false,
			});
		}
	},

	// Fetch Microsoft calendar webhook
	fetchMicrosoftCalendarWebhook: async(session, projectId) => {
		// Only fetch if Microsoft integration exists
		const { microsoftIntegration } = get();
		if (!microsoftIntegration) {
			set({ microsoftCalendarWebhook: null });
			return;
		}

		set({ isLoadingCalendarWebhook: true });
		try {
			const data = await getMicrosoftWebhook(session, projectId, "events");
			set({
				microsoftCalendarWebhook: data,
				isLoadingCalendarWebhook: false,
			});
		} catch (error) {
			console.error("Error fetching calendar webhook:", error);
			set({
				microsoftCalendarWebhook: null,
				isLoadingCalendarWebhook: false,
			});
		}
	},

	// Fetch Microsoft mail webhook
	fetchMicrosoftMailWebhook: async(session, projectId) => {
		// Only fetch if Microsoft integration exists
		const { microsoftIntegration } = get();
		if (!microsoftIntegration) {
			set({ microsoftMailWebhook: null });
			return;
		}

		set({ isLoadingMailWebhook: true });
		try {
			const data = await getMicrosoftWebhook(session, projectId, "messages");
			set({ microsoftMailWebhook: data, isLoadingMailWebhook: false });
		} catch (error) {
			console.error("Error fetching mail webhook:", error);
			set({ microsoftMailWebhook: null, isLoadingMailWebhook: false });
		}
	},

	// Fetch all integrations at once
	fetchAllIntegrations: async(session, projectId) => {
		const {
			fetchMicrosoftIntegration,
			fetchProcoreIntegration,
			fetchMicrosoftCalendarWebhook,
			fetchMicrosoftMailWebhook,
		} = get();

		// Fetch integrations first
		await Promise.all([
			fetchMicrosoftIntegration(session, projectId),
			fetchProcoreIntegration(session, projectId),
		]);

		// Then fetch webhooks (they depend on Microsoft integration existing)
		await Promise.all([
			fetchMicrosoftCalendarWebhook(session, projectId),
			fetchMicrosoftMailWebhook(session, projectId),
		]);
	},

	// Clear all integrations
	clearIntegrations: () =>
		set({
			microsoftIntegration: null,
			procoreIntegration: null,
			microsoftCalendarWebhook: null,
			microsoftMailWebhook: null,
			microsoftError: null,
			procoreError: null,
		}),

	// Invalidation methods to force refetch
	invalidateMicrosoft: () => set({ microsoftIntegration: null }),
	invalidateProcore: () => set({ procoreIntegration: null }),
}));

