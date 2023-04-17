import Ninja from './Ninja'

import { cards } from '@data/data'


export default class SenseiNinja extends Ninja {

    constructor() {
        super()

        this.rules = {
            f: 's',
            w: 'f',
            s: 'w'
        }

        this.moves = {}
    }

    dealCards(opponentCards, canBeatSensei) {
        let currentDealt = []
        let dealNumber = this.dealtSize - this.dealt.length

        for (let i = 0; i < dealNumber; i++) {
            let deal = canBeatSensei ? this.dealRandomCard() : this.dealWinCard(opponentCards[i])

            currentDealt.push(cards[deal])
            this.dealt.push(deal)

            this.addToMoves(opponentCards[i].card_id, deal)
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
        // temp
        if (first.power_id != '0') return false

        if (first.element != second.element) return this.compareElements(first, second)

        return first.value > second.value
    }

    compareElements(first, second) {
        return this.rules[first.element] == second.element
    }

    pickCard(opponentCard) {
        let card = this.removeFromMoves(opponentCard)
        this.pick = cards[card]

        this.opponent.send('pick_card', { card: this.dealt.indexOf(card) })

        this.dealt.splice(this.dealt.indexOf(card), 1)
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
