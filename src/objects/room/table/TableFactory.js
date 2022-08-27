import FourTable from './FourTable'


export default class TableFactory {

    static types = {
        'four': FourTable
    }

    static createTable(table, room) {
        return new this.types[table.game](table, room)
    }

}
