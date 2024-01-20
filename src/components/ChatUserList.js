import React from "react";
import {
  Card,
  Heading,
  Text,
  CardBody,
  Avatar,
  HStack,
} from "@chakra-ui/react";

export default function ChatUserList() {
  return (
    <Card direction={"row"} variant="outline" height={"100px"} border={"none"} w={"100%"}>
      <HStack>
        <Avatar
          src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
          alt="Caffe Latte"
        />
        <CardBody>
          <Heading size="sm">The perfect latte</Heading>
          <Text
            fontSize={"sm"}
            py="2"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            Caffè latte is a coffee beverage of Italian origin made with
            espresso and steamed milk.
          </Text>
          <Text fontSize={"xs"} position={"absolute"} bottom={0} right={3}>
            time
          </Text>
        </CardBody>
      </HStack>
    </Card>
  );
}
