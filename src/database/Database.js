import Sequelize from 'sequelize'
import Users from './tables/Users'


export default class Database {

    constructor(config) {
        this.sequelize = new Sequelize(config.database, config.user, config.password, {
            host: config.host,
            dialect: 'mysql'
        })

        this.users = Users.init(this.sequelize, Sequelize)

        this.sequelize
            .authenticate()
            .then(() => {
                console.log('Connected to database')
            })
            .catch(error => {
                console.error('Unable to connect to the database: ', error)
            })
    }

}
