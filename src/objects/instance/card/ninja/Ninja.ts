import Card from './Card'

import type User from '@objects/user/User'

import { cards } from '@data'

export type ElementCards = [Card[], Card[], Card[]]

export default class Ninja {

    user: User | null
    opponent: Ninja | null
    deck: number[]
    dealt: Card[]
    pick: Card | null | undefined
    wins: Record<string, Card[]>
    dealtSize: number
    hasDealt: boolean

    constructor(user: User | null = null) {
        this.user = user

        this.opponent = null

        this.deck = []
        this.dealt = []
        this.pick = null

        this.wins = {
            f: [],
            w: [],
            s: []
        }

        this.dealtSize = 5

        // Player has already dealt this turn
        this.hasDealt = false

        if (user) {
            this.setDeck()
        }
    }

    getWinValues(): ElementCards {
        return [this.wins.f, this.wins.w, this.wins.s]
    }

    setDeck() {
        if (!this.user) {
            return
        }

        // Shallow copy
        this.deck = Array.from(this.user.cards.deck)
    }

    filterDeckRegularCards() {
        this.deck = this.deck.filter(card => cards[card].powerId === 0)
    }

    isInDealt(card: number) {
        return this.dealt.some(dealt => dealt.id === card)
    }

    hasPlayableCards(element: string) {
        const filtered = this.getLimitedDealt(element)

        return Boolean(filtered.length)
    }

    getLimitedDealt(element: string) {
        return this.dealt.filter(dealt => dealt.element !== element)
    }

    dealCards(dealPowers = true) {
        this.hasDealt = true

        if (!dealPowers) {
            this.filterDeckRegularCards()
        }

        const currentDealt = []
        const dealNumber = this.dealtSize - this.dealt.length

        for (let i = 0; i < dealNumber; i++) {
            const deal = this.dealCard()

            const card = new Card(deal)

            currentDealt.push(card)
            this.dealt.push(card)
        }

        return currentDealt
    }

    dealCard() {
        if (this.deck.length < 1) {
            this.setDeck()
        }

        const randomIndex = Math.floor(Math.random() * this.deck.length)
        const randomCard = this.deck[randomIndex]

        this.deck.splice(randomIndex, 1)

        return randomCard
    }

    pickCard(card: number) {
        this.pick = this.getPick(card)

        if (!this.pick) {
            return
        }

        this.sendOpponent('pick_card', { card: this.dealt.indexOf(this.pick) })

        this.dealt.splice(this.dealt.indexOf(this.pick), 1)
    }

    getPick(id: number) {
        return this.dealt.find(card => card.id === id)
    }

    revealCards() {
        if (!this.opponent) {
            return
        }

        this.send('reveal_card', { card: this.opponent.pick })
        this.sendOpponent('reveal_card', { card: this.pick })
    }

    resetTurn() {
        this.pick = null
        this.hasDealt = false
    }

    send(action: string, args = {}) {
        if (!this.user) {
            return
        }

        this.user.send(action, args)
    }

    sendOpponent(action: string, args = {}) {
        if (!this.opponent) {
            return
        }

        this.opponent.send(action, args)
    }

}
