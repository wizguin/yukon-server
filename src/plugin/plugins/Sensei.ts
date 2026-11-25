import Plugin from '@plugin/Plugin'

import type User from '@objects/user/User'

import SenseiInstance from '@objects/instance/card/SenseiInstance'

const senseiRoom = 951

export default class Sensei extends Plugin {

    events = {
        join_sensei: this.joinSensei
    }

    joinSensei(args: unknown, user: User) {
        if (user.room?.id !== senseiRoom) {
            return
        }

        if (!user.cards.hasCards) {
            return
        }

        const instance = new SenseiInstance(user)

        instance.init()
    }

}
