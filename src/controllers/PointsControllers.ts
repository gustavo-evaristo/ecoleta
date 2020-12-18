import { Request, Response } from 'express'

import Knex from '../database/connection'

class PointsControllers {
  async index (req: Request, res: Response){
    const { city, uf, items } = req.query

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()))

    const points = await Knex('points')
      .join('points_items', 'point_id', '=', 'points_items.point_id')
      .whereIn('points_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')

    return res.json(points)
  }

  async show (req:Request, res:Response){

    const { id } = req.params

    const point = await Knex('points').where('id', id).first()

    if(!point){
      return res.sendStatus(400)
    }

    const items = await Knex('items').join('points_items', 'items.id', '=', 'points_items.item_id')
    .where('points_items.point_id', id)
    .select('items.title')

    return res.json({ point, items })
  }

  async create (req:Request, res:Response){ 

    const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body

    const trx = await Knex.transaction()

    const point = {
      image: 'https://images.unsplash.com/photo-1552353289-97f99c442b3e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
  }

    const insertedItems = await trx('points').insert(point)
  
    const point_id = insertedItems[0]

    const pointItems = items.map((item_id: number) => {
        return {
            item_id,
            point_id
        }
    }) 

    await trx('points_items').insert(pointItems)

    await trx.commit()

    return res.json({
      id: point_id, 
      ...point
    })
  }
}

export default new PointsControllers