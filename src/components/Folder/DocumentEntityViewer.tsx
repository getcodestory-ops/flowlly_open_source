import React, { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Flex,
  useToast,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { getcontainerEntities } from "@/api/documentRoutes";

function DocumentEntityViewer() {
  const toast = useToast();

  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const { data, isLoading } = useQuery({
    queryKey: ["mediaDocumentList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("no session or project");
      return getcontainerEntities(session!, activeProject?.project_id, "media");
    },
    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  useEffect(() => {
    if (data) {
      console.log("folder", data);
    }
  }, [data]);

  return (
    <Flex>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>File Name</Th>
              <Th>Created At</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody fontSize="xs">
            {data &&
              data.length > 0 &&
              data.map((relation) =>
                relation.storage_relations.map((resource, index) => (
                  <Tr key={index}>
                    {resource.storage_resources && (
                      <>
                        <Td>{resource.storage_resources?.file_name}</Td>
                        <Td>
                          {resource.storage_resources.created_at &&
                            new Date(
                              resource.storage_resources.created_at
                            ).toLocaleDateString()}
                        </Td>
                        <Td>
                          <Text whiteSpace="normal" wordBreak="break-word">
                            {resource.storage_resources.metadata.description}
                          </Text>
                        </Td>
                      </>
                    )}
                  </Tr>
                ))
              )}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}

export default DocumentEntityViewer;
