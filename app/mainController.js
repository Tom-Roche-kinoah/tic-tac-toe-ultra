const mainController = {
    index: () => {
        res.sendFile(__dirname + '/index.html');
    }
}

module.exports = mainController;