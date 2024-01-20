import { ChakraProvider } from "@chakra-ui/react";
import Feed from "./components/Feed";
import { useEffect, useState } from "react";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("weChatAppUser"))
  );
  const toggleUser = (newUser) => {
    setUser(newUser);
  };

  useEffect(() => {
    console.log(user);
  }, [user]);
  return (
    <ChakraProvider>
      {user ? (
        <>
          <Feed user={user} />
        </>
      ) : (
        <Login toggleUser={toggleUser} />
      )}
    </ChakraProvider>
  );
}

export default App;
