import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Input,
  useDisclosure,
  VStack,
  Text,
  SimpleGrid,
  Tag,
  Avatar,
  TagLabel,
  TagRightIcon,
  HStack,
  Box,
} from "@chakra-ui/react";
import { AddIcon, SmallAddIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { searchUser } from "./commonFunctions";

export default function CreateGroupChatButton({ user, serverUrl, setChats, setActiveChat, chats }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = useState("");
  const [groupName, setGroupName] = useState("New We Chat Group");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;

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

  useEffect(() => {
    const fetchData = async () => {
      if (query.length >= 2) {
        try {
          const result = await searchUser(query); // Use await here
          setSearchResults(result);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [query]);

  useEffect(() => {
    if (!groupName || selectedUsers.length < 2) setIsDisabled(true);
    else setIsDisabled(false);
  }, [groupName, selectedUsers]);

  function UserTag({ result }) {
    return (
      <Tag
        size="lg"
        colorScheme={selectedUsers.includes(result) ? "whatsapp" : "red"}
        borderRadius="full"
        m={1}
      >
        <Avatar
          src={`${cloudinaryUrl}/${result.photo}`}
          size="xs"
          name={result.name}
          ml={-1}
          mr={2}
        />
        <TagLabel>{result.name.split(" ")[0]}</TagLabel>
        <TagRightIcon
          as={selectedUsers.includes(result) ? SmallCloseIcon : SmallAddIcon}
          ms={"auto"}
          onClick={() => {
            if (selectedUsers.includes(result)) {
              // Remove the user from the array
              setSelectedUsers((prevUsers) =>
                prevUsers.filter((selectedUser) => selectedUser !== result)
              );
            } else {
              // Add the user to the array
              setSelectedUsers((prevUsers) => [...prevUsers, result]);
            }
          }}
        />
      </Tag>
    );
  }

  return (
    <>
      <Button
        borderRadius={"full"}
        position={"absolute"}
        bottom={10}
        right={0}
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.08)"
        rightIcon={<AddIcon />}
        onClick={onOpen}
      >
        New Group Chat
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={"xl"}>
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text fontSize={"md"}>Group Name:</Text>
              <Input
                placeholder="New Group Chat"
                size="md"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack alignItems={"flex-start"}>
              <Text>Selected Users{` (${selectedUsers.length})`}</Text>
              <HStack overflowX={"auto"} maxW={"100%"}>
                {selectedUsers.map((selectedUser) => (
                  <Box key={selectedUser._id}>
                    <UserTag result={selectedUser} />
                  </Box>
                ))}
              </HStack>
              <Text>Add Users</Text>
              <Input
                placeholder="Search USers"
                size="sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SimpleGrid
                columns={3}
                justifyContent={"space-between"}
                w={"100%"}
              >
                {searchResults.map((result) => (
                  <UserTag key={result._id} result={result} />
                ))}
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="facebook" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="whatsapp"
              onClick={() => {
                createGroupChat(groupName, [user, ...selectedUsers], user._id);
              }}
              isDisabled={isDisabled}
            >
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
