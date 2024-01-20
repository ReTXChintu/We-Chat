import React from "react";
import { VStack, Center, Box, Text, Flex } from "@chakra-ui/react";

const ScrollablePage = () => {
  return (
    <Flex height="100vh" overflow="hidden">
      {/* Left Component */}
      <Box flex="1" overflowY="auto">
        <VStack spacing={4} p={4}>
          {[...Array(100).keys()].map((index) => (
            <Box key={index} w="100%" p={4} borderWidth="1px" borderRadius="lg">
              <Text>Left Item {index + 1}</Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Right Component */}
      <Box flex="1" overflowY="auto">
        <VStack spacing={4} p={4}>
          {[...Array(100).keys()].map((index) => (
            <Box key={index} w="100%" p={4} borderWidth="1px" borderRadius="lg">
              <Text>Right Item {index + 1}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};

export default ScrollablePage;
