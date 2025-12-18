import { Loader2 } from "lucide-react";

// Middleware handles auth check and redirect to /project/[id]/agent
// This page only shows briefly during the server-side redirect
export default function ProjectPage() {
	return (
		<div className="flex items-center justify-center h-screen">
			<Loader2 className="animate-spin" size={64} />
		</div>
	);
}
