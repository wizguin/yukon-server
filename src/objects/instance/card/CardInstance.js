import BaseInstance from '../BaseInstance'

import CardPlayer from './CardPlayer'


export default class CardInstance extends BaseInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 998
        this.players = []

        this.handleSendDeal = this.handleSendDeal.bind(this)
    }

    init() {
        super.init()

        for (let user of this.users) {
            this.players.push(new CardPlayer(user))
        }
    }

    addListeners(user) {
        user.events.on('send_deal', this.handleSendDeal)

        super.addListeners(user)
    }

    removeListeners(user) {
        user.events.off('send_deal', this.handleSendDeal)

        super.removeListeners(user)
    }

    handleSendDeal(args, user) {
        let seat = this.getSeat(user)
        let opponent = this.getOpponent(user)
        let me = this.players[seat]

        let cards = me.dealCards()

        user.send('send_deal', { cards: cards })
        opponent.send('send_opponent_deal', { deal: cards.length })
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
