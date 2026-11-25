import Plugin from '@plugin/Plugin'

import { getUsername } from '@utils/user'
import type User from '@objects/user/User'

import { type } from 'arktype'

const IgnoreId = type({
    id: 'number.integer'
})

export default class Ignore extends Plugin {

    events = {
        ignore_add: this.ignoreAdd,
        ignore_remove: this.ignoreRemove
    }

    async ignoreAdd(args: unknown, user: User) {
        const { id } = IgnoreId.assert(args)

        if (user.id === id) {
            return
        }

        if (user.buddies.includes(id)) {
            return
        }

        if (user.ignores.includes(id)) {
            return
        }

        const ignore = this.usersById[id]
        let username: string

        if (ignore) {
            username = ignore.username
            ignore.clearBuddyRequest(user.id)

        } else {
            username = await getUsername(id)
        }

        if (!username) {
            return
        }

        user.clearBuddyRequest(id)

        user.ignores.add(id)
        user.send('ignore_add', { id, username })
    }

    async ignoreRemove(args: unknown, user: User) {
        const { id } = IgnoreId.assert(args)

        if (!user.ignores.includes(id)) {
            return
        }

        await user.ignores.remove(id)
        user.send('ignore_remove', { id })
    }

}
