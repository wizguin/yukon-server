import BaseInstance from '../BaseInstance'

import CardPlayer from './CardPlayer'


export default class CardInstance extends BaseInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 998

        this.ninjas = {}

        this.handleSendDeal = this.handleSendDeal.bind(this)
        this.handlePickCard = this.handlePickCard.bind(this)
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

        super.addListeners(user)
    }

    removeListeners(user) {
        user.events.off('send_deal', this.handleSendDeal)
        user.events.off('pick_card', this.handlePickCard)

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

        if (!me.isInDealt(args.card) || me.pick) {
            return
        }

        me.pick = user.crumbs.cards[args.card]

        me.opponent.send('pick_card', { card: me.dealt.indexOf(args.card) })
        delete me.dealt[args.card]

        if (!me.opponent.pick) {
            return
        }

        user.send('reveal_card', { card: me.opponent.pick })
        me.opponent.send('reveal_card', { card: me.pick })
    }

    start() {
        let users = this.users.filter(Boolean).map(user => {
            return {
                username: user.username,
                color: user.color
            }
        })

        this.send('start_game', { users: users })

        super.start()
    }

    getOpponent(user) {
        let seat = this.getSeat(user)
        let opponentSeat = (seat + 1) % 2

        return this.users[opponentSeat]
    }

}
