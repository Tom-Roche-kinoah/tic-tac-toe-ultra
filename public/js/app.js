const user = {
    pseudo: '',
};

const app = {
    // demarrage de l'app
    init: () => {
        app.showLoginView();
        console.log('app started !');
    },

    // elements récurents
    appElement: document.querySelector('#app'),


    // Vue : login
    showLoginView: () => {
        app.viewClass('view-login');
        const loginView = `
        <div class="login-form">
            <h2>Connexion</h2>  
            <form action="#" method="POST">
                <input type="text" id="pseudo" name="pseudo" placeholder="pseudo">
                <button>Connexion</button>
            </form>
        </div>`;
        app.appElement.innerHTML = loginView;
        document.querySelector('.login-form form').addEventListener('submit', (e) => {
            e.preventDefault();
            app.postLoginView();
        });
    },
    postLoginView: () => {
        user.pseudo = document.querySelector('.login-form #pseudo').value;
        user.pseudo = utils.sanitizeInput(user.pseudo);
        if (user.pseudo === '') {
            return console.log('Pseudo obligatoire...');
        }
        console.log(`${user.pseudo} s'est connecté`);
        app.hideLoginView();
    },

    hideLoginView: () => {
        document.querySelector('.login-form').remove();
        app.showLobbyView();
    },


    // Vue : lobby
    showLobbyView: () => {
        app.viewClass('view-lobby');
        const lobbyView = `
        <div class="game-zone">
        </div>

        <div class="tchat-zone">
            <div class="tchat-messages">
            </div>
            <div class="tchat-form">
                <form action="#" method="POST">
                    <input type="text" id="message" name="message" placeholder="message" autocomplete="off">
                    <button>Envoyer</button>
                </form>
            </div>
        </div>

        <div class="user-zone">
        </div>
        `;
        app.appElement.innerHTML = lobbyView;
        // document.querySelector('.login-form form').addEventListener('submit', (e) => {
        //     e.preventDefault();
        //     app.postLoginView();
        // });
    },



    // Ajoute une class à l'element app pour differencier les vue au global
    viewClass: (className) => {
        // on enleve toutes les classes
        app.appElement.className = '';
        // on applique la bonne
        app.appElement.classList.add(className);
    } 
};

const utils = {
    // nettoyage des saisies
    sanitizeInput: (input) => {
        return input.replace( /(<([^>]+)>)/ig, '').trim();
    },
};

app.init();