function parseText(text: string, contact: any, _deps: Record<string, any> = {}) {
  return text.replace(/\$contact_name/g, contact.name).replace(/\$contact_number/g, contact.number)
}

export { parseText }
