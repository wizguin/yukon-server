import { cards } from '@data/data'


export default class CardPlayer {

    constructor(user) {
        this.user = user

        this.opponent

        this.deck = []
        this.dealt = []
        this.pick

        this.wins = {
            f: [],
            w: [],
            s: []
        }

        this.dealtSize = 5

        this.setDeck()
    }

    setDeck() {
        //temp
        let deck = [1, 2, 3, 19, 19, 90, 90]

        this.deck = deck
    }

    isInDealt(card) {
        return this.dealt.includes(card)
    }

    dealCards() {
        let currentDealt = []
        let dealNumber = this.dealtSize - this.dealt.length

        if (this.deck.length < 1) {
            this.setDeck()
        }

        for (let i = 0; i < dealNumber; i++) {
            let deal = this.dealCard()

            currentDealt.push(cards[deal])
            this.dealt.push(deal)
        }

        return currentDealt
    }

    dealCard() {
        let randomIndex = Math.floor(Math.random() * this.deck.length)
        let randomCard = this.deck[randomIndex]

        this.deck.splice(randomIndex, 1)

        return randomCard
    }

    pickCard(card) {
        this.pick = cards[card]

        this.opponent.send('pick_card', { card: this.dealt.indexOf(card) })

        this.dealt.splice(this.dealt.indexOf(card), 1)
    }

    revealCards() {
        this.send('reveal_card', { card: this.opponent.pick })
        this.opponent.send('reveal_card', { card: this.pick })
    }

    send(action, args = {}) {
        this.user.send(action, args)
    }

}
