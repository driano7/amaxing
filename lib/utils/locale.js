export function getLocaleFromRequest(req, query) {
  if (query && (query.lang === 'es' || query.lang === 'en')) return query.lang
  return req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
}
