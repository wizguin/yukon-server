import Ninja from './Ninja'

import Card from './Card'
import Rules from '../Rules'

import { cards } from '@data'

type CardData = (typeof cards)[number]

export default class SenseiNinja extends Ninja {

    moves: Record<number, number[]>

    constructor() {
        super()

        this.moves = {}
    }

    dealSenseiCards(opponentCards: Card[], canBeatSensei: boolean) {
        const currentDealt = []
        const dealNumber = this.dealtSize - this.dealt.length

        for (let i = 0; i < dealNumber; i++) {
            const deal = canBeatSensei ? this.dealRandomCard() : this.dealWinCard(opponentCards[i])

            const card = new Card(deal)

            currentDealt.push(card)
            this.dealt.push(card)

            this.addToMoves(opponentCards[i].id, deal)
        }

        return currentDealt
    }

    dealRandomCard() {
        const ids = Object.keys(cards).map(Number)

        return this.getRandomElement(ids)
    }

    dealWinCard(card: Card) {
        const winCards = Object.keys(cards).map(Number).filter(c => this.beatsCard(cards[c], card))

        if (!winCards.length) {
            return this.dealRandomCard()
        }

        return this.getRandomElement(winCards)
    }

    beatsCard(first: CardData, second: Card) {
        if (first.element !== second.element) {
            return this.compareElements(first, second)
        }

        return first.value > second.value
    }

    compareElements(first: CardData, second: Card) {
        return Rules.elements[first.element] === second.element
    }

    pickCard(opponentCard: number) {
        const card = this.removeFromMoves(opponentCard)

        if (card === undefined) {
            return
        }

        this.pick = this.getPick(card)

        if (!this.pick) {
            return
        }

        this.sendOpponent('pick_card', { card: this.dealt.indexOf(this.pick) })

        this.dealt.splice(this.dealt.indexOf(this.pick), 1)
    }

    addToMoves(opponentCard: number, deal: number) {
        if (!this.moves[opponentCard]) {
            this.moves[opponentCard] = []
        }

        this.moves[opponentCard].push(deal)
    }

    removeFromMoves(opponentCard: number) {
        const moves = this.moves[opponentCard]

        if (!moves) {
            return
        }

        const card = moves.pop()

        if (!moves.length) {
            delete this.moves[opponentCard]
        }

        return card
    }

    getRandomElement(array: number[]) {
        if (!array.length) {
            throw new Error('No cards available for Sensei')
        }

        return array[Math.floor(Math.random() * array.length)]
    }

}
