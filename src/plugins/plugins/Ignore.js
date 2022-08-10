import GamePlugin from '@plugin/GamePlugin'

import { hasProps, isNumber } from '@utils/validation'


export default class Ignore extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'ignore_add': this.addIgnore,
            'ignore_remove': this.removeIgnore
        }
    }

    addIgnore(args, user) {
        if (!hasProps(args, 'id', 'username')) {
            return
        }

        if (!isNumber(args.id)) {
            return
        }

        if (user.data.id == args.id) {
            return
        }

        if (user.buddy.includes(args.id)) {
            return
        }

        if (user.ignore.includes(args.id)) {
            return
        }

        // Remove any existing requests
        user.buddy.requests = user.buddy.requests.filter(item => item != args.id)

        let ignore = this.usersById[args.id]
        if (ignore) {
            ignore.buddy.requests = ignore.buddy.requests.filter(item => item != user.data.id)
        }

        this.db.ignores.create({
            userId: user.data.id,
            ignoreId: args.id

        }).then(() => {
            user.ignore.addIgnore(args.id, args.username)

        }).catch(() => {
            // Failed to find ignoreId in database
        })
    }

    removeIgnore(args, user) {
        if (!user.ignore.includes(args.id)) {
            return
        }

        user.ignore.removeIgnore(args.id)

        this.db.ignores.destroy({ where: { userId: user.data.id, ignoreId: args.id } })
    }

}
