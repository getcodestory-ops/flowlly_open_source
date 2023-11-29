import React, { use, useEffect, useState } from "react";
import {
  Flex,
  Text,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalCloseButton,
  Box,
  ModalContent,
  ModalHeader,
  Button,
  Icon,
  Select,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { getActivityContingencyPlan } from "@/api/activity_routes";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

function ContingencyPage() {
  const { session, activeProject, setRightPanelView } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setRightPanelView: state.setRightPanelView,
  }));
  const [contingencySelected, setContingencySelected] = useState<any>(null);

  const { data: ProjectContingencyPlans } = useQuery({
    queryKey: ["getProjectContingencyPlan", session, activeProject],
    queryFn: () => {
      if (!activeProject) return Promise.reject("No active project");
      return getActivityContingencyPlan(session!, activeProject?.project_id);
    },
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    console.log("contingency plan", ProjectContingencyPlans);
  }, [ProjectContingencyPlans]);

  useEffect(() => {
    console.log("contingencySelected", contingencySelected);
  }, [contingencySelected]);

  const handleContingencyChange = (e: any) => {
    const selectedIndex = e.target.value;
    const selectedPlan =
      ProjectContingencyPlans &&
      ProjectContingencyPlans[0].contingency_plan[selectedIndex];
    setContingencySelected(selectedPlan);
  };

  return (
    <Flex direction={"column"} p={"4"}>
      <Button
        p={"2"}
        size={"sm"}
        w={"110px"}
        onClick={() => setRightPanelView("gantt")}
      >
        Back to Gantt
      </Button>
      <Flex
        border={"1px"}
        rounded={"md"}
        borderColor={"gray.200"}
        mt={"4"}
        w={"260px"}
      >
        <Select
          size={"sm"}
          className="normal-selector"
          onChange={handleContingencyChange}
        >
          {!contingencySelected ? (
            <option>Open Existing Contingency</option>
          ) : null}
          {ProjectContingencyPlans &&
            ProjectContingencyPlans[0].contingency_plan.map(
              (plan: any, index: any) => (
                <option value={index} key={index}>
                  {plan.revision.created_at} Impact:
                  {plan.revision.probability && plan.revision.probability > 0.6
                    ? " High"
                    : " Low"}
                </option>
              )
            )}
        </Select>
      </Flex>
      <Flex mt={"6"} fontSize={"sm"}>
        {contingencySelected && (
          <Flex direction={"column"} overflowY={"auto"} h={"40%"}>
            {/* <Text whiteSpace={"pre-wrap"}>
              {JSON.stringify(contingencySelected, null, 2)}
            </Text> */}
            <Text as={"b"}>Assesment:</Text>
            <Flex p={"2"}>
              <Text whiteSpace={"pre-wrap"}>
                {contingencySelected.revision.analysis}
              </Text>
            </Flex>
            <Text as={"b"} mt={"4"}>
              Remediation Plan:
            </Text>
            <Flex p={"2"}>
              <Text whiteSpace={"pre-wrap"}>
                {contingencySelected.contingency_plan}
              </Text>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default ContingencyPage;
