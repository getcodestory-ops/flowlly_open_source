import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/utils/store";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  fetchFolders,
  fetchFiles,
  GetFolderFileProp,
  GetFolderSubFolderProp,
} from "@/api/folderRoutes";
import { Folder, File, X, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";

interface DocumentSelectorProps {
  selectedItems: Array<{ id: string; name: string; type: "folder" | "file" }>;
  setSelectedItems: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; name: string; type: "folder" | "file" }>
    >
  >;
}

export default function DocumentSelector({
  selectedItems,
  setSelectedItems,
}: DocumentSelectorProps) {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isProjectWide, setIsProjectWide] = useState(true);

  const { data: foldersData, isLoading: isFoldersLoading } = useQuery({
    queryKey: [
      "folders",
      session?.access_token,
      activeProject?.project_id,
      currentFolderId,
      isProjectWide,
    ],
    queryFn: () => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("Session or active project not available");
      return fetchFolders(
        session,
        activeProject?.project_id,
        currentFolderId,
        isProjectWide
      );
    },
    enabled: !!session && !!activeProject,
  });

  const { data: filesData, isLoading: isFilesLoading } = useQuery({
    queryKey: [
      "files",
      session?.access_token,
      activeProject?.project_id,
      currentFolderId,
      isProjectWide,
    ],
    queryFn: () => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("Session or active project not available");
      return fetchFiles(
        session,
        activeProject?.project_id,
        currentFolderId,
        isProjectWide
      );
    },
    enabled: !!session && !!activeProject,
  });

  const toggleItemSelection = (item: {
    id: string;
    name: string;
    type: "folder" | "file";
  }) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const removeSelectedItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <div className="space-y-4">
        <Label className="text-sm font-semibold">
          Select Files and Folders
        </Label>
        <Card className="border">
          <CardHeader className="flex justify-between items-center  ">
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="ghost"
                onClick={() => setCurrentFolderId(null)}
                disabled={!currentFolderId}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
              </Button>
              <Select
                value={isProjectWide ? "project" : "personal"}
                onValueChange={(value) => setIsProjectWide(value === "project")}
              >
                <SelectTrigger className="tex-sm">
                  <SelectValue placeholder="Select Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[300px]">
              {isFoldersLoading || isFilesLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {foldersData?.map((folder: GetFolderSubFolderProp) => (
                    <div
                      key={folder.id}
                      className={clsx(
                        "flex items-center p-3 hover:bg-gray-50 cursor-pointer",
                        {
                          "bg-gray-100": selectedItems.some(
                            (item) => item.id === folder.id
                          ),
                        }
                      )}
                      onClick={() => {
                        toggleItemSelection({
                          id: folder.id,
                          name: folder.name,
                          type: "folder",
                        });
                        setCurrentFolderId(folder.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        className="mr-3"
                        checked={selectedItems.some(
                          (item) => item.id === folder.id
                        )}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleItemSelection({
                            id: folder.id,
                            name: folder.name,
                            type: "folder",
                          });
                        }}
                      />
                      <Folder className="mr-2 text-blue-500" size={12} />
                      <span
                        className="flex-1 text-sm truncate"
                        title={folder.name}
                      >
                        {folder.name}
                      </span>
                    </div>
                  ))}
                  {filesData?.map((folder: GetFolderFileProp) => (
                    <div key={folder.id}>
                      {folder?.storage_relations?.map((file) => (
                        <div key={file.storage_resources?.id}>
                          {file.storage_resources && (
                            <div
                              key={file.storage_resources.id}
                              className={clsx(
                                "flex items-center p-3 hover:bg-gray-50 cursor-pointer",
                                {
                                  "bg-gray-100": selectedItems.some(
                                    (item) =>
                                      item.id === file.storage_resources?.id
                                  ),
                                }
                              )}
                              onClick={() =>
                                toggleItemSelection({
                                  id: file.storage_resources?.id || "",
                                  name: file.storage_resources?.file_name || "",
                                  type: "file",
                                })
                              }
                            >
                              <input
                                type="checkbox"
                                className="mr-3"
                                checked={selectedItems.some(
                                  (item) =>
                                    item.id === file.storage_resources?.id
                                )}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleItemSelection({
                                    id: file.storage_resources?.id || "",
                                    name:
                                      file.storage_resources?.file_name || "",
                                    type: "file",
                                  });
                                }}
                              />
                              <File className="mr-2 text-green-500" size={12} />
                              <span
                                className="flex-1 text-sm truncate"
                                title={file.storage_resources?.file_name}
                              >
                                {file.storage_resources?.file_name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Items Section */}

      <div className="mt-4 space-y-2">
        <Label className="text-sm font-semibold">Selected Items</Label>

        <Card className="border max-h-60 overflow-y-auto p-3">
          <ScrollArea className="h-[200px]">
            {selectedItems.length === 0 ? (
              <div className="text-center text-gray-500">
                No items selected.
              </div>
            ) : (
              selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2  "
                >
                  <div className="flex items-center text-sm flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedItem(item.id)}
                    >
                      <X size={12} />
                    </Button>
                    {item.type === "folder" ? (
                      <Folder
                        className="mr-2 text-blue-500 flex-shrink-0"
                        size={12}
                      />
                    ) : (
                      <File
                        className="mr-2 text-green-500 flex-shrink-0"
                        size={12}
                      />
                    )}

                    <span className="truncate" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>
      </div>
    </>
  );
}
