import Card from './Card'

import { cards } from '@data/data'


export default class Ninja {

    constructor(user = null) {
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

        // Player has already dealt this turn
        this.hasDealt = false

        if (user) this.setDeck()
    }

    setDeck() {
        // Shallow copy
        this.deck = Array.from(this.user.cards.deck)
    }

    filterDeckRegularCards() {
        this.deck = this.deck.filter(card => cards[card].powerId == 0)
    }

    isInDealt(card) {
        return this.dealt.some(dealt => dealt.id == card)
    }

    hasPlayableCards(element) {
        let filtered = this.getLimitedDealt(element)

        return Boolean(filtered.length)
    }

    getLimitedDealt(element) {
        return this.dealt.filter(dealt => dealt.element != element)
    }

    dealCards(dealPowers = true) {
        this.hasDealt = true

        if (!dealPowers) this.filterDeckRegularCards()

        let currentDealt = []
        let dealNumber = this.dealtSize - this.dealt.length

        for (let i = 0; i < dealNumber; i++) {
            let deal = this.dealCard()

            let card = new Card(deal)

            currentDealt.push(card)
            this.dealt.push(card)
        }

        return currentDealt
    }

    dealCard() {
        if (this.deck.length < 1) this.setDeck()

        let randomIndex = Math.floor(Math.random() * this.deck.length)
        let randomCard = this.deck[randomIndex]

        this.deck.splice(randomIndex, 1)

        return randomCard
    }

    pickCard(card) {
        this.pick = this.getPick(card)

        this.opponent.send('pick_card', { card: this.dealt.indexOf(this.pick) })

        this.dealt.splice(this.dealt.indexOf(this.pick), 1)
    }

    getPick(id) {
        return this.dealt.find(card => card.id == id)
    }

    revealCards() {
        this.send('reveal_card', { card: this.opponent.pick })
        this.opponent.send('reveal_card', { card: this.pick })
    }

    resetTurn() {
        this.pick = null
        this.hasDealt = false
    }

    send(action, args = {}) {
        this.user.send(action, args)
    }

}
