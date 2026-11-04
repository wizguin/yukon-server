import GamePlugin from '@plugin/GamePlugin'

import type GameUser from '@objects/user/GameUser'
import { getUserById } from '@utils/user'
import type { User } from '../../../generated/prisma/client'

import { type } from 'arktype'

const GetPlayer = type({
    id: 'number.integer'
})

export default class Get extends GamePlugin {

    events = {
        get_player: this.getPlayer
    }

    async getPlayer(args: unknown, user: GameUser) {
        const { id } = GetPlayer.assert(args)

        if (id in this.usersById) {
            return user.send('get_player', { penguin: this.formatGetPlayer(this.usersById[id]) })
        }

        if (!user.buddies.includes(id)) {
            return
        }

        const u = await getUserById(id)

        if (u) {
            user.send('get_player', { penguin: this.formatGetPlayer(u) })
        }
    }

    formatGetPlayer({ id, username, head, face, neck, body, hand, feet, color, photo, flag }: Partial<User>) {
        return {
            id,
            username,
            head,
            face,
            neck,
            body,
            hand,
            feet,
            color,
            photo,
            flag
        }
    }

}
