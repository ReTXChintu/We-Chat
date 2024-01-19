import React from "react";
import {
  Box,
  HStack,
  Image,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Input,
  MenuButton,
  Menu,
  MenuList,
  MenuItem,
  Avatar,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import logo from "../logo.svg";

const Navbar = () => {
  return (
    <Box
      px={4}
      position={"sticky"}
      top={0}
      zIndex={1}
      backgroundColor={"white"}
     mt={2}
    >
      <VStack>
        <HStack w={"100%"}>
          <Tooltip label="We Chat" aria-label="A tooltip">
            <Image src={logo} width={"50px"} borderRadius={"full"} />
          </Tooltip>

          <Spacer />

          <InputGroup w={"50%"}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="txt"
              placeholder="search for users"
            />
          </InputGroup>

          <Spacer />

          <Menu>
            <MenuButton>
              <Avatar src="" name="Biswajit Panda" w={"50px"}></Avatar>
            </MenuButton>
            <MenuList>
              <MenuItem>My Preferences</MenuItem>
              <MenuItem>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Navbar;
