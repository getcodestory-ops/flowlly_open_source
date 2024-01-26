import React, { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import {
  Flex,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Select,
  Text,
} from "@chakra-ui/react";

function ProbabilitySelector() {
  const { scheduleProbability, setScheduleProbability } = useStore((state) => ({
    scheduleProbability: state.scheduleProbability,
    setScheduleProbability: state.setScheduleProbability,
  }));

  const [sliderValue, setSliderValue] = useState(scheduleProbability * 100);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setScheduleProbability(sliderValue / 100);
  }, [sliderValue]);

  return (
    <Flex alignItems={"center"}>
      {/* <Slider
        id="slider"
        defaultValue={sliderValue}
        min={0}
        max={100}
        colorScheme="blackAlpha"
        onChange={(v) => setSliderValue(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
          25%
        </SliderMark>
        <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
          50%
        </SliderMark>
        <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
          75%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="brand.dark"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={`${sliderValue}%`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider> */}
      <Text fontSize={"xs"} fontWeight={"bold"} mr={"0.5"}>
        Probability:
      </Text>
      <Select
        onChange={(e: any) => setScheduleProbability(e.target.value)}
        size={"xs"}
        w={"90px"}
        className="custom-selector"
      >
        <option value="1">Realistic</option>
        <option value="0.85">Positive</option>
        <option value="0">Negative</option>
      </Select>
      {/* <Text>Probability: {scheduleProbability}</Text> */}
    </Flex>
  );
}

export default ProbabilitySelector;
