import Plugin from '@plugin/Plugin'

import { getUserById } from '@utils/user'
import type { User as PrismaUser } from '../../generated/prisma/client'
import type User from '@objects/user/User'

import { type } from 'arktype'

const GetPlayer = type({
    id: 'number.integer'
})

export default class Get extends Plugin {

    events = {
        get_player: this.getPlayer
    }

    async getPlayer(args: unknown, user: User) {
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

    formatGetPlayer({ id, username, head, face, neck, body, hand, feet, color, photo, flag }: Partial<PrismaUser>) {
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
