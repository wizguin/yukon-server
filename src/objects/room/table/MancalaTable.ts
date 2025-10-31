import BaseTable from './BaseTable'

import type GameUser from '@objects/user/GameUser'

export default class MancalaTable extends BaseTable {

    init() {
        super.init()

        this.map = [
            4, 4, 4, 4, 4, 4, 0,
            4, 4, 4, 4, 4, 4, 0
        ]
    }

    sendMove(args: any, user: GameUser) {
        if (!this.started) {
            return
        }

        const hole = args.hole

        if (!this.isValidMove(user, hole)) {
            return
        }

        const move = this.makeMove(hole)
        this.send('send_move', { turn: this.currentTurn, hole, move })

        if (this.isGameOver()) {
            this.sendGameOver()
            return
        }

        if (move !== 'free') {
            this.currentTurn = this.currentTurn === 1 ? 2 : 1
        }
    }

    isValidMove(user: GameUser, hole: number) {
        if (this.map[hole] <= 0) {
            return false
        }

        const turn = this.users.indexOf(user) + 1
        if (turn != this.currentTurn) {
            return false
        }

        if (this.currentTurn === 1 && this.isTurn1Side(hole)) {
            return true
        }

        if (this.currentTurn === 2 && this.isTurn2Side(hole)) {
            return true
        }

        return false
    }

    makeMove(hole: number) {
        let stones = this.map[hole]

        this.map[hole] = 0

        while (stones > 0) {
            hole = this.getNextHole(hole)

            this.map[hole]++
            stones--
        }

        return this.checkLastHole(hole)
    }

    getNextHole(hole: number) {
        hole++
        const opponentMancala = this.currentTurn === 1 ? 13 : 6

        if (hole === opponentMancala) {
            hole++
        }

        if (hole > this.map.length - 1) {
            hole = 0
        }

        return hole
    }

    checkLastHole(hole: number) {
        // Capture
        const oppositeHole = 12 - hole
        const myMancala = this.currentTurn === 1 ? 6 : 13

        if (this.map[hole] === 1 && this.map[oppositeHole] > 0) {
            // Only if on your side
            if (this.currentTurn === 1 && this.isTurn1Side(hole) || this.currentTurn === 2 && this.isTurn2Side(hole)) {
                this.map[myMancala] += this.map[oppositeHole] + 1
                this.map[hole] = 0
                this.map[oppositeHole] = 0

                return 'capture'
            }
        }

        // Free turn
        if (this.currentTurn === 1 && hole === myMancala || this.currentTurn === 2 && hole === myMancala) {
            return 'free'
        }

        return ''
    }

    isGameOver() {
        // Sums not including mancalas
        const player1Sum = this.sum(this.map.slice(0, 6))
        const player2Sum = this.sum(this.map.slice(7, -1))

        if (player1Sum === 0 || player2Sum === 0) {
            return true
        }
    }

    sendGameOver() {
        // Sums including mancalas
        const player1Sum = this.sum(this.map.slice(0, 7))
        const player2Sum = this.sum(this.map.slice(7, 14))

        this.users[0].updateCoins(player1Sum, true)
        this.users[1].updateCoins(player2Sum, true)

        this.reset()
    }

    isTurn1Side(hole: number) {
        return hole >= 0 && hole <= 5
    }

    isTurn2Side(hole: number) {
        return hole >= 7 && hole <= 12
    }

    sum(array: number[]) {
        return array.reduce((previousValue, currentValue) => previousValue + currentValue, 0)
    }

    toJSON() {
        return {
            users: this.playingUsers,
            map: this.map,
            started: this.started,
            currentTurn: this.currentTurn
        }
    }

}
