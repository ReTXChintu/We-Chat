import React from "react";
import { HStack, VStack, useBreakpointValue } from "@chakra-ui/react";

const DynamicStack = ({ children, hStackProps, vStackProps }) => {
  const isVertical = useBreakpointValue({ base: true, lg: false });

  return isVertical ? (
    <VStack {...vStackProps}>{children}</VStack>
  ) : (
    <HStack {...hStackProps}>{children}</HStack>
  );
};

export default DynamicStack;
