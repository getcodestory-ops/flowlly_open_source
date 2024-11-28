import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getApiIntegration, createExcelSheet } from "@/api/integration_routes";
import { useStore } from "@/utils/store";
import { WorkflowNode } from "../../types";
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
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));
  const { toast } = useToast();
  const [isIntegrated, setIsIntegrated] = useState(false);
  const [sheetName, setSheetName] = useState(
    (editingNode?.config as any)?.sheetName || ""
  );
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>(
    (editingNode?.config as any)?.columns || []
  );
  const [newColumn, setNewColumn] = useState("");
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [tableId, setTableId] = useState<string>(
    (editingNode?.config as any)?.tableId || ""
  );

  const { data: integration } = useQuery({
    queryKey: ["integration", activeProject?.project_id],
    queryFn: () => getApiIntegration(session!, activeProject?.project_id!),
    enabled: !!session && !!activeProject?.project_id,
  });

  useEffect(() => {
    setIsIntegrated(!!integration);
  }, [integration]);

  const createSheetMutation = useMutation({
    mutationFn: ({
      sheetName,
      columns,
    }: {
      sheetName: string;
      columns: string[];
    }) =>
      createExcelSheet(session!, activeProject!.project_id, sheetName, columns),
    onSuccess: (response) => {
      console.log(response);
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

  const handleIntegration = async () => {
    // setLoading(true);
    // try {
    //   const projectAccessId = activeProject?.project_id;
    //   if (!projectAccessId) {
    //     setIsIntegrated(false);
    //     return;
    //   }
    //   // Initialize OAuth flow
    //   const authData = await loginWithMicrosoft(
    //     session!.access_token,
    //     projectAccessId
    //   );
    //   if (authData.authUrl) {
    //     // Open popup for Microsoft login
    //     const popup = window.open(
    //       authData.authUrl,
    //       "Microsoft Login",
    //       "width=600,height=600"
    //     );
    //     // Listen for OAuth callback
    //     window.addEventListener("message", async (event) => {
    //       if (event.data.type === "MICROSOFT_AUTH_CALLBACK") {
    //         const { code } = event.data;
    //         popup?.close();
    //         // Exchange code for token
    //         await getMicrosoftToken(
    //           session!.access_token,
    //           projectAccessId,
    //           code
    //         );
    //         setIsIntegrated(true);
    //         toast({
    //           title: "Success",
    //           description: "Microsoft integration completed successfully",
    //         });
    //       }
    //     });
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to integrate with Microsoft",
    //     variant: "destructive",
    //   });
    // }
    // setLoading(false);
  };

  const createNewExcelSheet = async () => {
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

    createSheetMutation.mutate({
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
            <Button onClick={handleIntegration} disabled={loading}>
              {loading ? "Connecting..." : "Connect to Microsoft"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="sheetName">Excel Sheet Name</Label>
            <Input
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Enter sheet name"
            />

            <div className="mt-4 space-y-2">
              <Label>Columns</Label>
              <div className="flex space-x-2">
                <Input
                  value={newColumn}
                  onChange={(e) => setNewColumn(e.target.value)}
                  placeholder="Enter column name"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newColumn.trim()) {
                      setColumns([...columns, newColumn.trim()]);
                      setNewColumn("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>

              {columns.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {columns.map((column, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-secondary px-3 py-1 rounded-md"
                    >
                      <span>{column}</span>
                      <button
                        onClick={() => {
                          setColumns(columns.filter((_, i) => i !== index));
                        }}
                        className="ml-2 text-sm text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={isCreatingSheet || !sheetName || columns.length === 0}
              onClick={createNewExcelSheet}
              className="mt-2"
            >
              {isCreatingSheet ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating Sheet...
                </>
              ) : (
                "Create Excel Sheet"
              )}
            </Button>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!isIntegrated || !sheetName || !tableId}
            onClick={() => {
              const formattedSheetName = sheetName.endsWith(".xlsx")
                ? sheetName
                : `${sheetName}.xlsx`;

              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: "microsoftExcel",
                config: {
                  sheetName: formattedSheetName,
                  columns,
                  tableId,
                },
              });
            }}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
