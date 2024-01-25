import { AttachmentIcon } from "@chakra-ui/icons";
import { HStack, IconButton, Input, InputGroup } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";

export default function MessageBar({
  user,
  serverUrl,
  activeChat,
  socket,
  handleChats,
  setMessages,
}) {
  const [typedMessage, setTypedMessage] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    setTypedMessage("");
  }, [activeChat]);

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
      handleChats(result);
      if (activeChat && activeChat._id.toString() === result.chat.toString())
        setMessages((prevMessages) => [...prevMessages, result]);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <HStack w={"100%"} backgroundColor={"white"} pt={4}>
      <IconButton borderRadius={"full"} backgroundColor={"white"}>
        <AttachmentIcon />
      </IconButton>
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          type="text"
          placeholder="Enter Message"
          value={typedMessage}
          onChange={(e) => {
            const typedValue = e.target.value;

            if (typingTimeout) {
              clearTimeout(typingTimeout);
            }

            const newTimeout = setTimeout(() => {
              socket.emit("stoppedTyping", {
                userId: user._id,
                chatId: activeChat._id,
              });
            }, 3000);

            setTypingTimeout(newTimeout);

            setTypedMessage(typedValue);
            socket.emit("typing", {
              userId: user._id,
              chatId: activeChat._id,
            });
          }}
        />
      </InputGroup>
      <IconButton borderRadius={"full"} onClick={sendMessage}>
        <FaPaperPlane />
      </IconButton>
      <IconButton borderRadius={"full"} backgroundColor={"white"}>
        <FaMicrophone />
      </IconButton>
    </HStack>
  );
}
