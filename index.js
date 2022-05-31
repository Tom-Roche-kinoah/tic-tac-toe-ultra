require('dotenv').config();

const express = require('express');
const router = require('./app/router');
const socket = require('./app/socket');
const http = require('http');

const app = express();
const server = http.createServer(app);


app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(socket);

app.use(router);


const port = process.env.PORT;
server.listen(port, () => {
    console.log(`API demarrée sur http://localhost:${port}`);
});