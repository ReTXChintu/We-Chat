import { ChakraProvider } from "@chakra-ui/react";
import Feed from "./components/Feed";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import io from "socket.io-client";
import { Route, Routes } from "react-router-dom";

function App() {
  const serverUrl = process.env.REACT_APP_BACKEND_URL;
  const [socket, setSocket] = useState(null);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("weChatAppUser"))
  );
  const toggleUser = (newUser) => {
    setUser(newUser);
  };

  useEffect(() => {
    const newSocket = io.connect(serverUrl);
    setSocket(newSocket);
    
    // Clean up function to disconnect socket on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (user && socket) socket.emit("userConnected", user._id);
  }, [user, socket]);

  return (
    <ChakraProvider>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Feed user={user} socket={socket} />
            ) : (
              <Login toggleUser={toggleUser} />
            )
          }
        ></Route>
      </Routes>
      {/* Add more routes if needed */}
    </ChakraProvider>
  );
}

export default App;
