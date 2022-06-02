const { Server } = require('socket.io');

const loggedInUsers = [];

const webSocket = {
    global: (server) => {
        const io = new Server(server);

        console.log('socket ok');

        io.on('connection', (socket) => {
            console.log(`new user connected : ${socket.id}`);
            // on envoit les infos de base UNIQUEMENT au nouveau client
            // par ex: la liste des users connectés
            socket.emit('all-users-logged-in', loggedInUsers);

            // découverte d'un user qui se connecte
            socket.on('user-logged-in', (user) => {
                // on envoie a tout le monde sauf l'emmeteur (= socket.broadcast)
                // les infos de l'user nouvellement connecté
                socket.broadcast.emit('user-logged-in', user);

                // puis on met a jour la liste des users connectés
                loggedInUsers.push(user);
            });

            // découverte d'un user qui se déco (manuel ou close tab/nav)
            socket.on('disconnect', () => {
                const userId = socket.id;
                // on le cherche et on le retire de la liste des users connectés
                const userIndex = loggedInUsers.findIndex(user => user.id === userId);
                const user = loggedInUsers[userIndex];
                loggedInUsers.splice(userIndex,1);

                console.log(`user diconnected : ${user}`);
                // puis on envoit les infos du client déconnectés aux autres clients
                socket.broadcast.emit('user-logged-out', user);
            });

            // reception d'un message chat
            socket.on('chat-message', (message) => {
                // on envoie le message à tout le monde sauf l'emmeteur
                socket.broadcast.emit('chat-message', message);
            });
        });


    },
};

// const webSoket = {
//     connectedUsers: [],
//     io: require('socket.io'),

//     global: (server) => {

//         // je detecte un user je lui passe direct un id
//         io.on('connection', (socket) => {
//             console.log('\n\n---------------------------------');
//             console.log('a user connected');
//             console.log('---------------------------------');
//             console.log(socket.id);
//         });

//         io.on('disconnect', () => {
//             // console.log('user disconnected');
//         });

//         io.on('user online', (pseudo) => {
//             // console.log(`${pseudo} est connecté`);
//             // connectedUsers.push({
//             //     id: userId,
//             //     pseudo: pseudo,
//             // });
//             // io.emit('online users', connectedUsers);
//         });

//         io.on('tchat message', (content) => {
//             // const date = new Date;
//             // const newContent = {
//             //     date: date.toLocaleTimeString(),
//             //     pseudo: content.pseudo,
//             //     message: content.message,
//             // };
//             // console.log(newContent.date, newContent.pseudo, newContent.message);
//             // io.emit('tchat message', newContent);
//         });

//         io.on('is writing', (pseudo) => {
//             // io.emit('is writing', pseudo + ' est en train d\'écrire...');
//         });
//     },
// };

module.exports = webSocket;