import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import storeRoutes from './routes/store.routes.js'
import ratingRoutes from './routes/rating.routes.js'
import ownerRoutes from './routes/owner.routes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (_, res) => res.send('Roxiler Ratings API running'))

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/owner', ownerRoutes)

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API on http://localhost:${port}`))
