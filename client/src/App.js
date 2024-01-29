import { ChakraProvider } from "@chakra-ui/react";
import Feed from "./components/Feed";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import io from "socket.io-client";

function App() {
  const socket = io.connect("http://localhost:8000");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("weChatAppUser"))
  );
  const toggleUser = (newUser) => {
    setUser(newUser);
  };

  useEffect(() => {
    if (user) socket.emit("userConnected", user._id);
  }, [user, socket]);

  return (
    <ChakraProvider>
      {user ? (
          <Feed user={user} socket={socket} />
      ) : (
        <Login toggleUser={toggleUser} />
      )}
    </ChakraProvider>
  );
}

export default App;
