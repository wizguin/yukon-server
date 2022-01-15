const concurrently = require('concurrently')


const { result } = concurrently([
    'nodemon ./src/api/api.js --watch ./src/api --watch ./config --exec babel-node',
    'nodemon ./src/World.js Login --watch ./src --watch ./config --ignore ./src/api --exec babel-node',
    'nodemon ./src/World.js Blizzard --watch ./src --watch ./config --ignore ./src/api --exec babel-node'

], {
    prefix: 'index',
    killOthers: ['failure', 'success'],
    restartTries: 3
})

result.then(
    function onSuccess() {
        // This code is necessary to make sure the parent terminates
        // when the application is closed successfully.
        process.exit()
    },
    function onFailure() {
        // This code is necessary to make sure the parent terminates
        // when the application is closed because of a failure.
        process.exit()
    }
)
