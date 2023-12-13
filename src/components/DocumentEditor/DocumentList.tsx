import React, { useEffect, useRef } from "react";
import { Grid, GridItem, Flex, Text } from "@chakra-ui/react";
import { getDocuments } from "@/api/documentRoutes";
import { LuFileText } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import Link from "next/link";
import { useRouter } from "next/router";

function DocumentList() {
  const router = useRouter();
  const { projectId } = router.query;
  const { session, activeProject, taskToView } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    taskToView: state.taskToView,
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

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={6} p={5}>
      <GridItem
        py="4"
        fontSize="xl"
        fontWeight="bold"
        borderBottom={"2px solid"}
        borderColor="brand.light"
        key="document-container"
        colSpan={4}
      >
        My documents
      </GridItem>
      {documents &&
        documents.length > 0 &&
        documents.map((document) => (
          // <Link
          //   href={{
          //     pathname: `${router.pathname}/editor`,
          //     query: {
          //       id: document.id,
          //       title: document.title,
          //       projectId: projectId,
          //     }, // Pass the query parameters
          //   }}
          //   key={document.id}
          // >
          <GridItem
            py="4"
            fontSize="xl"
            key={document.id}
            background={"brand.dark"}
            cursor={"pointer"}
            minH="36"
            display="flex"
            flexDirection="column"
            justifyContent={"flex-end"}
            borderRadius={"md"}
            color={"white"}
            onClick={() => {
              router.push({
                pathname: `${router.pathname}/editor`,
                query: {
                  ...router.query,
                  id: document.id,
                  title: document.title,
                },
              });
            }}
          >
            <Flex w="full" justifyContent={"center"}></Flex>
            <Flex w="full" justifyContent={"center"}>
              {document.title}
            </Flex>
          </GridItem>
          // </Link>
        ))}
    </Grid>
  );
}

export default DocumentList;
