import type BaseHandler from '../../../handlers/BaseHandler'
import CardMatchmaker from './CardMatchmaker'
import type Room from '../Room'

type MatchmakerType = keyof typeof MatchmakerFactory.types

export default class MatchmakerFactory {

    static types = {
        card: CardMatchmaker
    }

    static createMatchmaker(matchmaker: any, room: Room, handler: BaseHandler) {
        return new this.types[matchmaker.game as MatchmakerType](matchmaker, room, handler)
    }

}
