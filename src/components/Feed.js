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
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
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
  FaArrowDown,
} from "react-icons/fa";
import SenderMessageBubble from "./SenderMessageBubble";
import ReceiverMessageBubble from "./ReceiverMessageBubble";
import SearchResultList from "./SearchResultList";
import CreateGroupChatButton from "./CreateGroupChatButton";
import { searchUser } from "./commonFunctions";

export default function Feed({ user, socket }) {
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
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [notifications, setNotifications] = useState({});
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      const handleScroll = () => {
        // Check if the user is not at the bottom of the messages
        const atBottom =
          container.scrollTop + container.clientHeight ===
          container.scrollHeight;

        setShowScrollButton(!atBottom);
      };

      container.addEventListener("scroll", handleScroll);

      // Cleanup event listener on component unmount
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [messagesContainerRef]);

  useEffect(() => {
    // Scroll to the last message when the component mounts or when activeChat changes
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, activeChat, cloudinaryUrl, user]);

  const handleScrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleUsers = (newMessage) => {
    const chatIndex = chats.findIndex(
      (chat) => chat._id === newMessage.chat.toString()
    );

    // If the chat is found in the array
    if (chatIndex !== -1) {
      // Move the chat to the beginning of the array (index 0)
      const updatedChats = [
        chats[chatIndex],
        ...chats.slice(0, chatIndex),
        ...chats.slice(chatIndex + 1),
      ];

      // Update the latestMessage in the found chat
      updatedChats[0].latestMessage = newMessage;

      // Set the updated chats array
      setChats(updatedChats);
    }
  };

  const handleNotification = (newMessage) => {
    const chatId = newMessage.chat.toString();
    const chatIndex = chats.findIndex((chat) => chat._id === chatId);

    if (chatIndex !== -1) {
      setNotifications((prevNotifications) => ({
        ...prevNotifications,
        [chatId]: (prevNotifications[chatId] || 0) + 1,
      }));
    }
  };

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
      setTypedMessage("");
      socket.emit("newMessage", result);
      handleUsers(result);
      if (activeChat && activeChat._id.toString() === result.chat.toString())
        setMessages((prevMessages) => [...prevMessages, result]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleNewMessageReceived = (newMessage) => {
      if (activeChat && activeChat._id.toString() === newMessage.chat) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else handleNotification(newMessage);

      handleUsers(newMessage);
      socket.emit("getReceivedMessages", user._id);
    };

    socket.on("newMessageReceived", handleNewMessageReceived);

    return () => {
      socket.off("newMessageReceived", handleNewMessageReceived);
    };
  });

  useEffect(() => {
    const handleConnectedUsers = (data) => {
      setConnectedUsers(data);
    };

    socket.on("connectedUsers", handleConnectedUsers);

    return () => {
      socket.off("connectedUsers", handleConnectedUsers);
    };
  });

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
      width={{ base: "100vw", xl: "80vw" }}
      ml={{ base: "0", xl: "10vw" }}
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
              overflowY={"auto"}
              overflowX={"hidden"}
              alignItems={"flex-start"}
              justifyContent={"flex-start"}
              pb={4}
            >
              {chats.map((chat) => (
                <Box
                  key={chat._id}
                  onClick={() => {
                    setActiveChat(chat);
                    socket.emit("joinRoom", chat._id);
                  }}
                  w={"100%"}
                >
                  <ChatUserList
                    chat={chat}
                    user={user}
                    connectedUsers={connectedUsers}
                    notification={notifications[chat._id]}
                    isActive={activeChat && activeChat._id === chat._id}
                  />
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
              justifyContent={"space-between"}
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
                      <Text fontSize="sm">
                        {activeChat.isGroup
                          ? `${activeChat.users.length} members`
                          : connectedUsers.includes(activeChat.chatUsers[0]._id)
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

              <VStack
                w={"100%"}
                overflowY="auto"
                pb={5}
                ref={messagesContainerRef}
              >
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
                {showScrollButton && (
                  <IconButton
                    icon={<FaArrowDown />}
                    onClick={handleScrollToBottom}
                    position="absolute"
                    bottom="10vh"
                    right="20px"
                    borderRadius="full"
                  />
                )}
              </VStack>
              <Spacer />

              <HStack
                w={"100%"}
                // position={"absolute"}
                // bottom={0}
                backgroundColor={"white"}
                pt={4}
                id="bottomBar"
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
