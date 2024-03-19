import { Button, useToast, Tooltip, Icon } from "@chakra-ui/react";
import { processMessageHistory } from "@/api/analysis_routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { MdOutlineSchedule } from "react-icons/md";
import { useState } from "react";
import UpdateDailyUpdateScheduleModal from "./ConfigureDailyUpdateModal";

const ConfigureDailyUpdate = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const session = useStore((state) => state.session);
  const selectedContext = useStore((state) => state.selectedContext);
  const activeProject = useStore((state) => state.activeProject);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onClose = () => setIsOpen(false);

  return (
    <>
      {isOpen && (
        <UpdateDailyUpdateScheduleModal isOpen={isOpen} onClose={onClose} />
      )}
      <Tooltip
        label="Configure Daily Update Schedule"
        aria-label="A tooltip"
        bg="white"
        color="brand.dark"
      >
        <Button
          mx={"2"}
          bg={"white"}
          size={"xs"}
          className="custom-shadow"
          rounded={"full"}
          _hover={{ bg: "brand.dark", color: "white" }}
          cursor={"pointer"}
          p={"0"}
          onClick={() => setIsOpen(true)}
        >
          <Icon
            as={MdOutlineSchedule}
            boxSize={"4"}
            _hover={{
              transform: "rotate(360deg)",

              transition: "transform 0.5s ease-in-out",
            }}
          />
        </Button>
      </Tooltip>
    </>
  );
};

export default ConfigureDailyUpdate;
