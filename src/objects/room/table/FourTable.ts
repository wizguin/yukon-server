import BaseTable from './BaseTable'

import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

const SendMove = type({
    column: '0 <= number <= 6'
})

export default class FourTable extends BaseTable {

    init() {
        super.init()

        this.map = Array.from({ length: 7 }, () => Array(6).fill(0))
    }

    sendMove(args: unknown, user: GameUser) {
        const { column } = SendMove.assert(args)

        if (!this.started) {
            return
        }

        if (!this.isValidMove(user, column)) {
            return
        }

        const move = this.makeMove(column)

        this.send('send_move', { turn: this.currentTurn, x: move[0], y: move[1] })

        const opponent = this.users[this.currentTurn === 1 ? 1 : 0]

        if (this.isWin(move[0], move[1])) {
            user.updateCoins(10, true)
            opponent.updateCoins(5, true)

            this.reset()
            return
        }

        if (this.isFull()) {
            user.updateCoins(5, true)
            opponent.updateCoins(5, true)

            this.reset()
            return
        }

        this.currentTurn = this.currentTurn === 1 ? 2 : 1
    }

    isValidMove(user: GameUser, col: number) {
        const turn = this.users.indexOf(user) + 1

        if (turn !== this.currentTurn) {
            return false
        }

        if (this.map[col][0] !== 0) {
            return false
        }

        return true
    }

    makeMove(col: number) {
        const row = this.map[col].lastIndexOf(0)
        this.map[col][row] = this.currentTurn

        return [col, row]
    }

    isWin(col: number, row: number) {
        for (let [deltaRow, deltaCol] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
            let streak = 1

            for (const delta of [1, -1]) {
                deltaRow *= delta
                deltaCol *= delta

                let nextRow = row + deltaRow
                let nextCol = col + deltaCol

                while (nextRow >= 0 && nextRow < 6 && nextCol >= 0 && nextCol < 7) {
                    if (this.map[nextCol][nextRow] === this.currentTurn) {
                        streak++
                    } else {
                        break
                    }

                    if (streak === 4) {
                        return true
                    }

                    nextRow += deltaRow
                    nextCol += deltaCol
                }
            }
        }

        return false
    }

    isFull() {
        for (const col of this.map) {
            if (!col[0]) {
                return false
            }
        }

        return true
    }

}
