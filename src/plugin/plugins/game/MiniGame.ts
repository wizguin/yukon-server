import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

export default class Minigame extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            get_game: this.getGame,
            join_game: this.joinGame,
            send_move: this.sendMove,
            game_over: this.gameOver
        }
    }

    getGame(args: Args, user: GameUser) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.getGame(args, user)
        }
    }

    joinGame(args: Args, user: GameUser) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.joinGame(args, user)
        }
    }

    sendMove(args: Args, user: GameUser) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.sendMove(args, user)
        }
    }

    gameOver(args: Args, user: GameUser) {
        if (user.room?.game || user.minigameRoom) {
            user.updateCoins(args.coins, true)
        }
    }

}
