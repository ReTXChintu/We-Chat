import { ChakraProvider } from "@chakra-ui/react";
import Feed from "./components/Feed";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import io from "socket.io-client";
import { Route, Routes } from "react-router-dom";

const serverUrl = process.env.REACT_APP_BACKEND_URL;
const socket = io.connect(serverUrl);

function App() {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("weChatAppUser"))
  );
  const toggleUser = (newUser) => {
    setUser(newUser);
  };

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
