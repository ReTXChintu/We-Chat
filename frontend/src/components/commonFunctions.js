import React from "react";
import Lottie from "lottie-react";
import { Avatar, HStack } from "@chakra-ui/react";
import animationData from "../animations/typingAnimation.json";

export async function searchUser(query) {
  try {
    const response = await fetch(`/searchUser/${query}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Serahing Failed", response);

    const result = await response.json();

    return result;
  } catch (error) {
    console.log(error);
  }
}

export const formatText = (time) => {
  const inputDate = new Date(time);
  return `${inputDate.getHours().toString().padStart(2, "0")}:${inputDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export function TypingAnimation({ imageUrl, name }) {
  return (
    <HStack w={"100px"}>
      <Avatar src={imageUrl} name={name} size={"md"} />
      <Lottie animationData={animationData} height={"20px"} />
    </HStack>
  );
}
