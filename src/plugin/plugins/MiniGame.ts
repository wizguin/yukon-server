import GamePlugin from '@plugin/GamePlugin'

import type User from '@objects/user/User'

import { type } from 'arktype'

const GameOver = type({
    coins: 'number.integer'
})

export default class Minigame extends GamePlugin {

    events = {
        get_game: this.getGame,
        join_game: this.joinGame,
        send_move: this.sendMove,
        game_over: this.gameOver
    }

    getGame(args: unknown, user: User) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.getGame(args, user)
        }
    }

    joinGame(args: unknown, user: User) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            user.minigameRoom.joinGame(args, user)
        }
    }

    async sendMove(args: unknown, user: User) {
        if (user.minigameRoom) {
            // @ts-expect-error temp
            await user.minigameRoom.sendMove(args, user)
        }
    }

    async gameOver(args: unknown, user: User) {
        const { coins } = GameOver.assert(args)

        if (user.room?.game || user.minigameRoom) {
            await user.addCoins(coins, true)
        }
    }

}
