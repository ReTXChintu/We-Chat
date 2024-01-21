import {
  Avatar,
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
import React, { useEffect, useState } from "react";
import ChatUserList from "./ChatUserList";
import { AttachmentIcon, ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import { FaVideo, FaPhoneAlt, FaEllipsisV } from "react-icons/fa";
import SenderMessageBubble from "./SenderMessageBubble";
import ReceiverMessageBubble from "./ReceiverMessageBubble";
import io from 'socket.io-client';

export default function Feed({ user }) {
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
  const [chats, setChats] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const socket = io.connect();
  
  useEffect(() => {
    fetch(`${serverUrl}/getChats`, {
      method: "GET",
      headers: {
        Authorization: user._id,
        "Content-Type": "application/json", // Adjust the content type if needed
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setChats(data.chats);
      setChatUsers(data.chatUsers);
      // Process the data as needed
    })
    .catch((error) => {
      console.error("Error fetching chats:", error);
    });
  }, [serverUrl, user]);
  
  useEffect(() => {
    socket.emit('userConnected', user._id);
    // const socket = socketIOClient(serverUrl); // Replace with your server URL

    // Handle incoming messages
    socket.on('connection', (data) => {
      console.log('Message received:', data);
      // Update your UI with the received message
    });

    return () => {
      // Clean up on component unmount
      socket.disconnect();
    };
  }, [socket, user]);

  return (
    <Center
      width={{ base: "100vw", md: "80vw" }}
      ml={{ base: "0", md: "10vw" }}
    >
      <VStack w="100%" overflow="hidden">
        <HStack w="100%" pt={4} justifyContent={"space-between"}>
          <VStack
            w="30%"
            maxH="calc(100vh - 64px)"
            overflowY="hidden"
            overflowX="hidden"
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

            <VStack
              w={"100%"}
              divider={<StackDivider />}
              overflowY={"auto"}
              overflowX={"hidden"}
              alignItems={"flex-start"}
              justifyContent={"flex-start"}
            >
              {chats.map((chat, index) => (
                <ChatUserList
                  key={chat._id}
                  chat={chat}
                  chatUser={chatUsers[index]}
                />
              ))}
            </VStack>
          </VStack>

          <VStack
            w="65%"
            alignItems="flex-start"
            justifyContent={"flex-start"}
            maxH="calc(100vh - 64px)"
            overflowY="hidden"
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
            <VStack w={"100%"} overflowY="auto">
              {[...Array(50).keys()].map((index) =>
                index % 2 === 0 ? (
                  <SenderMessageBubble key={index} />
                ) : (
                  <ReceiverMessageBubble key={index} />
                )
              )}
            </VStack>
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
