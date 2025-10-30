import GameUser from './GameUser'
import type Server from '../../server/Server'
import User from './User'

import type { Socket } from 'socket.io'

export default function(server: Server, socket: Socket) {
    const userClass = server.id === 'Login'
        ? User
        : GameUser

    return new userClass(server, socket)
}
