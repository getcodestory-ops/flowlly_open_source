import React, { useState, useEffect, useCallback } from "react";
import { AppWindow, ExternalLink, AlertCircle, RefreshCw, Hammer, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/utils/store";

interface SandboxPreviewTabProps {
	token: string;
	port: number;
	title?: string;
}

const SandboxPreviewTab: React.FC<SandboxPreviewTabProps> = ({ token, port, title }) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	

	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const fetchPreviewUrl = useCallback(async () => {
		if (!session?.access_token || !activeProject?.project_id) {
			setError("Missing session or project information");
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const baseUrl = process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL;
			const url = `${baseUrl}/sandbox-preview/${token}?project_access_id=${activeProject.project_id}`;

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
				redirect: "manual",
			});

			if (!response.ok) {
				throw new Error(`Failed to get preview URL (${response.status})`);
			}

			const result = await response.json();

			if (result?.url) {
				setPreviewUrl(result.url);
			} else {
				throw new Error("No URL returned from server");
			}
		} catch (err) {
			console.error("Error fetching sandbox preview URL:", err);
			setError(err instanceof Error ? err.message : "Failed to load preview");
		} finally {
			setIsLoading(false);
		}
	}, [token, session?.access_token, activeProject?.project_id]);

	useEffect(() => {
		fetchPreviewUrl();
	}, [fetchPreviewUrl]);

	// Fake progress: 0→75% in 20s, 75→80% in next 20s, 80→90% in next 20s, never reaches 100
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		if (!isLoading) return;
		const start = Date.now();
		const frame = () => {
			const elapsed = (Date.now() - start) / 1000;
			let p: number;
			if (elapsed <= 20) {
				p = (elapsed / 20) * 75;
			} else if (elapsed <= 40) {
				p = 75 + ((elapsed - 20) / 20) * 5;
			} else {
				p = 80 + (1 - Math.exp(-(elapsed - 40) / 30)) * 10;
			}
			setProgress(Math.min(p, 90));
		};
		const id = setInterval(frame, 100);
		return () => clearInterval(id);
	}, [isLoading]);

	// Loading state
	if (isLoading) {
		return (
			<div className="w-full h-full flex flex-col bg-gray-50">
				<div className="flex-1 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<div className="flex items-center gap-2">
							<Hammer className="w-4 h-4 text-indigo-600" />
							<span className="text-xs font-medium text-gray-700">Building application...</span>
							<Settings className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: "2.5s" }} />
						</div>
						<div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
							<div
								className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<span className="text-[10px] text-gray-400">{Math.round(progress)}%</span>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="w-full h-full flex flex-col bg-gray-50">
				<div className="flex-1 flex items-center justify-center">
					<div className="flex flex-col items-center gap-3 max-w-sm text-center">
						<AlertCircle className="w-8 h-8 text-red-400" />
						<p className="text-sm text-gray-700 font-medium">Failed to load application</p>
						<p className="text-xs text-gray-500">{error}</p>
						<Button
							className="mt-2"
							onClick={fetchPreviewUrl}
							size="sm"
							variant="outline"
						>
							<RefreshCw className="w-3.5 h-3.5 mr-1.5" />
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Loaded — show iframe
	return (
		<div className="w-full h-full flex flex-col">
			<div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-b border-gray-200">
				<div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
					<AppWindow className="w-3.5 h-3.5 text-indigo-500" />
					<span className="truncate max-w-[300px]">{title || "Live App"}</span>
				</div>
				<div className="flex items-center gap-0.5">
					<button
						className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
						onClick={fetchPreviewUrl}
						title="Reload"
					>
						<RefreshCw className="w-3 h-3" />
					</button>
					<button
						className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
						onClick={() => previewUrl && window.open(previewUrl, "_blank", "noopener,noreferrer")}
						title="Open in browser"
					>
						<ExternalLink className="w-3 h-3" />
					</button>
				</div>
			</div>
			<iframe
				allow="clipboard-read; clipboard-write"
				className="w-full flex-1 border-0"
				src={previewUrl!}
				title={title || "Live App"}
			/>
		</div>
	);
};

export default SandboxPreviewTab;
