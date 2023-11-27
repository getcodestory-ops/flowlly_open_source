import React, { useEffect } from "react";
import { Flex, Select, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

function ContextSelection() {
  const { folderList, selectedContext, setSelectedContext } = useStore(
    (state) => ({
      folderList: state.folderList,
      selectedContext: state.selectedContext,
      setSelectedContext: state.setSelectedContext,
    })
  );

  useEffect(() => {
    if (folderList && folderList?.length > 0 && folderList !== null) {
      setSelectedContext(folderList[0]);
    }
  }, [folderList]);

  return (
    <Flex justifyContent={"end"} alignItems="center" pl="2" fontSize="xs">
      <Text color="brand.dark" mr="4">
        Search folder
      </Text>

      <Select
        color="gray.400"
        placeholder="Search within"
        value={selectedContext?.name ?? ""}
        border="none"
        width="48"
        fontSize={"xs"}
        fontWeight="bold"
        onChange={(e) =>
          setSelectedContext(
            folderList?.filter(
              (folder) => folder.name === e.target.value
            )?.[0] ?? null
          )
        }
      >
        {folderList?.map((option) => (
          <option
            key={option?.name}
            value={option?.name}
            style={{ backgroundColor: "#393E46" }}
          >
            {option?.name}
          </option>
        ))}
      </Select>
    </Flex>
  );
}

export default ContextSelection;
