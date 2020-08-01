const express = require('express');
const route = new express.Router();
const User = require('../models/user');

route.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateToken();
        res.status(201).send({
            user,
            token
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

route.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({
            user,
            token
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

route.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user)
            return res.status(404).send({
                error: 'Not Found !'
            });

        res.send(user);
    } catch (error) {
        res.send(500).send(error);
    }
});

route.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).send('User Not Found');

        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdate = ['name', 'age', 'email', 'password'];
    const isValidRequest = updates.every(update => allowedUpdate.includes(update));
    if (!isValidRequest)
        return res.status(400).send({
            error: "Invalid attempt !"
        });

    try {

        const user = await User.findById(req.params.id);

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // });

        if (!user)
            return res.send(404).send();

        updates.forEach(item => user[item] = req.body[item]);
        await user.save();

        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }

});

module.exports = route;