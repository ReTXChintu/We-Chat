import { ChevronDownIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Spinner,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { searchUser } from "./commonFunctions";

export default function MyDetails({
  user,
  cloudinaryUrl,
  chats,
  setChats,
  setActiveChat,
}) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [bottomValue, setBottomValue] = useState("");

  useEffect(() => {
    const element = document.getElementById("searchBar");

    if (element) {
      const rect = element.getBoundingClientRect();
      const bottomValue = rect.bottom;

      setBottomValue(bottomValue);
    }
  }, []);

  //get search results
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
    const response = await fetch(`/createChat`, {
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

  return (
    <>
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
            <InputRightElement cursor={"pointer"} onClick={() => setQuery("")}>
              <CloseIcon color={"gray.300"} />
            </InputRightElement>
          )}
        </InputGroup>
        <Spacer />
        <Popover>
          <PopoverTrigger>
            <IconButton borderRadius="full" backgroundColor="white">
              <ChevronDownIcon />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent w={"100%"}>
            <PopoverArrow />
            <PopoverBody>
              <VStack divider={<StackDivider />}>
                <Button variant={"link"}>Update Profile</Button>
                <Button variant={"link"}>Settings</Button>
                <Popover>
                  <PopoverTrigger>
                    <Button colorScheme="red">Sign Out</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <VStack>
                        <Text>Are you sure you want to log out?</Text>
                        <Button
                          colorScheme="red"
                          onClick={() => {
                            localStorage.removeItem("weChatAppUser");
                            window.location.reload();
                          }}
                        >
                          Yes
                        </Button>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
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
              </Box>
            ))
          ) : (
            <Text>NO users found</Text>
          )}
        </Box>
      )}
    </>
  );
}
