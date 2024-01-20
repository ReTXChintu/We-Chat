import { Flex, Text } from '@chakra-ui/react';
import React from 'react'

export default function SenderMessageBubble() {
  return (
    <Flex w="100%" justify="flex-end">
      <Flex bg="black" color="white" borderRadius={"full"} minW="100px" maxW="350px" my="1" p="3">
        <Text>H</Text>
      </Flex>
    </Flex>
  );
}
