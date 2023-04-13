import CardInstance from './CardInstance'

import CardPlayer from './CardPlayer'


export default class SenseiInstance extends CardInstance {

    constructor(user) {
        super({ users: [user] })

        this.user = user

        this.senseiData = {
            username: 'Sensei',
            color: 14,
            ninjaRank: 10
        }

        this.sensei
        this.me
    }

    start() {
        let users = [
            this.senseiData,
            {
                username: this.user.username,
                color: this.user.color,
                ninjaRank: this.user.ninjaRank
            }
        ]

        this.send('start_game', { users: users })

        this.started = true
    }

    init() {
        super.init()

        this.sensei = new CardPlayer()

        // temp
        this.sensei.setDeck(Array(10).fill(1))

        this.me = this.ninjas[this.user.id]

        this.sensei.opponent = this.me
        this.me.opponent = this.sensei
    }

    handleStartGame() {
        this.start()
    }

    handleSendDeal(args, user) {
        super.handleSendDeal(args, user)

        let cards = this.sensei.dealCards()

        user.send('send_opponent_deal', { deal: cards.length })
    }

    handlePickCard(args, user) {
        // temp
        this.sensei.pickCard(1)

        super.handlePickCard(args, user)
    }

    getNinja(seat) {
        return [this.sensei, this.me][seat]
    }

    send(action, args = {}) {
        this.user.send(action, args)
    }

}
