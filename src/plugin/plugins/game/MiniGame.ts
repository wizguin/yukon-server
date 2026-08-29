import GamePlugin from '@plugin/GamePlugin'

import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

const GameOver = type({
    coins: 'number'
})

export default class Minigame extends GamePlugin {

    events = {
        get_game: this.getGame,
        join_game: this.joinGame,
        send_move: this.sendMove,
        game_over: this.gameOver
    }

    getGame(args: unknown, user: GameUser) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.getGame(args, user)
        }
    }

    joinGame(args: unknown, user: GameUser) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.joinGame(args, user)
        }
    }

    sendMove(args: unknown, user: GameUser) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.sendMove(args, user)
        }
    }

    gameOver(args: unknown, user: GameUser) {
        const { coins } = GameOver.assert(args)

        if (user.room?.game || user.minigameRoom) {
            user.updateCoins(coins, true)
        }
    }

}
