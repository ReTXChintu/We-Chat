import {
  Avatar,
  Box,
  Center,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spacer,
  Spinner,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ChatUserList from "./ChatUserList";
import {
  AttachmentIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import {
  FaVideo,
  FaPhoneAlt,
  FaEllipsisV,
  FaPaperPlane,
  FaMicrophone,
} from "react-icons/fa";
import SenderMessageBubble from "./SenderMessageBubble";
import ReceiverMessageBubble from "./ReceiverMessageBubble";
import SearchResultList from "./SearchResultList";
import CreateGroupChatButton from "./CreateGroupChatButton";
import { searchUser } from "./commonFunctions";

export default function Feed({ user }) {
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const [bottomValue, setBottomValue] = useState("");

  useEffect(() => {
    const element = document.getElementById("searchBar");

    if (element) {
      const rect = element.getBoundingClientRect();
      const bottomValue = rect.bottom;

      setBottomValue(bottomValue);
    }
  }, []);

  useEffect(() => {
    const getChats = async () => {
      const response = await fetch(`${serverUrl}/chats`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: user._id,
        },
      });

      if (!response.ok) throw new Error("Error Fetching chats", response);

      const result = await response.json();

      setChats(result);
    };

    if (user) getChats();
  }, [user, serverUrl]);

  useEffect(() => {
    const getMessages = async () => {
      fetch(`${serverUrl}/messages/${activeChat._id}`)
        .then((response) => response.json())
        .then((data) => {
          setMessages(data);
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
        });
    };
    if (activeChat) getMessages();
  }, [activeChat, serverUrl]);

  useEffect(() => {
    const fetchData = async () => {
      if (query.length >= 2) {
        try {
          setIsLoading(true);
          const result = await searchUser(query); // Use await here
          setSearchResults(result);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [query]);

  const sendMessage = async () => {
    try {
      const response = await fetch(`${serverUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: user._id,
          chatId: activeChat._id,
          messageText: typedMessage,
        }),
      });

      if (!response.ok) throw new Error("Message Sending Failed", response);

      const result = await response.json();
      console.log(result);
      setTypedMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const openChat = async (chatUserId) => {
    const response = await fetch(`${serverUrl}/createChat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ user1: user._id, user2: chatUserId }),
    });

    if (!response.ok) throw new Error("Error opening chat: ", response);

    const result = await response.json();

    if (chats.filter((chat) => chat._id === result._id)) {
      setActiveChat(result);
    } else {
      setChats((prevChats) => [result, ...prevChats]);
      setActiveChat(result);
    }
  };

  const createGroupChat = async (groupName, selectedUsers, groupAdmin) => {
    let groupUsers = [];
    selectedUsers.forEach((element) => groupUsers.push(element._id));

    const response = await fetch(`${serverUrl}/createGroupChat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        groupName: groupName,
        users: groupUsers,
        groupAdmin: groupAdmin,
      }),
    });

    if (!response.ok) throw new Error("Error creaing group: ", response);

    const result = await response.json();

    setChats((prevChats) => [result, ...prevChats]);
    setActiveChat(chats[0]);
  };

  return (
    <Center
      width={{ base: "100vw", md: "80vw" }}
      ml={{ base: "0", md: "10vw" }}
    >
      <VStack w="100%" overflow="hidden">
        <HStack w="100%" pt={4} justifyContent={"space-between"}>
          <VStack
            w="30%"
            minH="calc(100vh - 64px)"
            maxH="calc(100vh - 64px)"
            overflowY="hidden"
            overflowX="hidden"
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
            position={"relative"}
          >
            <HStack
              w={"100%"}
              position={"sticky"}
              top={0}
              backgroundColor={"white"}
              zIndex={19}
              pb={4}
            >
              <Avatar src={`${cloudinaryUrl}${user.photo}`} name={user.name} />
              <Spacer />
              <InputGroup id="searchBar">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <InputRightElement
                    cursor={"pointer"}
                    onClick={() => setQuery("")}
                  >
                    <CloseIcon color={"gray.300"} />
                  </InputRightElement>
                )}
              </InputGroup>
              <Spacer />
              <IconButton borderRadius="full" backgroundColor="white">
                <ChevronDownIcon />
              </IconButton>
            </HStack>
            {query.length >= 2 && (
              <Box
                position="absolute"
                top={bottomValue}
                left="0"
                width="100%"
                backgroundColor="white"
                zIndex={20}
                boxShadow="md"
                p={4}
                maxH={"50vh"}
                overflowY={"auto"}
              >
                {isLoading ? (
                  <Spinner />
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Box
                      key={result._id}
                      onClick={() => {
                        openChat(result._id);
                      }}
                    >
                      <SearchResultList result={result} />
                    </Box>
                  ))
                ) : (
                  <Text>NO users found</Text>
                )}
              </Box>
            )}

            <VStack
              w={"100%"}
              divider={<StackDivider />}
              overflowY={"auto"}
              overflowX={"hidden"}
              alignItems={"flex-start"}
              justifyContent={"flex-start"}
            >
              {chats.map((chat) => (
                <Box
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  w={"100%"}
                >
                  <ChatUserList chat={chat} />
                </Box>
              ))}
            </VStack>
            <CreateGroupChatButton
              user={user}
              createGroupChat={createGroupChat}
            />
          </VStack>

          {activeChat ? (
            <VStack
              w="65%"
              alignItems="flex-start"
              justifyContent={"flex-start"}
              maxH="calc(100vh - 64px)"
              minH="calc(100vh - 64px)"
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
                <HStack
                  w="100%"
                  boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.08)"
                >
                  <HStack spacing={10} px={3}>
                    <Avatar
                      src={
                        activeChat.isGroup
                          ? `${cloudinaryUrl}${activeChat.groupIcon}`
                          : `${cloudinaryUrl}${activeChat.chatUser.photo}`
                      }
                      name={
                        activeChat.isGroup
                          ? activeChat.groupName
                          : activeChat.chatUser.name
                      }
                    />
                    <VStack alignItems={"flex-start"}>
                      <Text fontSize="md">
                        {activeChat.isGroup
                          ? activeChat.groupName
                          : activeChat.chatUser.name}
                      </Text>
                      <Text fontSize="sm">
                        {activeChat.isGroup
                          ? `${activeChat.users.length} members`
                          : activeChat.chatUser.isOnline
                          ? "Online"
                          : "Offline"}
                      </Text>
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
              </VStack>
              <VStack w={"100%"} overflowY="auto">
                {messages.map((message) =>
                  message.sender === user._id ? (
                    <SenderMessageBubble
                      key={message._id}
                      message={message}
                      sender={
                        activeChat.isGroup
                          ? {
                              photo: `${cloudinaryUrl}/${user.photo}`,
                              name: user.name,
                            }
                          : null
                      }
                    />
                  ) : (
                    <ReceiverMessageBubble
                      key={message._id}
                      message={message}
                      sender={
                        activeChat.isGroup
                          ? {
                              photo: `${cloudinaryUrl}/${
                                activeChat.chatUsers.find(
                                  (user) => user._id === message.sender
                                )?.photo
                              }`,
                              name: activeChat.chatUsers.find(
                                (user) => user._id === message.sender
                              )?.name,
                            }
                          : null
                      }
                    />
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
                  <Input
                    pr="4.5rem"
                    type="text"
                    placeholder="Enter Message"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                  />
                </InputGroup>
                <IconButton borderRadius={"full"} onClick={sendMessage}>
                  <FaPaperPlane />
                </IconButton>
                <IconButton borderRadius={"full"} backgroundColor={"white"}>
                  <FaMicrophone />
                </IconButton>
              </HStack>
            </VStack>
          ) : null}
        </HStack>
      </VStack>
    </Center>
  );
}
