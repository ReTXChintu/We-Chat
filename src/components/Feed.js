import {
  Avatar,
  Box,
  Center,
  Divider,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import ChatUserList from "./ChatUserList";
import { AttachmentIcon, ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import { FaVideo, FaPhoneAlt, FaEllipsisV } from "react-icons/fa";
import SenderMessageBubble from "./SenderMessageBubble";
import ReceiverMessageBubble from "./ReceiverMessageBubble";

export default function Feed({ user }) {
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;

  return (
    <Center
      width={{ base: "100vw", md: "80vw" }}
      ml={{ base: "0", md: "10vw" }}
    >
      <VStack w="100%" overflow="hidden">
        <HStack w="100%" pt={4}>
          <VStack
            w="30%"
            maxH="calc(100vh - 64px)"
            overflowY="auto"
            overflowX={"hidden"}
          >
            <HStack
              w={"100%"}
              position={"sticky"}
              top={0}
              backgroundColor={"white"}
              zIndex={19}
              pb={4}
            >
              <Avatar
                src={`${cloudinaryUrl}${user.photo}.jpg`}
                name={user.name}
              />
              <Spacer />
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input type="text" />
              </InputGroup>
              <Spacer />
              <IconButton borderRadius="full" backgroundColor="white">
                <ChevronDownIcon />
              </IconButton>
            </HStack>

            <VStack w={"100%"} divider={<StackDivider />}>
              {[...Array(20).keys()].map((index) => (
                <ChatUserList key={index} />
              ))}
            </VStack>
          </VStack>

          <Box w="5%"></Box>
          <VStack
            w="65%"
            alignItems="flex-start"
            justifyContent={"flex-start"}
            maxH="calc(100vh - 64px)"
            overflowY="auto"
            position={"relative"}
          >
            <VStack
              w={"100%"}
              position={"sticky"}
              top={0}
              backgroundColor={"white"}
              zIndex={10}
            >
              <HStack w="100%">
                <HStack spacing={10}>
                  <Avatar
                    src={`${cloudinaryUrl}${user.photo}.jpg`}
                    name={user.name}
                  />
                  <VStack>
                    <Text fontSize="md">Biswajit</Text>
                    <Text fontSize="sm">Online</Text>
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
                  <IconButton backgroundColor="white" borderRadius="full">
                    <FaEllipsisV />
                  </IconButton>
                </HStack>
              </HStack>
              <Divider />
            </VStack>
            {[...Array(50).keys()].map((index) =>
              index % 2 === 0 ? (
                <SenderMessageBubble />
              ) : (
                <ReceiverMessageBubble />
              )
            )}
            <HStack
              w={"100%"}
              position={"absolute"}
              bottom={0}
              backgroundColor={"white"}
              pt={4}
            >
              <IconButton borderRadius={"full"} backgroundColor={"white"}>
                <AttachmentIcon />
              </IconButton>
              <InputGroup size="md">
                <Input pr="4.5rem" type="text" placeholder="Enter Message" />
              </InputGroup>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </Center>
  );
}
