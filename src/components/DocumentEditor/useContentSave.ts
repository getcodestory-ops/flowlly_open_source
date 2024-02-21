import { useState, useEffect, useRef } from "react";
import {
  updateDocumentContent,
  getDocumentContent,
} from "@/api/documentRoutes";
import { processDocumentContent } from "@/api/schedule_routes";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import type { OutputData } from "@editorjs/editorjs";
import type EditorJS from "@editorjs/editorjs";

export const useContentSave = (id?: string | string[]) => {
  const [data, setData] = useState<OutputData>();
  const ref = useRef<EditorJS>();
  const toast = useToast();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const {
    data: content,
    isLoading,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["documentContent", session, id, activeProject],
    queryFn: () => {
      if (!session || typeof id !== "string" || !activeProject) {
        console.log("Either session or document id is not valid !");
        return Promise.reject("Either session or document id is not valid !");
      }
      return getDocumentContent(session, id, activeProject.project_id);
    },

    enabled: !!session?.access_token && !!id && !!activeProject,
  });

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    console.log(error);
  }, [error]);

  useEffect(() => {
    console.log("content", content);
    if (isLoading) {
      setData({
        blocks: [
          { data: { text: "loading..." }, id: "HVVp3toaI3", type: "paragraph" },
        ],
      });
      return;
    }
    if (content && isSuccess) {
      setData(content);
    } else {
      setData({ blocks: [] });
    }
  }, [content, isLoading, isSuccess]);

  //save document

  const { mutate, isPending } = useMutation({
    mutationFn: (data: OutputData) => {
      if (!session || typeof id !== "string")
        return Promise.reject(
          "Session not found or document id is not correct !"
        );
      return updateDocumentContent(session, id, data);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Document saved successfully !`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    },
  });

  async function onSubmit() {
    const blocks = await ref.current?.save();

    if (!blocks) return;
    mutate(blocks);
  }

  // process document

  const { mutate: processDoc, isPending: docPending } = useMutation({
    mutationFn: () => {
      if (!session || typeof id !== "string" || !activeProject)
        return Promise.reject(
          "Session not found or document id is not correct !"
        );
      return processDocumentContent(session, activeProject.project_id, id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Document Processed successfully !`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    },
  });

  return { ref, processDoc, data, mutate, onSubmit, content };
};
