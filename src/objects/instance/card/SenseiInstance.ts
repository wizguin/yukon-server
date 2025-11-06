// @ts-nocheck temp

import CardInstance from './CardInstance'

import SenseiNinja from './ninja/SenseiNinja'

export default class SenseiInstance extends CardInstance {

    constructor(user) {
        super({ users: [user] })

        this.user = user

        this.senseiData = {
            username: 'Sensei',
            color: 14,
            ninjaRank: 10,
            sensei: true
        }

        this.sensei = null
        this.me = null
    }

    init() {
        super.init()

        this.sensei = new SenseiNinja()
        this.me = this.ninjas[this.user.id]

        this.sensei.opponent = this.me
        this.me.opponent = this.sensei
    }

    start() {
        const users = [
            this.senseiData,
            {
                username: this.user.username,
                color: this.user.color,
                ninjaRank: this.user.ninjaRank
            }
        ]

        this.send('start_game', { users })

        this.started = true
    }

    handleStartGame() {
        this.start()
    }

    handleSendDeal(args, user) {
        if (this.me.hasDealt) {
            return
        }

        const canBeatSensei = user.ninjaRank >= this.itemAwards.length - 1

        const cards = this.me.dealCards(canBeatSensei)
        const senseiCards = this.sensei.dealCards(cards, canBeatSensei)

        user.send('send_deal', { cards })
        user.send('send_opponent_deal', { deal: senseiCards.length })
    }

    handlePickCard(args, _user) {
        if (!this.me.isInDealt(args.card) || this.me.pick) {
            return
        }

        this.me.pickCard(args.card)
        this.sensei.pickCard(args.card)

        this.me.revealCards()
        this.judgeRound(this.me)
    }

    updateProgress(user, won) {
        if (!user) {
            return
        }

        if (this.checkBlackBeltWin(user, won)) {
            user.update({ ninjaProgress: 100 })
        }

        super.updateProgress(user, won)
    }

    checkBlackBeltWin(user, won) {
        return user.ninjaRank == 9 && won
    }

    getNinja(seat) {
        return [this.sensei, this.me][seat]
    }

}
