const http = require('http')

const PORT = Number(process.env.PORT || 3002)
const TOKEN = process.env.AI_GATEWAY_TOKEN || ''

function send(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      if (!chunks.length) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function extract(text, pattern) {
  const match = String(text || '').match(pattern)
  return match ? (match[1] || match[0]).trim() : ''
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/'
  if (TOKEN) {
    const auth = req.headers.authorization || ''
    if (auth !== `Bearer ${TOKEN}` && url !== '/health') {
      return send(res, 401, { error: 'unauthorized' })
    }
  }

  if (req.method === 'GET' && url === '/health') {
    const configured = Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY)
    return send(res, 200, { status: 'ok', service: 'metaforge-ai-v2', mode: configured ? 'provider' : 'heuristic' })
  }

  if (req.method === 'POST' && url === '/parse-resume') {
    const body = await readBody(req).catch(() => ({}))
    const text = body.resumeText || ''
    return send(res, 200, {
      extractedData: {
        candidateName: extract(text, /name[:\s]+([A-Za-z .]+)/i) || 'Unknown Candidate',
        email: extract(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i),
        contactNumber: extract(text, /(\+?\d[\d\s-]{8,}\d)/),
        primarySkill: extract(text, /skills?[:\s]+([A-Za-z0-9, /+]+)/i) || 'General',
        totalExperienceYears: Number(extract(text, /(\d+(?:\.\d+)?)\s+years/i) || 0),
        summary: String(text).slice(0, 280),
      },
      confidenceScore: text ? 0.82 : 0.4,
    })
  }

  if (req.method === 'POST' && (url === '/match' || url === '/enrich')) {
    const body = await readBody(req).catch(() => ({}))
    return send(res, 200, { ok: true, echo: body, provider: 'metaforge-ai-v2' })
  }

  send(res, 404, { error: 'not_found' })
})

server.listen(PORT, () => {
  console.log(`V2 AI gateway listening on http://localhost:${PORT}`)
})
