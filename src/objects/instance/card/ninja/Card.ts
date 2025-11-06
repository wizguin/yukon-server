import { cards } from '@data'

import pick from '@utils/pick'

export default class Card {

    powerId: number
    element: string
    color: string
    value: number
    originalElement: string

    constructor(public id: number) {
        const card = cards[id]

        this.powerId = card.powerId
        this.element = card.element
        this.color = card.color
        this.value = card.value

        this.originalElement = card.element
    }

    toJSON() {
        return pick(this,
            'id',
            'powerId',
            'element',
            'color',
            'value'
        )
    }

}
