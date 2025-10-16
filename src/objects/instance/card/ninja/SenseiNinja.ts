import Ninja from './Ninja'

import Card from './Card'
import Rules from '../Rules'

import { cards } from '@data/data'


export default class SenseiNinja extends Ninja {

    constructor() {
        super()

        this.moves = {}
    }

    dealCards(opponentCards, canBeatSensei) {
        let currentDealt = []
        let dealNumber = this.dealtSize - this.dealt.length

        for (let i = 0; i < dealNumber; i++) {
            let deal = canBeatSensei ? this.dealRandomCard() : this.dealWinCard(opponentCards[i])

            let card = new Card(deal)

            currentDealt.push(card)
            this.dealt.push(card)

            this.addToMoves(opponentCards[i].id, deal)
        }

        return currentDealt
    }

    dealRandomCard() {
        let ids = Object.keys(cards)

        return this.getRandomElement(ids)
    }

    dealWinCard(card) {
        let winCards = Object.keys(cards).filter(c => this.beatsCard(cards[c], card))

        if (!winCards.length) {
            return this.dealRandomCard()
        }

        return this.getRandomElement(winCards)
    }

    beatsCard(first, second) {
        if (first.element != second.element) return this.compareElements(first, second)

        return first.value > second.value
    }

    compareElements(first, second) {
        return Rules.elements[first.element] == second.element
    }

    pickCard(opponentCard) {
        let card = this.removeFromMoves(opponentCard)
        this.pick = this.getPick(card)

        this.opponent.send('pick_card', { card: this.dealt.indexOf(this.pick) })

        this.dealt.splice(this.dealt.indexOf(this.pick), 1)
    }

    addToMoves(opponentCard, deal) {
        if (!this.moves[opponentCard]) {
            this.moves[opponentCard] = []
        }

        this.moves[opponentCard].push(deal)
    }

    removeFromMoves(opponentCard) {
        let card = this.moves[opponentCard].pop()

        if (!this.moves[opponentCard].length) {
            delete this.moves[opponentCard]
        }

        return card
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)]
    }

    send() {

    }

}
