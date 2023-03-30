export default class CardPlayer {

    constructor(user) {
        this.user = user
        this.opponent

        this.cards = user.crumbs.cards

        this.deck = []
        this.dealt = []
        this.pick

        this.dealtSize = 5

        this.setDeck()
    }

    get dealtObjects() {
        return this.dealt.map(id => this.cards[id])
    }

    setDeck() {
        //temp
        let deck = [1, 2, 3, 5, 19]

        this.deck = deck
    }

    isInDealt(card) {
        return this.dealt.includes(card)
    }

    dealCards() {
        let dealNumber = this.dealtSize - this.dealt.length

        if (this.deck.length < 1) {
            this.setDeck()
        }

        for (let i = 0; i < dealNumber; i++) {
            this.dealt.push(this.dealCard())
        }

        return this.dealtObjects
    }

    dealCard() {
        let randomIndex = Math.floor(Math.random() * this.deck.length)
        let randomCard = this.deck[randomIndex]

        this.deck.splice(randomIndex, 1)

        return randomCard
    }

    send(action, args = {}) {
        this.user.send(action, args)
    }

}
