import CardMatchmaker from './CardMatchmaker'


export default class MatchmakerFactory {

    static types = {
        'card': CardMatchmaker
    }

    static createMatchmaker(matchmaker, room) {
        return new this.types[matchmaker.game](matchmaker, room)
    }

}
