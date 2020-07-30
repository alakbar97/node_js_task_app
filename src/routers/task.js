const express = require('express');
const route = new express.Router();
const Task = require('../models/task');

route.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    try {
        await task.save();
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error);
    }
});

route.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task)
            return res.status(400).send('User not found');

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

route.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValid = updates.every(item => allowedUpdates.includes(item));
    if (!isValid)
        return res.status(400).send({
            error: "Invalid attemmpt !"
        });


    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
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

route.delete('/tasks/:id', async (req, res) => {
    try {
        const task = Task.findByIdAndDelete(req.params.id);
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