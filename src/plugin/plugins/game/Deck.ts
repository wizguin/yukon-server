import GamePlugin from '@plugin/GamePlugin'

import type GameUser from '@objects/user/GameUser'

import { cards, decks, items } from '@data'

const starterDeckId = 821
const starterDeck = items[starterDeckId]

export default class Sensei extends GamePlugin {

    events = {
        add_starter_deck: this.addStarterDeck
    }

    addStarterDeck(args: unknown, user: GameUser) {
        if (user.inventory.includes(starterDeckId)) {
            return
        }

        const deck = decks[starterDeckId]

        for (const card of deck) {
            if (cards[card].powerId === 0) {
                user.cards.add(card)
            }
        }

        const powerCards = deck.filter(card => cards[card].powerId > 0)

        const randomPowerCard = powerCards[Math.floor(Math.random() * powerCards.length)]

        user.cards.add(randomPowerCard)
        user.inventory.add(starterDeckId)

        user.send('add_item', { item: starterDeckId, name: starterDeck.name, slot: 'award', coins: user.coins })
    }

}
