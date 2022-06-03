const dom = {
    body: document.querySelector('body'),
    userList: document.querySelector('.user-list'),
    chat: document.querySelector('.chat-messages'),
    chatForm: document.querySelector('.chat-form'),
    chatMessageInput: document.querySelector('#chat-message'),
    myProfile: document.querySelector('.my-profile'),
    onlineTitle: document.querySelector('.online-title'),
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
    myProfile: () => {
        const profile = `
        <a href="#" title="${user.id}">
            <span class="user-pseudo">${user.pseudo}</span><br>
            <span class="user-id">#${user.id}</span>
        </a>`;
        dom.myProfile.insertAdjacentHTML('beforeend', profile);
    },
};

const socket = io();

const app = {
    // demarrage de l'app
    init: () => {
        app.socketListeners();
        chat.eventListeners();
        chatFunction.actionButtons();
        console.log('app started !');
    },

    socketListeners: () => {

        // je me suis connecté
        socket.on('connect', () => {
            user.id = socket.id;
            user.sayWelcome();
            //user.showUserId();
            socket.emit('user-logged-in', user);
            user.myProfile();
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
            if(user) {
                chat.userLoggedOut(user);
            }
        });

        // 1ere connexion, le serveur nous envoie la liste des users connectes actuellement
        socket.on('all-users-logged-in', (loggedInUsers) => {
            chat.loggedInUsers(loggedInUsers);
        });
        // 1ere connexion, le serveur nous envoie un historique du chat
        socket.on('chat-history', chatHistory => {
            chat.history(chatHistory);
        });

        // le serveur nous envoie un message chat
        socket.on('chat-message', (message) => {
            chat.displayMessage(message);
        });

    },
};


const chat = {
    userLoggedIn: (user) => {
        const item = `
        <a href="#" class="connected-user" data-id="${user.id}">
            ${user.pseudo}
        </a>`;
        dom.userList.insertAdjacentHTML('beforeend',item);
        chat.onlineUsers();
    },

    userLoggedOut: (user) => {
        const userToRemove = document.querySelector(`[data-id="${user.id}"]`);
        userToRemove.remove();
        chat.onlineUsers();
    },

    loggedInUsers: (loggedInUsers) => {
        dom.userList.innerText = '';
        for (const user of loggedInUsers) {
            const item = `
            <a href="#" class="connected-user" data-id="${user.id}" title="@Ping ${user.pseudo}">
                ${user.pseudo}
            </a>`;
            dom.userList.insertAdjacentHTML('beforeend',item);
            document.querySelector(`[data-id="${user.id}"]`).addEventListener('pointerdown', (e) => {
                e.preventDefault();
                dom.chatMessageInput.value = `@${user.pseudo}`;
            });
        }
        chat.onlineUsers();
    },

    onlineUsers: () => {
        const nbUserOnline = document.querySelectorAll('.user-list > *').length;
        let userOnlineText = 'Il n\'y a personne...';
        if(nbUserOnline > 0) {
            userOnlineText = `En ligne - <span>${nbUserOnline}</span>`;
        }
        dom.onlineTitle.innerHTML = userOnlineText;
    },

    history: (chatHistory) => {
        for (const message of chatHistory) {
            chat.displayMessage(message);
        }
    },

    displayMessage: (message) => {
        let messageClass = 'user';
        if(!message.date) {
            message.date = new Date();
        }
        if(message.pseudo === 'SYSTEM') {
            messageClass = 'system';
        }
        const item = `
        <div class="message ${messageClass}">
            <div class="message-meta">
                <span class="message-pseudo">${message.pseudo}</span>
                <span class="message-date">${utils.fullDateTextFr(message.date)}</span>
            </div>
            <div class="message-texte">${message.text}</div>
        </div>`;
        dom.chat.insertAdjacentHTML('beforeend',item);
        // on descend le chat au dernier affichage
        dom.chat.scrollTo(0, dom.chat.scrollHeight);
    },

    sendMessage: () => {
        let text = utils.sanitizeInput(dom.chatMessageInput.value);
        text = chatFunction.detectTags(text);

        if(!text) {
            console.log('Vous ne pouvez pas envoyer un message vide...');
            chat.clearInputMessage();
            return;
        }
        const message = {
            pseudo: user.pseudo,
            text: text,
        };
        socket.emit('chat-message', message );
        chat.displayMessage(message);
        chat.clearInputMessage();
    },

    clearInputMessage: () => {
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


const chatFunction = {
    actionButtons: () => {
        const buttons = document.querySelectorAll('.chat-actions button');
        console.log(buttons);
        buttons.forEach(button => {
            button.addEventListener('pointerdown', function(e) {
                e.preventDefault();
                const tag = this.dataset.tag;
                dom.chatMessageInput.value = tag;
            });
        });
    },

    detectTags: (input) => {
        if(input.includes('[img]')) {
            return chatFunction.img(input);
        } else {
            return input;
        }
    },

    img: (input) => {
        return input.replace(/\[img\](.*?)\[\/img\]/g, '<img src=\'$1\' />');
    },

};


const utils = {
    // nettoyage des saisies
    sanitizeInput: (input) => {
        return input.replace( /(<([^>]+)>)/ig, '').trim();
    },

    // gestion des dates
    fullDateTextFr: (date) => {
        let myDate = new Date(date);
        const longDatefrFRFormatter = new Intl.DateTimeFormat('fr-FR', {
            year:  'numeric',
            month: 'long',
            day:   'numeric',
        });
        const shortHourfrFRFormatter = new Intl.DateTimeFormat('fr-FR', {
            hour: 'numeric',
            minute: 'numeric',
        });
        const longHourfrFRFormatter = new Intl.DateTimeFormat('fr-FR', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        // est-ce aujourd'hui
        if(utils.isToday(myDate)) {
            // si oui on affiche seulement l'heure
            myDate = `${longHourfrFRFormatter.format(myDate)}`; 
        } else {
            // sinon c'est ancien, on affiche une date complete
            myDate = `le ${longDatefrFRFormatter.format(myDate)}, à ${shortHourfrFRFormatter.format(myDate)}`;
        }

        return myDate;
    },
    // est-ce aujourd'hui ?
    isToday: (date) => {
        const today = new Date();
        // si c'est pareil que la date fournie
        if (today.toDateString() === date.toDateString()) {
            return true;
        }
        return false;
    },
};


// chargement du document on lance app.init
document.addEventListener('DOMContentLoaded', app.init);

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