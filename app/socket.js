const soketListener = {
    global: (socket) => {
        console.log('coucou socket');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('chat message', (pseudo, msg) => {
            io.emit('chat message', pseudo, msg, date);
        });

        socket.on('is writing', (pseudo) => {
            io.emit('is writing', pseudo + ' est en train d\'écrire...');
        });
    },
};

module.exports = soketListener;