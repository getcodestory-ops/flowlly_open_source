import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getApiIntegration, createExcelSheet } from "@/api/integration_routes";
import { useStore } from "@/utils/store";
import {
	MicrosoftExcelNodeConfig,
	NodeStatus,
	NodeType,
	WorkflowNode,
} from "../../types";
import { useQuery, useMutation } from "@tanstack/react-query";

interface MicrosoftExcelNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function MicrosoftExcelNode({
	onSave,
	onCancel,
	editingNode,
}: MicrosoftExcelNodeProps) {
	const [config, setConfig] = useState<MicrosoftExcelNodeConfig>({
		sheet_name: "",
		columns: [],
		operation: "append",
		table_id: "",
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));
	const { toast } = useToast();
	const [isIntegrated, setIsIntegrated] = useState(false);
	const [sheetName, setSheetName] = useState(
		(editingNode?.config as any)?.sheetName || "",
	);
	const [loading, setLoading] = useState(false);
	const [authUrl, setAuthUrl] = useState<string | null>(null);
	const [columns, setColumns] = useState<string[]>(
		(editingNode?.config as any)?.columns || [],
	);
	const [newColumn, setNewColumn] = useState("");

	const [tableId, setTableId] = useState<string>(
		(editingNode?.config as any)?.tableId || "",
	);
	const [microsoftConnected, setMicrosoftConnected] = useState(false);
	const { data: integration } = useQuery({
		queryKey: ["integration", activeProject?.project_id],
		queryFn: () => getApiIntegration(session!, activeProject?.project_id!),
		enabled: !!session && !!activeProject?.project_id,
	});

	useEffect(() => {
		setIsIntegrated(!!integration);
	}, [integration]);

	const { mutate, isPending } = useMutation({
		mutationFn: ({
			sheetName,
			columns,
		}: {
      sheetName: string;
      columns: string[];
    }) =>
			createExcelSheet(session!, activeProject!.project_id, sheetName, columns),
		onSuccess: (response) => {
			//console.log(response);
			setTableId(response.table_id);
			toast({
				title: "Success",
				description: "Excel sheet created successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to create Excel sheet",
				variant: "destructive",
			});
		},
	});

	const handleMicrosoftConnect = async() => {
		if (!microsoftConnected) {
			const sessionToken = session?.access_token;
			const userId = session?.user?.id;
			const projectId = activeProject?.project_id;
			if (!sessionToken || !userId || !projectId) {
				return;
			}
			// Redirect to Microsoft OAuth login with specific scopes for Excel
			const params = new URLSearchParams({
				client_id: "5f3afbcd-94ce-4a50-9721-79136b5d4c1e",
				response_type: "code",
				redirect_uri:
          "https://flowlly.eastus.cloudapp.azure.com/microsoft/integration",
				response_mode: "query",
				scope:
          "openid profile Sites.Read.All Files.ReadWrite.All OnlineMeetings.Read Calendars.ReadWrite ",
				state: sessionToken + "___" + userId + "___" + projectId,
			});

			const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
			window.location.href = authUrl;
		} else {
			try {
				await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft/disconnect`,
					{
						method: "POST",
						credentials: "include",
					},
				);
				setMicrosoftConnected(false);
			} catch (error) {
				console.error("Failed to disconnect:", error);
			}
		}
	};

	const createNewExcelSheet = async() => {
		if (
			!sheetName ||
      columns.length === 0 ||
      !activeProject?.project_id ||
      !session
		) {
			toast({
				title: "Error",
				description: "Please provide sheet name and at least one column",
				variant: "destructive",
			});
			return;
		}

		// Ensure sheetName ends with .xlsx
		const formattedSheetName = sheetName.endsWith(".xlsx")
			? sheetName
			: `${sheetName}.xlsx`;

		mutate({
			sheetName: formattedSheetName,
			columns,
		});
	};

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				{!isIntegrated ? (
					<div className="space-y-4">
						<div className="text-sm text-yellow-600">
              Microsoft integration is required for Excel operations
						</div>
						<Button disabled={loading} onClick={handleMicrosoftConnect}>
							{loading ? "Connecting..." : "Connect to Microsoft"}
						</Button>
					</div>
				) : (
					<div className="space-y-2">
						<Label htmlFor="sheetName">Excel Sheet Name</Label>
						<Input
							id="sheetName"
							onChange={(e) => setSheetName(e.target.value)}
							placeholder="Enter sheet name"
							value={sheetName}
						/>
						<div className="mt-4 space-y-2">
							<Label>Columns</Label>
							<div className="flex space-x-2">
								<Input
									onChange={(e) => setNewColumn(e.target.value)}
									placeholder="Enter column name"
									value={newColumn}
								/>
								<Button
									onClick={() => {
										if (newColumn.trim()) {
											setColumns([...columns, newColumn.trim()]);
											setNewColumn("");
										}
									}}
									type="button"
								>
                  Add
								</Button>
							</div>
							{columns.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-2">
									{columns.map((column, index) => (
										<div
											className="flex items-center bg-secondary px-3 py-1 rounded-md"
											key={index}
										>
											<span>{column}</span>
											<button
												className="ml-2 text-sm text-destructive hover:text-destructive/80"
												onClick={() => {
													setColumns(columns.filter((_, i) => i !== index));
												}}
											>
                        ×
											</button>
										</div>
									))}
								</div>
							)}
						</div>
						<Button
							className="mt-2"
							disabled={isPending || !sheetName || columns.length === 0}
							onClick={createNewExcelSheet}
							type="button"
							variant="secondary"
						>
							{isPending ? (
								<>
									<span className="loading loading-spinner" />
                  Creating Sheet...
								</>
							) : (
								"Create Excel Sheet"
							)}
						</Button>
					</div>
				)}
				<div className="flex justify-end space-x-2">
					<Button
						onClick={onCancel}
						type="button"
						variant="outline"
					>
            Cancel
					</Button>
					<Button
						disabled={!isIntegrated || !sheetName || !tableId}
						onClick={() => {
							const formattedSheetName = sheetName.endsWith(".xlsx")
								? sheetName
								: `${sheetName}.xlsx`;

							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.EXCEL,
								title: "Excel Step",
								status: NodeStatus.PENDING,
								timestamp: new Date().toISOString(),
								retry_count: 0,
								config: {
									...config,
									sheet_name: formattedSheetName,
									columns: columns.map((column) => ({
										name: column,
										sourceField: column,
										dataType: "string",
									})),
									table_id: tableId,
								},
							});
						}}
						type="button"
					>
						{editingNode ? "Update" : "Add"} Node
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
