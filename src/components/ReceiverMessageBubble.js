import { Avatar, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { formatText } from "./commonFunctions";

export default function ReceiverMessageBubble({ message, sender }) {
  return (
    <Flex w="100%">
      {sender ? <Avatar src={sender.photo} name={sender.name}  /> : null}
      <Flex
        bg="gray.100"
        color="black"
        minW="150px"
        maxW="70%"
        my="1"
        p="3"
        borderRadius={"20px"}
        position={"relative"}
      >
        <Text mb={3}>{message.content}</Text>

        <Text fontSize={"sm"} position={"absolute"} bottom={0} right={2} color={"black"}>
          {formatText(message.createdAt)}
        </Text>
      </Flex>
    </Flex>
  );
}
