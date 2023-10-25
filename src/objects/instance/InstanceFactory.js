import CardInstance from './card/CardInstance'


export default class InstanceFactory {

    static types = {
        'card': CardInstance
    }

    static createInstance(waddle) {
        return new this.types[waddle.game](waddle)
    }

}
