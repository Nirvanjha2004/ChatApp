import express from 'express';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import dbConnect from './db/connect';
import { user } from './db/models/User';
import jwt from 'jsonwebtoken';
import url from 'url';
import cors from 'cors';

interface userInterface {
  username: string,
  password: string
}

const app = express();
const PORT = 8080;
const SECRET_KEY = 'nirvanjhasecret';

let users: string[] = [];  // Initialize users array properly

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

dbConnect().then(() => {
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const usersignedin = await user.findOne({ username, password });
      console.log(usersignedin);
      if (usersignedin) {
        const userSigntoken = jwt.sign(
          { username: usersignedin.username },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
        res.json({ userSigntoken });
      } else {
        res.status(401).json({ message: 'Invalid credentials ..Please check the credentials!' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: any) => {
    console.log('Connection established from', req.headers.origin);
    const parsedUrl = req.url ? url.parse(req.url, true) : null;
    const query = parsedUrl?.query;
    const token = query?.token as string | undefined;
    console.log("the websocket received this: ", token);

    if (!token) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      const decodedToken = decoded as { username: string };  // Cast to expected type
      const username = decodedToken.username;

      ws.on('message', (message: RawData) => {
        try {
          const data = JSON.parse(message.toString());  // Ensure message is converted to string
          switch (data.event) {
            case 'join':
              users.push(username);
              wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      event: 'update-users',
                      usernames: users,
                    })
                  );
                }
              });
              break;

            case 'send-message':
              wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      event: 'send-message',
                      username: data.username,
                      message: data.message,
                    })
                  );
                }
              });
              break;

            default:
              break;
          }
        } catch (e) {
          console.error('Invalid message format', e);
        }
      });

      ws.on('close', () => {
        users = users.filter(u => u !== username);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                event: 'update-users',
                usernames: users,
              })
            );
          }
        });
      });

      ws.on('error', console.error);
    });
  });
});
