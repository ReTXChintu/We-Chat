import { ChakraProvider } from "@chakra-ui/react";
import Feed from "./components/Feed";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import io from "socket.io-client";

function App() {
  serverUrl=process.env.REACT_APP_BACKEND_URL;
  const socket = io.connect(serverUrl);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("weChatAppUser"))
  );
  const toggleUser = (newUser) => {
    setUser(newUser);
  };

  const serverUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user) socket.emit("userConnected", user._id);
  }, [user, socket]);

  return (
    <ChakraProvider>
      {user ? (
          <Feed user={user} socket={socket} serverUrl={serverUrl} />
      ) : (
        <Login toggleUser={toggleUser} serverUrl={serverUrl} />
      )}
    </ChakraProvider>
  );
}

export default App;