import React, { useEffect, useRef } from "react";
import { Grid, GridItem, Flex, Text } from "@chakra-ui/react";
import { getDocuments } from "@/api/documentRoutes";
import { LuFileText } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import Link from "next/link";
import { useRouter } from "next/router";

interface DocumentListProps {
  setNoteTitle?: any;
}

function DocumentList({ setNoteTitle }: DocumentListProps) {
  const router = useRouter();
  const { projectId } = router.query;
  const { session, activeProject, taskToView, setDocumentId, documentId } =
    useStore((state) => ({
      session: state.session,
      activeProject: state.activeProject,
      taskToView: state.taskToView,
      setDocumentId: state.setDocumentId,
      documentId: state.documentId,
    }));

  const {
    data: documents,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["documentList", session, activeProject, taskToView],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("Set session first !");
      }
      return getDocuments(
        session,
        activeProject.project_id,
        taskToView.id === "SCHEDULE" ? undefined : taskToView.id
      );
    },

    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  const afterClick = (id: any, title: any) => {
    setDocumentId(id);
    setNoteTitle(title);
  };

  useEffect(() => {
    console.log("documents", documents);
  }, [documents]);

  return (
    <Flex
      w="full"
      overflowY={"scroll"}
      overscrollBehaviorY={"contain"}
      direction={"column"}
    >
      {/* <GridItem
        fontSize="14px"
        fontWeight="bold"
        borderBottom={"2px solid"}
        borderColor="brand.light"
        key="document-container"
        rowSpan={1}
      >
        My Notes
      </GridItem> */}
      {documents &&
        documents.length > 0 &&
        documents.map((document) => (
          // <Link
          //   href={{
          //     pathname: `documents/editor`,
          //     query: {
          //       id: document.id,
          //       title: document.title,
          //       projectId: projectId,
          //     }, // Pass the query parameters
          //   }}
          //   key={document.id}
          // >
          <Flex
            w="full"
            mb={"2"}
            py={"4"}
            fontSize="14px"
            key={document.id}
            background={"brand.gray"}
            cursor={"pointer"}
            display="flex"
            flexDirection="column"
            borderRadius={"md"}
            onClick={() => afterClick(document.id, document.title)}
            _hover={{ bg: "brand.dark", color: "white" }}
          >
            <Flex
              w="full"
              justifyContent={"center"}
              h={"full"}
              alignItems={"center"}
            >
              {document.title}
            </Flex>
          </Flex>
          // </Link>
        ))}
    </Flex>
  );
}

export default DocumentList;
