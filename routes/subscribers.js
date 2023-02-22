const express = require('express')
const router = express.Router()
const Subscriber = require('../models/subscriber')

module.exports = router

//getting all
router.get('/', async (req, res) =>{
    try{
        const subscribers = await Subscriber.find()
        res.json(subscribers)
    } catch{
        res.status(500).json({message: err.message})
    }


})

//getting one
router.get('/:id', (req, res) =>{
    res.send(req.params.id)

})


//creating one
router.post('/', async (req, res) =>{
    const subscriber = new Subscriber({
        name: req.body.name,
        subscribeToChannel: req.body.subscribeToChannel,
        subscribeData: reg.body.subscribeData
    })
    try{
        const newSubscriber = await subscriber.save()
        res.status(201).json(newSubscriber)

    }catch (err){
        res.status(400).json({message: err.message})

    }

})

//updating one
router.patch('/:id', (req, res) =>{

})

//deleting one
router.delete('/:id', (req, res) =>{

})
