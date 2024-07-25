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
import { jsonToHtml } from "@/utils/jsonToHtml";

export const useContentSave = (id?: string | string[]) => {
  const [content, setContent] = useState<string | null>(null);
  const ref = useRef<EditorJS>();
  const toast = useToast();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const { data, isLoading, isSuccess, error } = useQuery({
    queryKey: ["documentContent", session, id, activeProject],
    queryFn: () => {
      if (!session || typeof id !== "string" || !activeProject) {
        console.log("Either session or document id is not valid !");
        return Promise.reject("Either session or document id is not valid !");
      }
      return getDocumentContent(session, id, activeProject.project_id);
    },

    enabled: !!session?.access_token && !!id && !!activeProject,
    placeholderData: " Loading...",
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
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      console.log("loading...");
    }
    if (data && isSuccess) {
      console.log("success!");
      if (typeof data === "string") setContent(data);
      else if (data.blocks) setContent(jsonToHtml(data.blocks));
    } else {
      console.log("no content found!");
    }
  }, [data, isLoading, isSuccess]);

  //save document

  const { mutate, isPending } = useMutation({
    mutationFn: (content: string) => {
      if (!session || typeof id !== "string")
        return Promise.reject(
          "Session not found or document id is not correct !"
        );
      return updateDocumentContent(session, id, content);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not save the document !",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
  });

  async function onSubmit(contentData: string) {
    mutate(contentData);
  }

  // const { mutate: processDoc, isPending: docPending } = useMutation({
  //   mutationFn: () => {
  //     if (!session || typeof id !== "string" || !activeProject)
  //       return Promise.reject(
  //         "Session not found or document id is not correct !"
  //       );
  //     return processDocumentContent(session, activeProject.project_id, id);
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       status: "error",
  //       duration: 4000,
  //       isClosable: true,
  //     });
  //   },
  //   onSuccess: () => {
  //     toast({
  //       title: "Success",
  //       description: `Document Processed successfully !`,
  //       status: "success",
  //       duration: 4000,
  //       isClosable: true,
  //       position: "bottom-right",
  //     });
  //   },
  // });

  return {
    ref,
    data,
    onSubmit,
    content,
    setContent,
    isLoading,
  };
};
