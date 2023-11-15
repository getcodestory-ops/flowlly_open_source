import { useToast } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { CreateNewActivity } from "@/types/activities";
import { ACTIVITY_KEYS } from "./activity_keys";
import { uploadCSVData } from "@/api/activity_routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";

export const useCSVUploader = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // [1]
  const [isModalOpen, setModalOpen] = useState(false);
  const [unmatchedHeaders, setUnmatchedHeaders] = useState<string[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [headerMappings, setHeaderMappings] = useState<
    Record<string, string | null>
  >({});

  const handleHeaderMappingChange = (
    csvHeader: string,
    value: keyof CreateNewActivity
  ) => {
    setHeaderMappings((prev) => ({ ...prev, [csvHeader]: value }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: uploadCSVData,
    onSuccess: () => {
      setModalOpen(false); // Close the modal after confirming
      toast({
        title: "Success",
        description: "CSV data uploaded successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["activityList"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const handleUpload = () => {
    const projectId = activeProject?.project_id;

    const file = fileRef.current?.files?.[0];
    if (!session || !file || !projectId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("headerMappings", JSON.stringify(headerMappings));
    mutate({ session, projectId, formData });
  };

  const handleCsvFileHeaderCheck = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUnmatchedHeaders([]);

    const reader = new FileReader();

    reader.onload = (e) => {
      const notmatchedHeaders: string[] = [];
      const content = e.target?.result as string;
      const [csv_headers, ...rows] = content
        .split("\n")
        .map((row) => row.replace("\r", "").split(","));

      setCsvHeaders(csv_headers);

      Object.keys(ACTIVITY_KEYS).map((header) => {
        const matchedKey = csv_headers.find(
          (key) => key.toLowerCase() === header.toLowerCase()
        );
        setHeaderMappings((prev) => ({
          ...prev,
          [header]: matchedKey ?? null,
        }));
        if (!matchedKey) notmatchedHeaders.push(header);
      });
      setUnmatchedHeaders(notmatchedHeaders);
      if (notmatchedHeaders.length > 0) setModalOpen(true);
    };

    reader.readAsText(file);
  };

  return {
    fileRef,
    isModalOpen,
    unmatchedHeaders,
    csvHeaders,
    headerMappings,
    isPending,
    selectedFile,
    setHeaderMappings,
    setSelectedFile,
    handleHeaderMappingChange,
    handleUpload,
    handleCsvFileHeaderCheck,
    setModalOpen,
  };
};
