import React, { useState } from "react";
import { Flex, Tooltip, Button, Icon } from "@chakra-ui/react";
import { getScheduleSummary } from "@/api/schedule_routes";
import { FaMagic } from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";

import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";

function ScheduleSummaryView() {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [editableContent, setEditableContent] = useState("");

  const { data } = useQuery({
    queryKey: ["scheduleSummaryDaily", activeProject, session],
    queryFn: () => {
      if (!session || !activeProject)
        return Promise.reject("no session or project");
      return getScheduleSummary(session, activeProject.project_id);
    },
    refetchInterval: 1000,
    enabled: !!session,
  });

  return (
    <Flex direction="column" gap="4">
      <Flex gap="8">
        <Tooltip label="Incorporate Changes" bg="white" color="brand.dark">
          <Button
            boxShadow={"lg"}
            cursor={"pointer"}
            size={"sm"}
            bg={"white"}
            _hover={{ bg: "brand.dark", color: "white" }}
          >
            <Icon
              as={FaMagic}
              _hover={{
                transform: "rotate(360deg)",

                transition: "transform 0.5s ease-in-out",
              }}
            />
          </Button>
        </Tooltip>
        <Tooltip label="Daily" bg="white" color="brand.dark">
          <Button
            boxShadow={"lg"}
            cursor={"pointer"}
            size={"sm"}
            bg={"white"}
            _hover={{ bg: "brand.dark", color: "white" }}
          >
            <Icon as={HiOutlineDocumentReport} />
          </Button>
        </Tooltip>
      </Flex>
      {data?.data && (
        <pre
          contentEditable
          style={{ overflow: "auto", whiteSpace: "pre-wrap", padding: "1rem" }}
          onInput={(e) => setEditableContent(e.currentTarget.textContent || "")}
        >
          {data.data}
        </pre>
      )}
    </Flex>
  );
}

export default ScheduleSummaryView;
