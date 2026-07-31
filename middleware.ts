import { NextRequest, NextResponse } from "next/server"
import { locales, type Locale, isLocale } from "@/lib/locale"
import { detectLocaleFromRequest, getLocaleFromCookies } from "@/lib/locale"

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)"
  ]
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Primero intentamos leer la cookie NEXT_LOCALE ya existente
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value

  if (cookieLocale && isLocale(cookieLocale)) {
    return response
  }

  // Si la cookie no existe, detectar desde Accept-Language
  const acceptLanguage = request.headers.get("accept-language")
  const locale = await detectLocaleFromRequest(acceptLanguage, cookieLocale)

  // Establecer la cookie con el idioma detectado
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 año
    sameSite: "lax",
  })

  return response
}