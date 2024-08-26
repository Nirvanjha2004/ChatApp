"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
require("./App.css");
require("./index.css");
function App() {
    const [username, setUsername] = (0, react_1.useState)("Anonymous");
    const [userList, setUserList] = (0, react_1.useState)([]);
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [latestMessage, setLatestMessage] = (0, react_1.useState)("");
    const [messages, setMessages] = (0, react_1.useState)([]);
    const isPrompted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        if (!isPrompted.current) {
            const name = prompt("Please enter your name") || "Anonymous";
            setUsername(name);
            isPrompted.current = true;
        }
        const newSocket = new WebSocket("ws://localhost:8080", "jwttoken");
        newSocket.onopen = () => {
            console.log("Connection established");
            newSocket.send(JSON.stringify({
                event: "join",
                username: name,
            }));
            setSocket(newSocket);
        };
        newSocket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            switch (data.event) {
                case "update-users":
                    setUserList(data.usernames);
                    break;
                case "send-message":
                    addMessagefn(data.username, data.message);
                    break;
                default:
                    break;
            }
            console.log("Message received:", message.data);
        };
        newSocket.onclose = () => {
            console.log("Connection closed");
        };
        newSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        return () => newSocket.close();
    }, []);
    const addMessagefn = (username, message) => {
        setMessages((prev) => [...prev, { username, message }]);
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };
    const sendMessage = () => {
        if (socket && latestMessage.trim()) {
            socket.send(JSON.stringify({
                event: "send-message",
                message: latestMessage,
                username: username,
            }));
            setLatestMessage("");
        }
    };
    return (
    <div>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4 text-center font-bold">
          Chat
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div id="users">
            {userList.map((user, index) => (<div key={index}>{user}</div>))}
          </div>
          
          {messages.map((msg, index) => (<div key={index} className={`mb-2 ${msg.username === username ? "text-right" : "text-left"}`}>
            
              <div className={`{inline-block p-2 rounded-lg ${msg.username === username
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-black"}`}>
                {msg.username}: {msg.message}
              </div>
            </div>))}
        </div>

        <div className="p-4 bg-white border-t border-gray-300">
          <div className="flex">
            <input onChange={(e) => setLatestMessage(e.target.value)} type="text" className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600" value={latestMessage} placeholder="Type your message..." onKeyPress={handleKeyPress}/>
            <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-r-lg">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>);
}
exports.default = App;
