import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import type { User } from '../../../generated/prisma/client'

import { hasProps, isNumber } from '@utils/validation'
import { getUserById } from '@utils/user'

export default class Get extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            get_player: this.getPlayer
        }
    }

    async getPlayer(args: Args, user: GameUser) {
        if (!hasProps(args, 'id')) {
            return
        }

        if (!isNumber(args.id)) {
            return
        }

        if (args.id in this.usersById) {
            return user.send('get_player', { penguin: this.formatGetPlayer(this.usersById[args.id]) })
        }

        if (!user.buddies.includes(args.id)) {
            return
        }

        const u = await getUserById(args.id)

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
