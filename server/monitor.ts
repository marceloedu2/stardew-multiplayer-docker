import axios from 'axios'
import { spawn } from 'child_process'

const EVENT_PATTERNS = {
  player_join: /Received connection for vanilla player (\d+)/,
  player_leave: /Player quit: (\d+)/,
  today_day: /Context: after save, starting spring (\d+) Y(\d+)\./,
}

const playerList: Record<string, string> = {
  '6743723059641626793': 'João',
}

async function sendEvent(eventType: string, data: Record<string, any>) {
  const payload = { event: eventType, timestamp: Date.now(), ...data }
  try {
    await axios.post(
      `${process.env.DISCORD_BOT_API}/stardew-valley/message`,
      payload,
    )
    console.log(`🔹 Evento ${eventType} enviado:`, payload)
  } catch (error) {
    console.error('❌ Erro ao enviar evento:', error)
  }
}

function handleLogLine(line: string) {
  const lastLine = line.trim().split('\n').pop()
  if (!lastLine) return

  for (const [event, regex] of Object.entries(EVENT_PATTERNS)) {
    const match = lastLine.match(regex)

    if (match) {
      switch (event) {
        case 'player_join':
          sendEvent(event, {
            id: match[1],
            player: playerList[match[1]] || match[1],
          })
          break
        case 'player_leave':
          sendEvent(event, {
            id: match[1],
            player: playerList[match[1]] || match[1],
          })
          break
        case 'today_day':
          sendEvent(event, { day: match[1], year: match[2] })
          break
        case 'special_event':
          break
        case 'festival_day':
          sendEvent(event, { message: 'Festival acontecendo hoje' })
          break
        default:
          console.log(`🔹 Evento ${event} encontrado`)
      }
    }
  }
}

export function monitorLogs() {
  const process = spawn('tail', ['-f', './valley_logs/SMAPI-latest.txt'])

  process.stdout.on('data', data => {
    handleLogLine(data.toString())
  })

  process.stderr.on('data', data => {
    console.error('Erro nos logs:', data.toString())
  })

  process.on('close', code => {
    console.log(`🛑 Monitor de logs encerrado com código ${code}`)
  })
}
