/**
 * Builds the authenticateLicensee middleware.
 *
 * Extracted into its own module so it can be imported and unit-tested without
 * pulling in the full router chain (which transitively requires Redis / queue).
 *
 * Resolution order for req.inbox:
 *   1. ?inbox=<inboxToken> — explicit inbox param
 *   2. ?department=<departmentToken> — resolved from department.inbox when linked
 *   3. Fallback — first active inbox by kind when neither param is present
 */
export function buildAuthenticateLicensee({ licenseeRepository, departmentRepository, inboxRepository }: any) {
  return async function authenticateLicensee(req: any, res: any, next: any) {
    if (!req.query.token) {
      return res.status(401).json({ message: 'Token não informado ou inválido.' })
    }

    const licensee = await licenseeRepository.findFirst({ apiToken: req.query.token })
    if (!licensee) {
      return res.status(401).json({ message: 'Token não informado ou inválido.' })
    }

    req.licensee = licensee

    if (req.query.department) {
      const department = await departmentRepository.findFirst({
        departmentToken: req.query.department,
        licensee: licensee._id,
      })
      if (!department || !department.active) {
        return res.status(401).json({ message: 'Token de departamento inválido ou inativo.' })
      }
      req.department = department

      // Resolve inbox from department when one is linked
      if (req.department.inbox) {
        req.inbox = await inboxRepository.findFirst({ _id: req.department.inbox })
      }
    }

    if (req.query.inbox) {
      const inbox = await inboxRepository.findFirst({
        inboxToken: req.query.inbox,
        licensee: licensee._id,
        active: true,
      })
      if (!inbox) return res.sendStatus(401)
      req.inbox = inbox
    }

    // Fallback: resolve first active inbox by kind when neither ?department nor ?inbox provided
    if (!req.inbox && !req.department) {
      const kind = req.path.includes('/messenger/') ? 'messenger' : 'chat'
      const firstInbox = await inboxRepository.findFirst({ licensee: licensee._id, kind, active: true })
      if (firstInbox) req.inbox = firstInbox
    }

    return next()
  }
}
