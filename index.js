require('dotenv').config();

// node modules
const express = require('express');
const app = express();
const cors = require('cors');

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// mes modules
const soketListener = require('./app/socket');
const router = require('./app/router');


app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(router);

// socket
io.on('connection', (socket) => {
    soketListener.global(socket);
});


const port = process.env.PORT;
server.listen(port, () => {
    console.log(`Server listen on http://localhost:${port}`);
});






