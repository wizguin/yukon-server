import BaseTable from './BaseTable'


export default class MancalaTable extends BaseTable {

    init() {
        super.init()

        this.map = [
            4, 4, 4, 4, 4, 4, 0,
            4, 4, 4, 4, 4, 4, 0
        ]
    }

    sendMove(args, user) {
        if (!this.started) {
            return
        }

        let hole = args.hole

        if (!this.isValidMove(user, hole)) {
            return
        }

        let move = this.makeMove(hole)
        this.send('send_move', { turn: this.currentTurn, hole: hole, move: move })

        if (this.isGameOver()) {
            this.sendGameOver()
        }

        if (move !== 'free') {
            this.currentTurn = (this.currentTurn === 1) ? 2 : 1
        }
    }

    isValidMove(user, hole) {
        if (this.map[hole] <= 0) {
            return false
        }

        let turn = this.users.indexOf(user) + 1
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

    makeMove(hole) {
        let stones = this.map[hole]

        this.map[hole] = 0

        while (stones > 0) {
            hole = this.getNextHole(hole)

            this.map[hole]++
            stones--
        }

        return this.checkLastHole(hole)
    }

    getNextHole(hole) {
        hole++
        let opponentMancala = (this.currentTurn === 1) ? 13 : 6

        if (hole === opponentMancala) {
            hole++
        }

        if (hole > this.map.length - 1) {
            hole = 0
        }

        return hole
    }

    checkLastHole(hole) {
        // Capture
        let oppositeHole = 12 - hole
        let myMancala = (this.currentTurn === 1) ? 6 : 13

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
        let player1Sum = this.sum(this.map.slice(0, 6))
        let player2Sum = this.sum(this.map.slice(7, -1))

        if (player1Sum === 0 || player2Sum === 0) {
            return true
        }
    }

    sendGameOver() {
        // Sums including mancalas
        let player1Sum = this.sum(this.map.slice(0, 7))
        let player2Sum = this.sum(this.map.slice(7, 14))

        this.users[0].updateCoins(player1Sum, true)
        this.users[1].updateCoins(player2Sum, true)

        this.reset()
    }

    isTurn1Side(hole) {
        return hole >= 0 && hole <= 5
    }

    isTurn2Side(hole) {
        return hole >= 7 && hole <= 12
    }

    sum(array) {
        return array.reduce((previousValue, currentValue) => {
            return previousValue + currentValue
        }, 0)
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
