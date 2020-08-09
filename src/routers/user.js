const express = require('express');
const route = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

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

route.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(item => item.token !== req.token);
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(e);
    }
});

route.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(e);
    }
});

route.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

route.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdate = ['name', 'age', 'email', 'password'];
    const isValidRequest = updates.every(update => allowedUpdate.includes(update));
    if (!isValidRequest)
        return res.status(400).send({
            error: "Invalid attempt !"
        });

    try {
        
        updates.forEach(item => req.user[item] = req.body[item]);
        await req.user.save();

        res.send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }

});

module.exports = route;