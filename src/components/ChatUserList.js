import React from "react";
import {
  Card,
  Heading,
  Text,
  CardBody,
  Avatar,
  HStack,
} from "@chakra-ui/react";

export default function ChatUserList({ chat }) {
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;

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
    <Card
      direction={"row"}
      variant="outline"
      height={"100px"}
      border={"none"}
      w={"100%"}
    >
      <HStack>
        <Avatar
          src={
            chat.isGroup
              ? `${cloudinaryUrl}/${chat.groupIcon}`
              : `${cloudinaryUrl}/${chat.chatUser.photo}`
          }
          alt="Caffe Latte"
          name={chat.isGroup ? chat.groupName : chat.chatUser.name}
        />
        <CardBody>
          <Heading size="sm">
            {chat.isGroup ? chat.groupName : chat.chatUser.name}
          </Heading>

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
    </Card>
  );
}
