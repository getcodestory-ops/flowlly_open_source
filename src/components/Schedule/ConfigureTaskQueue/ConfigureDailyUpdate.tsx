import { Button, Tooltip, Icon, Text, Flex } from "@chakra-ui/react";
import { MdOutlineSchedule } from "react-icons/md";
import { useState } from "react";
import UpdateDailyUpdateScheduleModal from "./ConfigureDailyUpdateModal";

const ConfigureDailyUpdate = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [hovered, setHovered] = useState<boolean>(false);

	const onClose = () => setIsOpen(false);

	return (
		<>
			{isOpen && <UpdateDailyUpdateScheduleModal />}
			{!hovered ? (
				<Flex>
					<Tooltip
						aria-label="A tooltip"
						bg="white"
						color="brand.dark"
						label="Configure Daily Update Schedule"
					>
						<Button
							_hover={{ bg: "brand.gray", color: "brand.dark" }}
							bg="none"
							className="custom-shadow"
							cursor="pointer"
							mx="2"
							onClick={() => setIsOpen(true)}
							rounded="md"
							size="sm"
						>
							<Icon
								_hover={{
									transform: "rotate(360deg)",
									transition: "transform 0.5s ease-in-out",
								}}
								as={MdOutlineSchedule}
								boxSize="4"
							/>
						</Button>
					</Tooltip>
				</Flex>
			) : (
				<Flex>
					<Button
						_hover={{ bg: "brand.gray", color: "brand.dark" }}
						bg="none"
						className="custom-shadow"
						color="white"
						cursor="pointer"
						mx="2"
						onClick={() => setIsOpen(true)}
						rounded="md"
						size="sm"
					>
						<Icon
							_hover={{
								transform: "rotate(360deg)",
								transition: "transform 0.5s ease-in-out",
							}}
							as={MdOutlineSchedule}
							boxSize="4"
						/>
						<Text
							color="white"
							fontSize="12px"
							fontWeight="medium"
							ml="2"
						>
              Configuration
						</Text>
					</Button>
				</Flex>
			)}
		</>
	);
};

export default ConfigureDailyUpdate;
