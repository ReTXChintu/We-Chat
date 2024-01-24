import React from "react";
import {
  Card,
  Heading,
  Text,
  CardBody,
  Avatar,
  HStack,
  Badge,
  Box,
} from "@chakra-ui/react";

export default function ChatUserList({
  chat,
  user,
  isOnline,
  notification,
  isActive,
}) {
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;

  const cardStyles = {
    direction: "row",
    variant: "outline",
    height: "100px",
    w: "100%",
    backgroundColor: isActive ? "gray.100" : "white",
    transition: "border 0.3s",
    cursor: "pointer",
    _hover: {
      boxShadow: isActive
        ? "none"
        : "0 4px 6px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.08)",
      transition: "box-shadow 0.3s",
    },
  };

  const formatText = (time) => {
    const currentDate = new Date();
    const inputDate = new Date(time);

    const isSameDay =
      inputDate.getDate() === currentDate.getDate() &&
      inputDate.getMonth() === currentDate.getMonth() &&
      inputDate.getFullYear() === currentDate.getFullYear();

    const isYesterday =
      inputDate.getDate() === currentDate.getDate() - 1 &&
      inputDate.getMonth() === currentDate.getMonth() &&
      inputDate.getFullYear() === currentDate.getFullYear();

    if (isSameDay) {
      // Return the time if it's today
      return `${inputDate.getHours().toString().padStart(2, "0")}:${inputDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else if (isYesterday) {
      // Return "Yesterday" if it's yesterday
      return "Yesterday";
    } else {
      // Return the date in the format dd-mm-yyyy
      const dd = String(inputDate.getDate()).padStart(2, "0");
      const mm = String(inputDate.getMonth() + 1).padStart(2, "0");
      const yyyy = inputDate.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  };

  return (
    <Box as={Card} {...cardStyles}>
      <HStack>
        <Box position={"relative"}>
          <Avatar
            src={
              chat.isGroup
                ? `${cloudinaryUrl}/${chat.groupIcon}`
                : `${cloudinaryUrl}/${chat.chatUsers[0].photo}`
            }
            alt="Caffe Latte"
            name={chat.isGroup ? chat.groupName : chat.chatUsers[0].name}
          />
          {!chat.isGroup && isOnline && (
            <Badge
              variant="solid"
              w={"10px"}
              h={"10px"}
              borderRadius={"full"}
              position={"absolute"}
              right={0}
              bottom={1}
              colorScheme="green"
            ></Badge>
          )}
        </Box>
        <CardBody>
          <HStack>
            <Heading size="sm" whiteSpace="nowrap" textOverflow="ellipsis">
              {chat.isGroup ? chat.groupName : chat.chatUsers[0].name}
            </Heading>
            <Text
              style={{ height: "20px" }}
              fontSize={"xs"}
              fontWeight={"bold"}
              borderRadius={"full"}
              minW={"10px"}
              backgroundColor={"green"}
              color={"white"}
              textAlign={"center"}
              position={"absolute"}
              right={5}
              display={notification > 0 ? "block" : "none"}
              px={2}
            >
              {notification}
            </Text>
          </HStack>

          <Text
            fontSize={"sm"}
            py="2"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {chat.latestMessage
              ? chat.latestMessage.content
              : "Start Chatting by clicking here"}
          </Text>

          <Text fontSize={"xs"} position={"absolute"} bottom={0} right={3}>
            {formatText(chat.updatedAt)}
          </Text>
        </CardBody>
      </HStack>
      {/* </Card> */}
    </Box>
  );
}
