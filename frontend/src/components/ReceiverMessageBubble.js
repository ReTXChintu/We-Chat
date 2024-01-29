import { Avatar, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { formatText } from "./commonFunctions";

export default function ReceiverMessageBubble({ message, sender }) {
  return (
    <Flex w="100%">
      {sender ? <Avatar src={sender.photo} name={sender.name} mr={2} /> : null}
      <Flex
        bg={"green.200"}
        color="black"
        minW="150px"
        maxW="70%"
        my="1"
        p="3"
        borderRadius={"20px"}
        position={"relative"}
      >
        <Text mb={3}>{message.content}</Text>

        {sender ? <Text fontSize={"xs"} position={"absolute"} bottom={0} left={2}>{`~${sender.name}`}</Text> : null}

        <Text
          fontSize={"sm"}
          position={"absolute"}
          bottom={0}
          right={2}
          color={"black"}
        >
          {formatText(message.createdAt)}
        </Text>
      </Flex>
    </Flex>
  );
}
