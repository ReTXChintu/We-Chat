import {
  Avatar,
  HStack,
  IconButton,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { FaEllipsisV, FaPhoneAlt, FaVideo } from "react-icons/fa";

export default function ChatUserDetails({ activeChat, status, cloudinaryUrl }) {
  return (
    <VStack
      w={"100%"}
      position={"sticky"}
      top={0}
      backgroundColor={"white"}
      zIndex={10}
    >
      <HStack
        w="100%"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.08)"
      >
        <HStack spacing={10} px={3}>
          <Avatar
            src={
              activeChat.isGroup
                ? `${cloudinaryUrl}${activeChat.groupIcon}`
                : `${cloudinaryUrl}${activeChat.chatUsers[0].photo}`
            }
            name={
              activeChat.isGroup
                ? activeChat.groupName
                : activeChat.chatUsers[0].name
            }
          />
          <VStack alignItems={"flex-start"}>
            <Text fontSize="md">
              {activeChat.isGroup
                ? activeChat.groupName
                : activeChat.chatUsers[0].name}
            </Text>
            <Text fontSize="sm">{status}</Text>
          </VStack>
        </HStack>
        <Spacer />
        <HStack>
          <IconButton backgroundColor="white" borderRadius="full">
            <FaPhoneAlt />
          </IconButton>
          <IconButton backgroundColor="white" borderRadius="full">
            <FaVideo />
          </IconButton>
          <IconButton backgroundColor="white" borderRadius={"full"}>
            <FaEllipsisV />
          </IconButton>
        </HStack>
      </HStack>
    </VStack>
  );
}
