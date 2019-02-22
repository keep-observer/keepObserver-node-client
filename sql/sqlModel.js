const MongoDbServer = require('./mongodb.js')


module.exports = {
    findAll(config) {
        return MongoDbServer.use([{
            method: 'collection',
            params: [config.tableName]
        }, {
            method: 'find',
            params: [config.filter]
        }, {
            method: 'toArray'
        }])
    },
    findOne(config) {
        return MongoDbServer.use([{
            method: 'collection',
            params: [config.tableName]
        }, {
            method: 'findOne',
            params: [config.filter]
        }])
    },
    updateOne(config) {
        return MongoDbServer.use([{
            method: 'collection',
            params: [config.tableName]
        }, {
            method: 'updateOne',
            params: [config.filter, config.data]
        }])
    },
    insertOne(config) {
        return MongoDbServer.use([{
            method: 'collection',
            params: [config.tableName]
        }, {
            method: 'insertOne',
            params: [config.data]
        }])
    },
    insertMany(config) {
        return MongoDbServer.use([{
            method: 'collection',
            params: [config.tableName]
        }, {
            method: 'insertMany',
            params: [config.data]
        }])
    },
    //查询出来的表的长度
    countDocuments(config) {
        return MongoDbServer.use([{
            method: 'collection',
            params: [config.tableName]
        }, {
            method: 'countDocuments',
            params: [config.filter]
        }])
    },
}