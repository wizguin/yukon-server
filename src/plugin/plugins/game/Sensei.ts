import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import SenseiInstance from '@objects/instance/card/SenseiInstance'

export default class Sensei extends GamePlugin {

    senseiRoom = 951

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            join_sensei: this.joinSensei
        }
    }

    joinSensei(args: Args, user: GameUser) {
        if (user.room?.id != this.senseiRoom) {
            return
        }

        if (!user.cards.hasCards) {
            return
        }

        const instance = new SenseiInstance(user)

        instance.init()
    }

}
