import { Flex, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { formatText } from "./commonFunctions";

export default function SenderMessageBubble({ message }) {
  return (
    <Flex w="100%" justify="flex-end">
      <Flex
        bg="blue.100"
        color="black"
        borderRadius={"20px"}
        minW="150px"
        maxW="350px"
        my="1"
        p="3"
        position={"relative"}
      >
        <Text mb={3}>{message.content}</Text>

        <HStack position={"absolute"} bottom={0} right={2}>
          <Text fontSize={"sm"}>{formatText(message.createdAt)}</Text>
        </HStack>
      </Flex>
    </Flex>
  );
}
