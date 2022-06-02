const dom = {
    body: document.querySelector('body'),
    userList: document.querySelector('.user-list'),
    chat: document.querySelector('.chat-messages'),
    chatForm: document.querySelector('.chat-form'),
    chatMessageInput: document.querySelector('#chat-message'),
};



function randomName() {
    const list = ['Kira Gibson','Kiera Morin','Skylar Mackay','Ivy-Rose Corrigan','Ed Mustafa','Michael Nieves','Claire Rivas','Norma Busby','Brook Finch','Dorian Andrade','Hailie Schmidt','Abdur Mcdaniel','Sanaya Cisneros','Ayrton Barrett','Lacey-Mae Mcleod','Kelsea Fowler','Hadley Howarth','Claudia Cordova','Lance Church','Adnan Navarr'];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}
const user = {
    pseudo: randomName(), // pour test
    id: 'undefined',

    showUserId: () => {
        const message = {
            pseudo: 'SYSTEM',
            text: `Votre id : ${user.id}`,
        };
        chat.displayMessage(message);
    },
    sayWelcome: () => {
        const message = {
            pseudo: 'SYSTEM',
            text: `Bienvenue ${user.pseudo}`,
        };
        chat.displayMessage(message);
    },
};

const socket = io();

const app = {
    // demarrage de l'app
    init: () => {
        app.socketListeners();
        chat.eventListeners();
        console.log('app started !');
    },

    socketListeners: () => {

        // je me suis connecté
        socket.on('connect', () => {
            user.id = socket.id;
            user.sayWelcome();
            //user.showUserId();
            socket.emit('user-logged-in', user);
        });

        // un autre utilisateur s'est connecté
        socket.on('user-logged-in', (user) => {
            chat.userLoggedIn(user);
            const message = {
                pseudo: 'SYSTEM',
                text: `${user.pseudo} s'est connecté(e)`,
            };
            chat.displayMessage(message);
        });

        // un utilisateur s'est déconnecté
        socket.on('user-logged-out', (user) => {
            chat.userLoggedOut(user);
        });

        // le serveur nous envoie la liste des user mise à jour
        socket.on('all-users-logged-in', (loggedInUsers) => {
            console.log('liste des users online reçue');
            chat.loggedInUsers(loggedInUsers);
        });

        // le serveur nous envoie un message chat
        socket.on('chat-message', (message) => {
            chat.displayMessage(message);
        });

    },
};


const chat = {
    userLoggedIn: (user) => {
        const item = document.createElement('li');
        item.innerText = user.pseudo;
        item.dataset.id = user.id;
        dom.userList.appendChild(item);
    },

    userLoggedOut: (user) => {
        const userToRemove = document.querySelector(`[data-id="${user.id}"]`);
        userToRemove.remove();
    },

    loggedInUsers: (loggedInUsers) => {
        dom.userList.innerText = '';
        for (const user of loggedInUsers) {
            const item = document.createElement('li');
            item.innerText = user.pseudo;
            item.dataset.id = user.id;
            dom.userList.appendChild(item);
        }
    },

    displayMessage: (message) => {
        const date = new Date;
        let messageClass = 'user';
        const timeStamp = date.toLocaleTimeString();
        if(!message.date) {
            message.date = timeStamp;
        }
        if(message.pseudo === 'SYSTEM') {
            messageClass = 'system';
        }
        const item = `
        <div class="message ${messageClass}">
            <div class="message-meta">
                <span class="message-pseudo">${message.pseudo}</span>
                <span class="message-date">${message.date}</span>
            </div>
            <div class="message-texte">${message.text}</div>
        </div>`;
        dom.chat.insertAdjacentHTML('beforeend',item);
        // on descend le chat au dernier affichage
        dom.chat.scrollTo(0, dom.chat.scrollHeight);
    },

    sendMessage: () => {
        const text = dom.chatMessageInput.value;
        if(!text) {
            console.log('Vous ne pouvez pas envoyer un message vide...');
            return;
        }
        const message = {
            pseudo: user.pseudo,
            text: text,
        };
        socket.emit('chat-message', message );
        chat.displayMessage(message);
        dom.chatMessageInput.value = '';
    },





    // les events disponibles pour le chat
    eventListeners: () => {
        dom.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            chat.sendMessage();
        });
    },
};


app.init();

// const app = {
//     // demarrage de l'app
//     init: () => {

//         app.socketListeners();
//         //app.showLoginView();
//         app.showLobbyView(); // pour test
//         console.log('app started !');
//     },

//     // elements récurrents
//     socket: io(),
//     appElement: document.querySelector('#app'),

//     // Vue : login
//     showLoginView: () => {
//         app.viewClass('view-login');
//         const loginView = `
//         <div class="login-form">
//             <h2>Connexion</h2>
//             <form action="#" method="POST">
//                 <input type="text" id="pseudo" name="pseudo" placeholder="pseudo">
//                 <button>Connexion</button>
//             </form>
//         </div>`;
//         app.appElement.innerHTML = loginView;
//         document.querySelector('.login-form form').addEventListener('submit', (e) => {
//             e.preventDefault();
//             app.postLoginView();
//         });
//     },
//     postLoginView: () => {
//         user.pseudo = document.querySelector('.login-form #pseudo').value;
//         user.pseudo = utils.sanitizeInput(user.pseudo);
//         if (user.pseudo === '') {
//             return console.log('Pseudo obligatoire...');
//         }
//         tchat.userConnected();
//         app.hideLoginView();
//     },
//     hideLoginView: () => {
//         document.querySelector('.login-form').remove();
//         app.showLobbyView();
//     },


//     // Vue : lobby
//     showLobbyView: () => {
//         app.viewClass('view-lobby');
//         const lobbyView = `
//         <div class="game-zone">
//         </div>

//         <div class="tchat-zone">
//             <div class="tchat-messages">
//             </div>
//             <div class="tchat-form">
//                 <form action="#" method="POST">
//                     <input type="text" id="message" name="message" placeholder="message" autocomplete="off">
//                     <button>↵</button>
//                 </form>
//             </div>
//         </div>

//         <div class="user-zone">
//         </div>
//         `;
//         app.appElement.innerHTML = lobbyView;
//         document.querySelector('.tchat-form').addEventListener('submit', (e) => {
//             e.preventDefault();
//             tchat.sendMessage();
//             tchat.clearTchatInput();
//         });
//     },

//     socketListeners: () => {
//         app.socket.on('connection', (socket) => {
//             console.log(`Bienvenue ${socket.id}`);
//         });

//         app.socket.on('tchat message', function(content) {
//             const item = `
//               <div class="message">
//                   <div class="message-meta">
//                       <span class="message-pseudo">${content.pseudo}</span>
//                       <span class="message-date">${content.date}</span>
//                   </div>
//                   <div class="message-texte">${content.message}</div>
//               </div>`;
//             const tchatMessagesElement = document.querySelector('.tchat-messages');
//             tchatMessagesElement.insertAdjacentHTML('beforeend',item);
//             // on descend le chat au dernier affichage
//             tchatMessagesElement.scrollTo(0, tchatMessagesElement.scrollHeight);
//         });

//         app.socket.on('online users', function(connectedUsers) {
//             const userZoneElement = document.querySelector('.user-zone');
//             userZoneElement.innerHTML = '';
//             connectedUsers.forEach( user => {
//                 const element = `
//                     <a href="#" class="connected-user" data-id="${user.id}">
//                         ${user.pseudo}
//                     </a>
//                 `;
//                 userZoneElement.insertAdjacentHTML('beforeend',element);
//             });
//         });

//         app.socket.on('disconnect', function() {
//             /// todo
//         });
//     },

//     // Ajoute une class à l'element app pour differencier les vue au global
//     viewClass: (className) => {
//         // on enleve toutes les classes
//         app.appElement.className = '';
//         // on applique la bonne
//         app.appElement.classList.add(className);
//     },
// };


// const tchat = {
//     // un utilisateur est connecté
//     userConnected: () => {
//         app.socket.emit('user online', user.pseudo);
//     },

//     // envoyer message
//     sendMessage: () => {
//         let message = document.querySelector('#message').value;
//         message = utils.sanitizeInput(message);
//         if( message === '' ) {
//             return console.log('dont post empty message !');
//         }
//         const content = {
//             pseudo: user.pseudo,
//             message: message,
//         };
//         app.socket.emit('tchat message', content);
//     },

//     // effacer l'input du tchat
//     clearTchatInput: () => {
//         document.querySelector('#message').value = '';
//     },
// };


// const utils = {
//     // nettoyage des saisies
//     sanitizeInput: (input) => {
//         return input.replace( /(<([^>]+)>)/ig, '').trim();
//     },
// };

// app.init();