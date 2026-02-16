import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { hasProps, isNumber } from '@utils/validation'
import { getUsername } from '@utils/user'

export default class Ignore extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            ignore_add: this.ignoreAdd,
            ignore_remove: this.ignoreRemove
        }
    }

    async ignoreAdd(args: Args, user: GameUser) {
        if (!hasProps(args, 'id')) {
            return
        }

        if (!isNumber(args.id)) {
            return
        }

        if (user.id == args.id) {
            return
        }

        if (user.buddies.includes(args.id)) {
            return
        }

        if (user.ignores.includes(args.id)) {
            return
        }

        const ignore = this.usersById[args.id]
        let username: string

        if (ignore) {
            username = ignore.username
            ignore.clearBuddyRequest(user.id)

        } else {
            username = await getUsername(args.id)
        }

        if (!username) {
            return
        }

        user.clearBuddyRequest(args.id)

        user.ignores.add(args.id)
        user.send('ignore_add', { id: args.id, username })
    }

    ignoreRemove(args: Args, user: GameUser) {
        if (!user.ignores.includes(args.id)) {
            return
        }

        user.ignores.remove(args.id)
        user.send('ignore_remove', { id: args.id })
    }

}
