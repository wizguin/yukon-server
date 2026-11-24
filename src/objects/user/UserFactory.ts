import GameUser from './GameUser'
import type Server from '../../server/Server'

import type { Socket } from 'socket.io'

export default function(server: Server, socket: Socket) {
    return new GameUser(server, socket)
}
