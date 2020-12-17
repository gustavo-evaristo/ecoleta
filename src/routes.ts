import express from 'express'

import Knex from './database/connection'

const routes = express.Router()

routes.get('/items', async (req, res) => {
    const items = await Knex('items').select('*')

    const serializedItems = items.map(item => {
        return {
            id: item.id,
            title: item.title,
            image_url: `http://localhost:3333/uploads/${item.image}`
        }
    })

    return res.json(serializedItems)
})

routes.post('/points', async (req, res) => {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body

    try {
        const insertedItems = await Knex('points').insert({
            image: 'image-fake',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        })
    
        const point_id = insertedItems[0]

        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        }) 

        await Knex('points_items').insert(pointItems)
    
        return res.sendStatus(200)
    } catch (err) {
        return console.error(err)
    }
})

export default routes