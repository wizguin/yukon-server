import GameUserMixin from './GameUserMixin'
import UserMixin from './UserMixin'


export default function(server, socket) {
    let user = server.db.buildUser()
    let mixin

    switch (server.id) {
        case 'Login':
            mixin = UserMixin
            break

        default:
            mixin = GameUserMixin
            break
    }

    Object.assign(user, mixin)
    user.init(server, socket)

    return user
}
