const express = require('express');
const route = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

route.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error);
    }
});

route.get('/tasks', auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if (req.query.completed)
            match.completed = req.query.completed === 'true';

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task)
            return res.status(400).send('User not found');

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValid = updates.every(item => allowedUpdates.includes(item));
    if (!isValid)
        return res.status(400).send({
            error: "Invalid attemmpt !"
        });


    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // });
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task)
            return res.status(404).send({
                error: 'Not Found'
            });

        updates.forEach(item => task[item] = req.body[item]);
        await task.save();

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task)
            return res.status(404).send({
                error: 'Not Found'
            });

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = route;