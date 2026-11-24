import GamePlugin from '@plugin/GamePlugin'

import type GameUser from '@objects/user/GameUser'

export default class Sensei extends GamePlugin {

    events = {
        get_ninja: this.getNinja
    }

    getNinja(args: unknown, user: GameUser) {
        user.send('get_ninja', { rank: user.ninjaRank, progress: user.ninjaProgress, cards: user.cards })
    }

}
