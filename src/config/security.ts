const isDev = process.env.NODE_ENV !== 'production'

export function helmetConfig() {
  return {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'font-src': ["'self'", 'https:', 'data:'],
        'connect-src': ["'self'", isDev ? 'ws://localhost:*' : null, isDev ? 'http://localhost:*' : null].filter(
          Boolean,
        ),
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        // null disables this directive in dev — Safari upgrades http://localhost to https:// otherwise
        'upgrade-insecure-requests': isDev ? null : [],
      },
    },
    strictTransportSecurity: isDev ? false : { maxAge: 31536000, includeSubDomains: true },
    crossOriginEmbedderPolicy: false,
  }
}
