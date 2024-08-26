"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const connect_1 = __importDefault(require("./db/connect"));
const User_1 = require("./db/models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const url_1 = __importDefault(require("url"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 8080;
const SECRET_KEY = 'nirvanjhasecret';
let users = []; // Initialize users array properly
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Middleware to handle CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
(0, connect_1.default)().then(() => {
    app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password } = req.body;
        try {
            const usersignedin = yield User_1.user.findOne({ username, password });
            console.log(usersignedin);
            if (usersignedin) {
                const userSigntoken = jsonwebtoken_1.default.sign({ username: usersignedin.username }, SECRET_KEY, { expiresIn: '1h' });
                res.json({ userSigntoken });
            }
            else {
                res.status(401).json({ message: 'Invalid credentials ..Please check the credentials!' });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    const server = app.listen(PORT, () => {
        console.log(`Server is listening on http://localhost:${PORT}`);
    });
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        console.log('Connection established from', req.headers.origin);
        const parsedUrl = req.url ? url_1.default.parse(req.url, true) : null;
        const query = parsedUrl === null || parsedUrl === void 0 ? void 0 : parsedUrl.query;
        const token = query === null || query === void 0 ? void 0 : query.token;
        console.log("the websocket received this: ", token);
        if (!token) {
            ws.close(1008, 'Unauthorized');
            return;
        }
        jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                ws.close(1008, 'Unauthorized');
                return;
            }
            const decodedToken = decoded; // Cast to expected type
            const username = decodedToken.username;
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString()); // Ensure message is converted to string
                    switch (data.event) {
                        case 'join':
                            users.push(username);
                            wss.clients.forEach(client => {
                                if (client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        event: 'update-users',
                                        usernames: users,
                                    }));
                                }
                            });
                            break;
                        case 'send-message':
                            wss.clients.forEach(client => {
                                if (client.readyState === ws_1.WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        event: 'send-message',
                                        username: data.username,
                                        message: data.message,
                                    }));
                                }
                            });
                            break;
                        default:
                            break;
                    }
                }
                catch (e) {
                    console.error('Invalid message format', e);
                }
            });
            ws.on('close', () => {
                users = users.filter(u => u !== username);
                wss.clients.forEach(client => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            event: 'update-users',
                            usernames: users,
                        }));
                    }
                });
            });
            ws.on('error', console.error);
        });
    });
});
