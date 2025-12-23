const [processType, quantityStr] = process.argv.slice(2)

if (!processType || quantityStr == null) {
  console.error('Usage: node scripts/set-formation.mjs <processType> <quantity>')
  process.exit(1)
}

const quantity = Number(quantityStr)
if (!Number.isInteger(quantity) || quantity < 0) {
  console.error('quantity must be an integer >= 0')
  process.exit(1)
}

const appName = process.env.HEROKU_APP_NAME
const token = process.env.HEROKU_TOKEN

if (!appName || !token) {
  console.error('Missing HEROKU_APP_NAME or HEROKU_TOKEN config vars')
  process.exit(1)
}

const url = `https://api.heroku.com/apps/${encodeURIComponent(appName)}/formation/${encodeURIComponent(processType)}`

const res = await fetch(url, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.heroku+json; version=3',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ quantity }),
})

const text = await res.text()
if (!res.ok) {
  console.error(`Heroku API error ${res.status}: ${text}`)
  process.exit(1)
}

console.log(`OK: set ${processType} quantity=${quantity}`)
