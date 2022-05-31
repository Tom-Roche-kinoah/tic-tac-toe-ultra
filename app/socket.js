const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket, pseudo) => {
    const date = dateNow();
    console.log(`${pseudo} is connected`);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('chat message', (pseudo, msg) => {
      io.emit('chat message', pseudo, msg, date);
    });
    socket.on('is writing', (pseudo) => {
        io.emit('is writing', pseudo + " est en train d'écrire...");
    });
});