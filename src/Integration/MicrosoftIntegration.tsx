import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiIntegration } from "@/api/integration_routes";
import { useStore } from "@/utils/store";

interface Email {
  id: string;
  subject: string;
  from: string;
  receivedDateTime: string;
  bodyPreview: string;
}

export function MicrosoftIntegration() {
	const [emails, setEmails] = useState<Email[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));
	const [microsoftConnected, setMicrosoftConnected] = useState(false);
	const { data: integration } = useQuery({
		queryKey: ["integration", activeProject?.project_id],
		queryFn: () => getApiIntegration(session!, activeProject?.project_id!),
		enabled: !!session && !!activeProject?.project_id,
	});

	useEffect(() => {
		setMicrosoftConnected(!!integration);
	}, [integration]);

	useEffect(() => {
		const fetchEmails = async() => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/microsoft/emails`,
					{
						credentials: "include",
					},
				);

				if (!response.ok) {
					throw new Error("Failed to fetch emails");
				}

				const data = await response.json();
				setEmails(data.emails);
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "Failed to fetch emails",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchEmails();
	}, []);

	if (loading) return <div>Loading emails...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold">Recent Emails</h2>
			<div className="space-y-2">
				{emails.map((email) => (
					<div className="border p-4 rounded-lg" key={email.id}>
						<h3 className="font-semibold">{email.subject}</h3>
						<p className="text-sm text-gray-600">From: {email.from}</p>
						<p className="text-sm text-gray-600">
              Received: {new Date(email.receivedDateTime).toLocaleString()}
						</p>
						<p className="mt-2">{email.bodyPreview}</p>
					</div>
				))}
			</div>
		</div>
	);
}
