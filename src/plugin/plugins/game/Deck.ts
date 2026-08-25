import GamePlugin from '@plugin/GamePlugin'

import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { cards, decks, items } from '@data'

export default class Sensei extends GamePlugin {

    starterDeckId = 821
    starterDeck: any

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            add_starter_deck: this.addStarterDeck
        }

        this.starterDeck = items[this.starterDeckId]
    }

    addStarterDeck(args: unknown, user: GameUser) {
        if (user.inventory.includes(this.starterDeckId)) {
            return
        }

        const deck = decks[this.starterDeckId]

        for (const card of deck) {
            if (cards[card].powerId === 0) {
                user.cards.add(card)
            }
        }

        // @ts-expect-error temp
        const powerCards = deck.filter((card: string) => cards[card].powerId > 0)

        const randomPowerCard = powerCards[Math.floor(Math.random() * powerCards.length)]

        user.cards.add(randomPowerCard)

        user.inventory.add(this.starterDeckId)
        user.send('add_item', { item: this.starterDeckId, name: this.starterDeck.name, slot: 'award', coins: user.coins })
    }

}
