import CardInstance from './card/CardInstance'
import SledInstance from './sled/SledInstance'


export default class InstanceFactory {

    static types = {
        'card': CardInstance,
        'sled': SledInstance
    }

    static createInstance(waddle) {
        return new this.types[waddle.game](waddle)
    }

}
