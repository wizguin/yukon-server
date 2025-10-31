import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

export default class Sensei extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            get_ninja: this.getNinja
        }
    }

    getNinja(args: Args, user: GameUser) {
        user.send('get_ninja', { rank: user.ninjaRank, progress: user.ninjaProgress, cards: user.cards })
    }

}
