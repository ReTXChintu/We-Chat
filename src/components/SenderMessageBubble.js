import { CheckIcon } from "@chakra-ui/icons";
import { Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { formatText } from "./commonFunctions";

export default function SenderMessageBubble({ message }) {

  return (
    <Flex w="100%" justify="flex-end">
      <Flex
        bg="black"
        color="white"
        borderRadius={"20px"}
        minW="150px"
        maxW="350px"
        my="1"
        p="3"
        position={"relative"}
      >
        <Text mb={3}>{message.content}</Text>

        <Text fontSize={"sm"} position={"absolute"} bottom={0} right={2}>
          <Icon>
            <CheckIcon />
          </Icon>
          {formatText(message.createdAt)}
        </Text>
      </Flex>
    </Flex>
  );
}
