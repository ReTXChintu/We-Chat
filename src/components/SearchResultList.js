import { Avatar, Card, CardBody, HStack, Text } from "@chakra-ui/react";
import React from "react";

export default function SearchResultList({ result }) {
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
  return (
    <Card>
      <CardBody>
        <HStack>
          <Avatar
            src={`${cloudinaryUrl}/${result.photo}`}
            name={result.name}
          ></Avatar>
          <Text>{result.name}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
}
