const {
    MongoClient,
    ObjectID
} = require('mongodb');

const connectionString = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';


MongoClient.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (error, client) => {
    if (error)
        return console.log('Unable to connect Database');

    const db = client.db(databaseName);

    db.collection('tasks').insertMany([{
        description: 'Garbage',
        completed: false
    }, {
        description: 'Coding',
        completed: true
    }, {
        description: 'Living',
        completed: false
    }], (error, result) => {
        if (error)
            return console.log('Failed to insert');

        console.log(result.ops);
    });
})