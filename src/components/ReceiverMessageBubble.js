import { Flex, Text } from '@chakra-ui/react';
import React from 'react'

export default function ReceiverMessageBubble() {
  return (
    <Flex w="100%">
      <Flex bg="gray.100" color="black" minW="100px" maxW="70%" my="1" p="3" borderRadius={"full"}>
        <Text>Hello</Text>
      </Flex>
    </Flex>
  );
}
