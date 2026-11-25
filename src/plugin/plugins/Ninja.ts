import GamePlugin from '@plugin/GamePlugin'

import type User from '@objects/user/User'

export default class Sensei extends GamePlugin {

    events = {
        get_ninja: this.getNinja
    }

    getNinja(args: unknown, user: User) {
        user.send('get_ninja', { rank: user.ninjaRank, progress: user.ninjaProgress, cards: user.cards })
    }

}
