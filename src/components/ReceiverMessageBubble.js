import { Avatar, Flex, Text } from '@chakra-ui/react';
import React from 'react'

export default function ReceiverMessageBubble() {
  return (
    <Flex w="100%">
      <Avatar
        name="Computer"
        src="https://avataaars.io/?avatarStyle=Transparent&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
        bg="blue.300"
      ></Avatar>
      <Flex bg="gray.100" color="black" minW="100px" maxW="350px" my="1" p="3" borderRadius={"full"}>
        <Text>Hello</Text>
      </Flex>
    </Flex>
  );
}
