export async function createSession(
  baseUrl: string, apiToken: string,
  name: string, email: string, phone?: string,
) {
  const body: Record<string, string> = { name, email }
  if (phone) body.phone = phone
  const res = await fetch(`${baseUrl}/widget/${apiToken}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Session error ${res.status}`)
  return res.json()
}

export async function sendMessage(
  baseUrl: string, apiToken: string,
  widgetSessionToken: string, text: string,
) {
  const res = await fetch(`${baseUrl}/widget/${apiToken}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ widgetSessionToken, text }),
  })
  if (!res.ok) throw new Error(`Send error ${res.status}`)
  return res.json()
}

export async function fetchMessages(
  baseUrl: string, apiToken: string,
  widgetSessionToken: string, since?: string,
) {
  const params = new URLSearchParams({ sessionToken: widgetSessionToken })
  if (since) params.set('since', since)
  const res = await fetch(`${baseUrl}/widget/${apiToken}/messages?${params}`)
  if (!res.ok) throw new Error(`Fetch error ${res.status}`)
  return res.json() as Promise<{ messages: any[] }>
}
