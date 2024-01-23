import React, { useEffect, useState } from "react";
import {
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  InputLeftElement,
  Box,
  Avatar,
  FormControl,
  FormHelperText,
  InputRightElement,
  Text,
  HStack,
} from "@chakra-ui/react";
import {
  AtSignIcon,
  EmailIcon,
  LockIcon,
  PhoneIcon,
  ViewIcon,
  ViewOffIcon,
} from "@chakra-ui/icons";

export default function Login({ toggleUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loginemail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [signUpDisable, setSignUpDisable] = useState(true);
  const [loginDisable, setLoginDisable] = useState(true);
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Assuming you are using FileReader to read the image as a data URL
      const reader = new FileReader();

      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!name || !email || !pass || !phone) setSignUpDisable(true);
    else setSignUpDisable(false);
  }, [name, email, phone, pass]);

  useEffect(() => {
    if (!loginemail || !loginPass) setLoginDisable(true);
    else setLoginDisable(false);
  }, [loginemail, loginPass]);

  const handleShowClick = () => setShowPassword(!showPassword);

  const login = async () => {
    try {
      const response = await fetch(`${serverUrl}/login`, {
        method: "POST",
        body: JSON.stringify({ email: loginemail, pass: loginPass }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if(!response.ok) console.log(response);

      const result = await response.json();
      console.log(result);

      localStorage.setItem('weChatAppUser', JSON.stringify(result.user));

      toggleUser(result.user);
    } catch (error) {
        console.log(error);
    }
  };

  const signup = async () => {
    try {
      const response = await fetch(`${serverUrl}/addUser`, {
        method: "POST",
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          pass: pass,
          photo: selectedImage,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return isLogin ? (
    <Flex
      flexDirection="column"
      width="100wh"
      height="100vh"
      backgroundColor="gray.200"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        flexDir="column"
        mb="2"
        justifyContent="center"
        alignItems="center"
      >
        {/* <Avatar bg="teal.500" /> */}
        <Heading color="teal.400">Welcome</Heading>
        <Box minW={{ base: "90%", md: "468px" }}>
          <form>
            <Stack
              spacing={4}
              p="1rem"
              backgroundColor="whiteAlpha.900"
              boxShadow="md"
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<EmailIcon color="gray.300" />}
                  />
                  <Input
                    type="email"
                    placeholder="email address"
                    value={loginemail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                    }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.300"
                    children={<LockIcon color="gray.300" />}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText textAlign="right">
                  <Text>forgot password?</Text>
                </FormHelperText>
              </FormControl>
              <Button
                borderRadius={0}
                variant="solid"
                colorScheme="teal"
                width="full"
                onClick={login}
                isDisabled={loginDisable}
              >
                Login
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      <HStack>
        <Text>New to us? </Text>
        <Text
          color="teal.500"
          onClick={() => setIsLogin(false)}
          cursor={"pointer"}
        >
          Sign Up
        </Text>
      </HStack>
    </Flex>
  ) : (
    <Flex
      flexDirection="column"
      width="100wh"
      height="100vh"
      backgroundColor="gray.200"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        flexDir="column"
        mb="2"
        justifyContent="center"
        alignItems="center"
      >
        <Heading color="teal.400">Sign up</Heading>
        <label>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              handleImageChange(e);
            }}
          />
          <Avatar
            bg="teal.500"
            onClick={() => {
              document.querySelector('input[type="file"]');
            }}
            w={"200px"}
            h={"200px"}
            src={selectedImage}
            cursor={"pointer"}
          />
        </label>
        <Box minW={{ base: "90%", md: "468px" }}>
          <form>
            <Stack
              spacing={4}
              p="1rem"
              backgroundColor="whiteAlpha.900"
              boxShadow="md"
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<AtSignIcon color="gray.300" />}
                  />
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<EmailIcon color="gray.300" />}
                  />
                  <Input
                    type="email"
                    placeholder="email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<PhoneIcon color="gray.300" />}
                  />
                  <Input
                    type="number"
                    placeholder="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.300"
                    children={<LockIcon color="gray.300" />}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText textAlign="right">
                  <Text>forgot password?</Text>
                </FormHelperText>
              </FormControl>
              <Button
                borderRadius={0}
                variant="solid"
                colorScheme="teal"
                width="full"
                onClick={signup}
                isDisabled={signUpDisable}
              >
                Sign up
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      <HStack>
        <Text>Existing user ? </Text>
        <Text
          color="teal.500"
          onClick={() => setIsLogin(true)}
          cursor={"pointer"}
        >
          Log in
        </Text>
      </HStack>
    </Flex>
  );
}
