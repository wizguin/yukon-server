import BaseInstance from '../BaseInstance'

import CardPlayer from './CardPlayer'


export default class CardInstance extends BaseInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 998

        this.ninjas = {}

        this.rules = {
            f: 's',
            w: 'f',
            s: 'w'
        }

        this.handleSendDeal = this.handleSendDeal.bind(this)
        this.handlePickCard = this.handlePickCard.bind(this)
        this.handleLeaveGame = this.handleLeaveGame.bind(this)
    }

    init() {
        super.init()

        for (let user of this.users) {
            this.ninjas[user.id] = new CardPlayer(user)
        }

        for (let user of this.users) {
            let opponent = this.getOpponent(user)

            this.ninjas[user.id].opponent = this.ninjas[opponent.id]
        }
    }

    addListeners(user) {
        user.events.on('send_deal', this.handleSendDeal)
        user.events.on('pick_card', this.handlePickCard)
        user.events.on('leave_game', this.handleLeaveGame)

        super.addListeners(user)
    }

    removeListeners(user) {
        user.events.off('send_deal', this.handleSendDeal)
        user.events.off('pick_card', this.handlePickCard)
        user.events.off('leave_game', this.handleLeaveGame)

        super.removeListeners(user)
    }

    handleSendDeal(args, user) {
        let me = this.ninjas[user.id]

        let cards = me.dealCards()

        user.send('send_deal', { cards: cards })
        me.opponent.send('send_opponent_deal', { deal: cards.length })
    }

    handlePickCard(args, user) {
        let me = this.ninjas[user.id]

        if (!me.isInDealt(args.card) || me.pick) return

        me.pickCard(args.card)

        if (!me.opponent.pick) return

        me.revealCards()
        this.judgeRound(me)
    }

    handleLeaveGame(args, user) {
        this.remove(user)

        this.send('close_game', { username: user.username })
    }

    start() {
        let users = this.users.filter(Boolean).map(user => {
            return {
                username: user.username,
                color: user.color,
                ninjaRank: user.ninjaRank
            }
        })

        this.send('start_game', { users: users })

        super.start()
    }

    judgeRound(me) {
        let winner = this.getRoundWinner()

        this.send('judge', { winner: winner })

        if (winner > -1) this.checkWin(winner)

        me.pick = null
        me.opponent.pick = null
    }

    getRoundWinner() {
        let first = this.getPick(0)
        let second = this.getPick(1)

        return this.getWinningSeat(first, second)
    }

    getWinningSeat(first, second) {
        if (first.element != second.element) return this.compareElements(first, second)

        if (first.value > second.value) return 0

        if (second.value > first.value) return 1

        return -1
    }

    compareElements(first, second) {
        if (this.rules[first.element] == second.element) return 0

        return 1
    }

    checkWin(winSeat) {
        let winner = this.getNinja(winSeat)
        let winCard = winner.pick

        winner.wins[winCard.element].push(winCard)

        let winningCards = this.getWinningCards(winner)

        if (winningCards) {
            this.send('winner', { winner: winSeat, cards: winningCards.map(card => card.card_id) })

            this.users.forEach(user => this.remove(user))
        }
    }

    getWinningCards(winner) {
        let wins = Object.values(winner.wins)

        for (let element of wins) {
            let result = this.check1ElementWin(element)

            if (result) return result
        }

        let result = this.check3ElementWin(wins)

        if (result) return result

        return false
    }

    check1ElementWin(element) {
        let result = []
        let colors = []

        for (let card of element) {
            if (colors.includes(card.color)) continue

            result.push(card)
            colors.push(card.color)

            if (result.length == 3) return result
        }

        return false
    }

    check3ElementWin(cards) {
        let product = this.product(cards)

        for (let combo of product) {
            let colors = combo.map(card => card.color)

            if (colors.length == 3) return combo
        }

        return false
    }

    getPick(seat) {
        let ninja = this.getNinja(seat)

        return ninja.pick
    }

    getNinja(seat) {
        let user = this.users[seat]

        return this.ninjas[user.id]
    }

    getOpponent(user) {
        let seat = this.getSeat(user)
        let opponentSeat = this.getOppositeSeat(seat)

        return this.users[opponentSeat]
    }

    getOppositeSeat(seat) {
        return (seat + 1) % 2
    }

    product(arrays) {
        return arrays.reduce((acc, arr) => acc.flatMap(x => arr.map(y => [x, y].flat())))
    }

}
