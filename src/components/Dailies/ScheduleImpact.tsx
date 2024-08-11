import React, { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { useScheduleImpact } from "./useScheduleImpact";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Textarea,
  Input,
  Icon,
  Editable,
  EditableInput,
  EditablePreview,
} from "@chakra-ui/react";
import { ActivityRevisionEntity, Revision } from "@/types/activities";
import { FaCheck } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";

function ScheduleImpact({ impactDate }: { impactDate: string }) {
  const { scheduleRevision, updateActivity, rejectActivityRevision } =
    useScheduleImpact(impactDate);
  const [data, _setData] = React.useState<ActivityRevisionEntity[]>([]);

  useEffect(() => {
    if (scheduleRevision) {
      _setData(scheduleRevision.data);
    }
  }, [scheduleRevision]);

  const approve = (id: string, revision: Revision) => {
    updateActivity({ id: id, revision: revision });
  };

  return (
    <Box width="100%" fontSize={"sm"}>
      {data && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Message</Th>
              <Th>Impact</Th>
              <Th>Impact on Start Date</Th>
              <Th>Impact on End Date</Th>
              <Th>Approve/Reject</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data &&
              data.map((activity, index) =>
                activity.activity_revision.map((revision, revisionIndex) => (
                  <Tr key={`${index}-${revisionIndex}`}>
                    <Td> {revisionIndex === 0 && activity.name}</Td>
                    <Td>{revision.activity_history.history.message}</Td>
                    <Td>
                      <Editable
                        defaultValue={revision.activity_history.history.impact}
                        onSubmit={(newValue) => {
                          // Update the revision with the new value
                          revision.activity_history.history.impact = newValue;
                        }}
                      >
                        <EditablePreview />
                        <EditableInput as={Textarea} />
                      </Editable>
                    </Td>
                    <Td>
                      <Editable
                        defaultValue={revision.revision.impact_on_start_date.toString()}
                        onSubmit={(newValue) => {
                          revision.revision.impact_on_start_date =
                            parseInt(newValue);
                        }}
                      >
                        <EditablePreview />
                        <EditableInput type="number" />
                      </Editable>
                    </Td>
                    <Td>
                      <Editable
                        defaultValue={revision.revision.impact_on_end_date.toString()}
                        onSubmit={(newValue) => {
                          revision.revision.impact_on_end_date =
                            parseInt(newValue);
                        }}
                      >
                        <EditablePreview />
                        <EditableInput type="number" />
                      </Editable>
                    </Td>
                    <Td>
                      <Flex gap="2">
                        <Icon
                          size="xs"
                          color={
                            revision.status === "approved"
                              ? "green.500"
                              : "gray"
                          }
                          cursor="pointer"
                          as={FaCheck}
                          onClick={() =>
                            approve(revision.id, revision.revision)
                          }
                        />
                        <Icon
                          size="xs"
                          color={
                            revision.status === "rejected" ? "red.500" : "gray"
                          }
                          cursor="pointer"
                          as={VscChromeClose}
                          onClick={() => rejectActivityRevision(revision.id)}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}

export default ScheduleImpact;
