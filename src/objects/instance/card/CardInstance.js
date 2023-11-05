import BaseInstance from '../BaseInstance'

import Power from './Power'
import Ninja from './ninja/Ninja'
import Rules from './Rules'


export default class CardInstance extends BaseInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 998

        this.ninjas = {}

        this.powers = []

        // xpPercentageIncrease(0) = 60
        this.xpPercentageStart = 60

        this.rankSpeed = 1

        this.awards = [4025, 4026, 4027, 4028, 4029, 4030, 4031, 4032, 4033, 104]

        this.handleSendDeal = this.handleSendDeal.bind(this)
        this.handlePickCard = this.handlePickCard.bind(this)
    }

    init() {
        super.init()

        for (let user of this.users) {
            this.ninjas[user.id] = new Ninja(user)
        }

        for (let user of this.users) {
            let opponent = this.getOpponent(user)

            if (opponent) this.ninjas[user.id].opponent = this.ninjas[opponent.id]
        }
    }

    addListeners(user) {
        user.events.on('send_deal', this.handleSendDeal)
        user.events.on('pick_card', this.handlePickCard)

        super.addListeners(user)
    }

    removeListeners(user) {
        user.events.off('send_deal', this.handleSendDeal)
        user.events.off('pick_card', this.handlePickCard)

        super.removeListeners(user)
    }

    handleSendDeal(args, user) {
        let me = this.ninjas[user.id]

        if (me.hasDealt) return

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

    start() {
        let users = this.users.map(user => {
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

        me.resetTurn()
        me.opponent.resetTurn()
    }

    getRoundWinner() {
        let first = this.getPick(0)
        let second = this.getPick(1)

        this.applyPowers(first, second)

        this.powers = []

        this.checkPowersOnPlayed()
        this.checkPowerOnScored(first, second)

        return this.getWinningSeat(first, second)
    }

    applyPowers(first, second) {
        for (let power of this.powers) {
            let id = power.id

            if (id == 1) this.reverseCardValues(first, second)

            // +2 to self
            if (id == 2) {
                let target = power.seat == 0 ? first : second
                target.value += 2
            }

            // -2 from opponent
            if (id == 3) {
                let target = power.seat == 0 ? second : first
                target.value -= 2
            }
        }
    }

    reverseCardValues(first, second) {
        let swap = first.value

        first.value = second.value
        second.value = swap
    }

    checkPowersOnPlayed() {
        this.checkPowerOnPlayed(0)
        this.checkPowerOnPlayed(1)
    }

    checkPowerOnPlayed(seat) {
        this.checkPower(seat, true)
    }

    checkPowerOnScored(first, second) {
        let winSeat = this.getWinningSeat(first, second)

        if (winSeat > -1) this.checkPower(winSeat, false)
    }

    checkPower(seat, onPlayed) {
        let card = this.getPick(seat)

        if (!this.hasPower(card)) return

        if (onPlayed && !this.isOnPlayed(card)) return
        if (!onPlayed && this.isOnPlayed(card)) return

        if (!Rules.currentRound.includes(card.powerId)) {
            this.addPower(seat, card)
            return
        }

        if (onPlayed) {
            this.replaceCards(card)
        } else {
            this.discardCards(card, seat)
        }
    }

    hasPower(card) {
        return card.powerId > 0
    }

    isOnPlayed(card) {
        return Rules.onPlayed.includes(card.powerId)
    }

    addPower(seat, card) {
        if (card.powerId == 1) {
            let hasReverse = this.powers.some(power => power.id == 1)

            if (hasReverse) return
        }

        this.powers.push(new Power(seat, card))
    }

    replaceCards(card) {
        let first = this.getPick(0)
        let second = this.getPick(1)

        let [original, replace] = Rules.replacements[card.powerId]

        if (first.element == original) first.element = replace

        if (second.element == original) second.element = replace
    }

    discardCards(card, seat) {
        let opponent = this.getNinja(seat).opponent

        if (card.powerId in Rules.discardElements) this.discardElements(card, opponent)

        if (card.powerId in Rules.discardColors) this.discardColors(card, opponent)
    }

    discardElements(card, opponent) {
        let element = Rules.discardElements[card.powerId]

        if (opponent.wins[element].length) opponent.wins[element].pop()
    }

    discardColors(card, opponent) {
        let color = Rules.discardColors[card.powerId]
        let wins = opponent.wins

        for (let element in wins) {
            let index = wins[element].findIndex(win => win.color == color)

            if (index > -1) {
                wins[element].splice(index, 1)
                return
            }
        }
    }

    getWinningSeat(first, second) {
        if (first.element != second.element) return this.compareElements(first, second)

        if (first.value > second.value) return 0

        if (second.value > first.value) return 1

        return -1
    }

    compareElements(first, second) {
        if (Rules.elements[first.element] == second.element) return 0

        return 1
    }

    checkWin(winSeat) {
        let winner = this.getNinja(winSeat)
        let winCard = winner.pick

        let loser = this.getNinja(this.getOppositeSeat(winSeat))

        winner.wins[winCard.originalElement].push(winCard)

        let winningCards = this.getWinningCards(winner)

        if (winningCards) {
            this.updateNinja(winner, loser)
            this.sendWin(winSeat, winningCards)

        } else {
            this.checkPlayable()
        }
    }

    sendWin(winSeat, winningCards = []) {
        this.send('winner', { winner: winSeat, cards: winningCards.map(card => card.id) })

        this.users.forEach(user => super.remove(user))
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
            let colors = new Set(combo.map(card => card.color))

            if (colors.size == 3) return combo
        }

        return false
    }

    checkPlayable() {
        let ninjas = [this.getNinja(0), this.getNinja(1)]

        for (let ninja of ninjas) {
            if (this.hasPlayableCards(ninja)) continue

            let winSeat = ninjas.indexOf(ninja.opponent)

            this.updateNinja(ninja.opponent, ninja)
            this.sendWin(winSeat)

            return
        }
    }

    hasPlayableCards(ninja) {
        let limiters = this.powers.filter(power => power.id in Rules.limiters)

        for (let limiter of limiters) {
            let element = Rules.limiters[limiter.id]

            let target = this.getNinja(this.getOppositeSeat(limiter.seat))

            if (target == ninja) return ninja.hasPlayableCards(element)
        }

        return true
    }

    updateNinja(winner, loser) {
        this.updateProgress(winner.user, true)
        this.updateProgress(loser.user, false)
    }

    updateProgress(user, won) {
        if (this.checkNoBeltWin(user, won)) {
            user.update({ ninjaProgress: 100 })

        } else if (user.ninjaRank < 9) {
            let speed = won ? this.rankSpeed : this.rankSpeed * 0.5

            let increase = this.xpPercentageIncrease(user.ninjaRank) * speed

            user.update({ ninjaProgress: user.ninjaProgress + increase })
        }

        if (user.ninjaProgress >= 100) this.rankUp(user)
    }

    checkNoBeltWin(user, won) {
        return user.ninjaRank == 0 && won
    }

    xpPercentageIncrease(rank) {
        return Math.floor(this.xpPercentageStart / (rank + 1))
    }

    rankUp(user) {
        let rank = user.ninjaRank + 1

        if (rank > this.awards.length) return

        this.addAward(user, rank)

        user.update({ ninjaRank: rank })
        user.update({ ninjaProgress: 0 })

        user.send('award', { rank: user.ninjaRank })
    }

    addAward(user, rank) {
        let award = this.awards[rank - 1]

        if (user.inventory.includes(award)) return

        user.inventory.add(award)
    }

    remove(user) {
        super.remove(user)

        this.closeGame(user)
    }

    closeGame(user) {
        this.send('close_game', { username: user.username })
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
