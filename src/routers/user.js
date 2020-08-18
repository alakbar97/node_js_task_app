const express = require('express');
const route = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('file must be image'));

        cb(undefined, true);
    }
});

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

route.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const bufferImage = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer();
    req.user.avatar = bufferImage;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({
        error: err.message
    });
});

route.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

route.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar)
            throw new Error();

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = route;