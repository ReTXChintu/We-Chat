import { ChakraProvider } from "@chakra-ui/react";
import Feed from "./components/Feed";
import { useState } from "react";
import Login from "./components/Login";
import io from "socket.io-client";

function App() {
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const socket = io.connect(serverUrl);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("weChatAppUser"))
  );
  const toggleUser = (newUser) => {
    setUser(newUser);
  };

  //   useEffect(() => {
  //     socket.emit('userConnected', user._id);
  //   socket.on('connection', (data) => {
  //     console.log('Message received:', data);
  //     // Update your UI with the received message
  //   });
  // }, [user, socket]);

  return (
    <ChakraProvider>
      {user ? (
        <>
          <Feed user={user} socket={socket} />
        </>
      ) : (
        <Login toggleUser={toggleUser} />
      )}
    </ChakraProvider>
  );
}

export default App;
