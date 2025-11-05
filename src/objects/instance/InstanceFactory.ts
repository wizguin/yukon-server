import CardInstance from './card/CardInstance'
import SledInstance from './sled/SledInstance'

type InstanceType = keyof typeof InstanceFactory.types

export default class InstanceFactory {

    static types = {
        card: CardInstance,
        sled: SledInstance
    }

    static createInstance(waddle: any) {
        return new this.types[waddle.game as InstanceType](waddle)
    }

}
