import dotenv from 'dotenv'
import express from 'express'
import { monitorLogs } from './monitor'

dotenv.config({ path: '../.env' })

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get('/', (_, res) => {
  res.send('API está rodando! 🚀')
})

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`)
})

monitorLogs()
