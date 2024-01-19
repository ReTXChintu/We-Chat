import { Avatar, Box, Center, Divider, HStack, Text, VStack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import DynamicStack from "./DynamicStack";
import ChatUserList from "./ChatUserList";

export default function Feed({user}) {
    const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;

    useEffect(() => {console.log(user["photo"])},[])
  return (
    <Center mt={5}>
      <Box
        width={{ base: "100vw", md: "80vw" }}
        height={"90vh"}
        backgroundColor={"grey"}
      >
        <DynamicStack
          hStackProps={{ paddingX: "5px", justifyContent: "space-between", height: "100%" }}
        >
          <Box h={"100%"} w={"30%"}>
            <HStack>
                <Avatar src={`${cloudinaryUrl}${user.photo}.jpg`} name={user.name} />
            </HStack>
            <Text>Chats</Text>
            <VStack>
                <ChatUserList />
                <ChatUserList />
                <ChatUserList />
                <ChatUserList />
                <ChatUserList />
                <ChatUserList />
                <ChatUserList />
            </VStack>
          </Box>
          <Center height="100%">
            <Divider orientation="vertical" />
          </Center>
          <Box h={"100%"} w={"70%"}>
            <Text>Messages</Text>
          </Box>
        </DynamicStack>
      </Box>
    </Center>
  );
}
