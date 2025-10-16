import GameUser from './GameUser'
import User from './User'

export default function(server, socket) {
    const userClass = server.id === 'Login'
        ? User
        : GameUser

    return new userClass(server, socket)
}
