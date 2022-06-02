require('dotenv').config();

// node modules
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// router
const router = require('./app/router');
app.use(router);

// web socket
const server = http.createServer(app);
const webSocket = require('./app/webSocket');
webSocket.global(server);


const port = process.env.PORT;
server.listen(port, () => {
    console.log(`Server listen on http://localhost:${port}`);
});






