import React from "react";
import { Button, Icon, Text, Tooltip } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { AppView } from "@/types/store";

export interface MenuButtonProps {
  onClickFn: (appView: AppView) => void;
  label: string;
  fnKey: AppView;
  icon: IconType;
  activeKey: string;
  expanded?: boolean;
}

function MenuButton({
  onClickFn,
  label,
  fnKey,
  icon,
  activeKey,
  expanded,
}: MenuButtonProps) {
  return (
    <>
      {expanded ? (
        <Button
          w={"90%"}
          mx={"2"}
          size={"sm"}
          bg={activeKey === fnKey ? "brand.accent" : ""}
          onClick={() => {
            onClickFn(fnKey);
          }}
          _hover={{
            color: "brand.dark",
            bg: "#E5E5E5",
          }}
          justifyContent={"flex-start"}
        >
          <Icon
            as={icon}
            color={activeKey === fnKey ? "brand.dark" : ""}
          ></Icon>
          <Text
            fontSize={"12px"}
            color={activeKey === fnKey ? "brand.dark" : ""}
            ml={"2"}
            fontWeight={"medium"}
          >
            {label}
          </Text>
        </Button>
      ) : (
        <Tooltip
          label="Look Ahead"
          aria-label="Look Ahead"
          bg="white"
          color="brand.dark"
        >
          <Button
            mx={"2"}
            size={"sm"}
            bg={activeKey === fnKey ? "brand.accent" : ""}
            onClick={() => {
              onClickFn(fnKey);
            }}
            _hover={{
              color: "brand.dark",
              bg: "#E5E5E5",
            }}
          >
            <Icon
              as={icon}
              color={activeKey === fnKey ? "brand.dark" : ""}
            ></Icon>
          </Button>
        </Tooltip>
      )}
    </>
  );
}

export default MenuButton;
