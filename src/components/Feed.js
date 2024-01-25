import { Box, Center, HStack, Spacer, VStack } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import ChatUserList from "./ChatUserList";
import SenderMessageBubble from "./SenderMessageBubble";
import ReceiverMessageBubble from "./ReceiverMessageBubble";
import CreateGroupChatButton from "./CreateGroupChatButton";
import { TypingAnimation } from "./commonFunctions";
import ChatUserDetails from "./ChatUserDetails";
import MyDetails from "./MyDetails";
import MessageBar from "./MessageBar";

export default function Feed({ user, socket }) {
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [notifications, setNotifications] = useState({});
  const messagesContainerRef = useRef(null);
  const [typings, setTypings] = useState({});

  useEffect(() => {
    // Scroll to the last message when the component mounts or when activeChat changes
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, activeChat, cloudinaryUrl, user]);

  const handleChats = async (newMessage) => {
    let chatIndex = chats.findIndex(
      (chat) => chat._id === newMessage.chat.toString()
    );

    if (chatIndex !== -1) {
      const updatedChats = [
        chats[chatIndex],
        ...chats.slice(0, chatIndex),
        ...chats.slice(chatIndex + 1),
      ];

      updatedChats[0].latestMessage = newMessage;

      setChats(updatedChats);
    } else {
      try {
        const response = await fetch(`${serverUrl}/chat/${newMessage.chat}`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: user._id,
          },
        });

        if (!response.ok)
          throw new Error("Error fetching the chat: ", response);

        const result = await response.json();

        setChats((prevChats) => [result, ...prevChats]);
        if (newMessage.sender.toString() !== user._id.toString())
          setNotifications((prevNotifications) => ({
            ...prevNotifications,
            [newMessage.chat.toString()]: 1,
          }));
      } catch (error) {
        console.log(error);
      }
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

  //new message received
  useEffect(() => {
    const handleNewMessageReceived = async (newMessage) => {
      await handleChats(newMessage);
      if (activeChat && activeChat._id.toString() === newMessage.chat) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else handleNotification(newMessage);
    };

    socket.on("newMessageReceived", handleNewMessageReceived);

    return () => {
      socket.off("newMessageReceived", handleNewMessageReceived);
    };
  });

  //connected users
  useEffect(() => {
    const handleConnectedUsers = (data) => {
      setConnectedUsers(data);
    };

    socket.on("connectedUsers", handleConnectedUsers);

    return () => {
      socket.off("connectedUsers", handleConnectedUsers);
    };
  });

  //typing
  useEffect(() => {
    const handleTyping = (data) => {
      setTypings((prevTypings) => {
        const newTypings = { ...prevTypings };

        if (newTypings[data.chatId]) {
          const index = newTypings[data.chatId].findIndex(
            (typingUser) => typingUser._id === data.typingUser._id
          );

          if (index === -1) {
            newTypings[data.chatId] = [
              ...newTypings[data.chatId],
              data.typingUser,
            ];
          } else {
            newTypings[data.chatId][index] = data.typingUser;
          }
        } else {
          newTypings[data.chatId] = [data.typingUser];
        }

        return newTypings;
      });
    };

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
    };
  });

  //stopped typing
  useEffect(() => {
    const handleStoppedTyping = (data) => {
      setTypings((prevTypings) => {
        const newTypings = { ...prevTypings };

        if (newTypings[data.chatId]) {
          const index = newTypings[data.chatId].findIndex(
            (user) => user._id === data.typingUser._id
          );

          if (index !== -1) {
            newTypings[data.chatId] = [
              ...newTypings[data.chatId].slice(0, index),
              ...newTypings[data.chatId].slice(index + 1),
            ];

            if (newTypings[data.chatId].length === 0) {
              delete newTypings[data.chatId];
            }
          }
        }

        return newTypings;
      });
    };
    socket.on("stoppedTyping", handleStoppedTyping);
    return () => {
      socket.off("stoppedTyping", handleStoppedTyping);
    };
  });

  //get chats
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

  //get messages
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

  return (
    <Center
      width={{ base: "100vw", xl: "80vw" }}
      ml={{ base: "0", xl: "10vw" }}
    >
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
          <MyDetails
            user={user}
            cloudinaryUrl={cloudinaryUrl}
            serverUrl={serverUrl}
            chats={chats}
            setChats={setChats}
            setActiveChat={setActiveChat}
          />

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
                  setNotifications((prevNotifications) => ({
                    ...prevNotifications,
                    [chat._id]: 0,
                  }));
                  socket.emit("joinRoom", chat._id);
                }}
                w={"100%"}
              >
                <ChatUserList
                  chat={chat}
                  connectedUsers={connectedUsers}
                  notification={notifications[chat._id] || 0}
                  isActive={activeChat && activeChat._id === chat._id}
                />
              </Box>
            ))}
          </VStack>

          <CreateGroupChatButton
            user={user}
            serverUrl={serverUrl}
            setChats={setChats}
            setActiveChat={setActiveChat}
            chats={chats}
          />
        </VStack>

        {activeChat ? (
          <VStack
            w="65%"
            justifyContent={"space-between"}
            maxH="calc(100vh - 64px)"
            minH="calc(100vh - 64px)"
            overflow="hidden"
            position={"relative"}
          >
            <ChatUserDetails
              activeChat={activeChat}
              status={
                activeChat.isGroup
                  ? `${activeChat.users.length} members`
                  : connectedUsers.includes(activeChat.chatUsers[0]._id)
                  ? "Online"
                  : "Offline"
              }
              cloudinaryUrl={cloudinaryUrl}
            />

            <VStack
              w={"100%"}
              overflowY="auto"
              pb={5}
              overflowX={"hidden"}
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
              <HStack
                position={"absolute"}
                bottom={"50px"}
                left={0}
                overflowX={"auto"}
                maxW={"100%"}
              >
                {typings[activeChat._id] &&
                  typings[activeChat._id].map((typingUser, index) => (
                    <Box key={index}>
                      <TypingAnimation
                        imageUrl={`${cloudinaryUrl}/${typingUser.photo}`}
                        name={typingUser.name}
                      />
                    </Box>
                  ))}
              </HStack>
            </VStack>
            <Spacer />

            <MessageBar
              user={user}
              serverUrl={serverUrl}
              activeChat={activeChat}
              socket={socket}
              handleChats={handleChats}
              setMessages={setMessages}
            />
          </VStack>
        ) : null}
      </HStack>
    </Center>
  );
}
