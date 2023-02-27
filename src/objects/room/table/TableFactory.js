import FourTable from './FourTable'
import MancalaTable from './MancalaTable'


export default class TableFactory {

    static types = {
        'four': FourTable,
        'mancala': MancalaTable
    }

    static createTable(table, room) {
        return new this.types[table.game](table, room)
    }

}
