const express = require('express');
require('./db/mongoose');
const userRoute = require('./routers/user');
const taskRoute = require('./routers/task');

const app = express();

const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Welcome to Task APP written in Node.js');
});

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, () => {
    console.log(`Server is up on ${port}`);
});