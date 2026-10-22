'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useState } from 'react'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { JAMAICA_TALLER } from '@/data/journeys/jamaica'
import { Reveal } from './Reveal'

const TALAVERA = '#0E8C7A'
const TERRACOTA = '#C1440E'

/**
 * Cierre participativo del Journey de Jamaica.
 *
 * TRES REGLAS, Y SON EL CODIGO
 *   1. Es opcional. Se puede llegar al final, leer y no tocar nada.
 *   2. No se guarda nada. La reflexion vive en el estado del componente y
 *      desaparece al recargar. No se envia a ningun servidor, no se registra
 *      en analiticas y no se asocia a ninguna cuenta.
 *   3. No prescribe flores ni significados. El sistema no sugiere una
 *      especie para una emocion: eso lo decide la conversacion con el
 *      florista y lo que haya disponible ese dia.
 *
 * El taller es una PROPUESTA. El bloque lo dice de forma explicita y no
 * ofrece ninguna forma de reservarlo.
 */
export function JamaicaBouquet() {
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
  const L = (es: string, en: string) => (isEs ? es : en)

  const [paso, setPaso] = useState(0)
  // Intencion inicial: "Recordar" y, dentro de ella, "Una persona
  // importante". Son el punto de partida sugerido, no una eleccion fija:
  // se puede cambiar o dejar sin elegir.
  const [intencion, setIntencion] = useState<string>('recordar')
  const [persona, setPersona] = useState<string>('persona')
  const [destino, setDestino] = useState<string>('')
  const [reflexion, setReflexion] = useState('')

  const intenciones = [
    { id: 'recordar', es: 'Recordar', en: 'Remember' },
    { id: 'agradecer', es: 'Agradecer', en: 'Thank' },
    { id: 'celebrar', es: 'Celebrar', en: 'Celebrate' },
    { id: 'acompanar', es: 'Acompanar', en: 'Accompany' },
    { id: 'otro', es: 'Algo distinto', en: 'Something else' },
  ]

  const personas = [
    { id: 'persona', es: 'Una persona importante', en: 'An important person' },
    { id: 'ausente', es: 'Alguien a quien extrañas', en: 'Someone you miss' },
    { id: 'momento', es: 'Un momento que compartiste', en: 'A moment you shared' },
  ]

  const pasos = [
    { es: 'Escuchar', en: 'Listen' },
    { es: 'Elegir y aprender', en: 'Choose and learn' },
    { es: 'Crear', en: 'Make' },
  ]

  const preguntasFlorista = [
    {
      es: '¿Qué te gustaría conservar de esa persona o de lo que vivieron juntos?',
      en: 'What would you like to keep of that person, or of what you shared?',
    },
    {
      es: '¿Hay algún recuerdo, lugar, color o detalle que te conecte con ella?',
      en: 'Is there a memory, place, color or detail that connects you to them?',
    },
    {
      es: '¿Te gustaría expresar cariño, gratitud, nostalgia, celebración o algo distinto?',
      en: 'Would you like to express affection, gratitude, nostalgia, celebration or something else?',
    },
    {
      es: '¿El ramo es para ti, para regalar o para llevarlo a algún lugar especial?',
      en: 'Is the bouquet for you, to give away, or to take to a special place?',
    },
    {
      es: '¿Prefieres una composición discreta y sencilla o una con más presencia?',
      en: 'Do you prefer a discreet, simple composition or one with more presence?',
    },
    {
      es: '¿Qué presupuesto tienes y qué flores están disponibles hoy?',
      en: 'What is your budget, and which flowers are available today?',
    },
  ]

  return (
    <div>
      {/* ---------------------------------------------------------------
          PRESENTACION DEL TALLER: propuesta, no servicio
      ---------------------------------------------------------------- */}
      <Reveal>
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {L(JAMAICA_TALLER.intro_es, JAMAICA_TALLER.intro_en)}
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <p
          className="mx-auto mt-6 max-w-2xl rounded-xl border-l-2 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300"
          style={{ borderColor: TERRACOTA }}
        >
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">
            {L('Pendiente de coordinación. ', 'Pending coordination. ')}
          </span>
          {L(JAMAICA_TALLER.pending_es, JAMAICA_TALLER.pending_en)}
        </p>
      </Reveal>

      {/* ---------------------------------------------------------------
          EL BLOQUE INTERACTIVO
      ---------------------------------------------------------------- */}
      <div className="mx-auto mt-12 max-w-3xl">
        {/* Paso a paso */}
        <ol className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-3">
          {pasos.map((p, index) => {
            const activo = index === paso
            const hecho = index < paso
            return (
              <li key={index} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaso(index)}
                  aria-current={activo ? 'step' : undefined}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: activo ? TALAVERA : 'transparent',
                    color: activo ? '#ffffff' : undefined,
                    ['--tw-ring-color' as string]: TALAVERA,
                  }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
                    style={{
                      backgroundColor: activo
                        ? 'rgba(255,255,255,0.22)'
                        : hecho
                        ? 'rgba(14,140,122,0.16)'
                        : 'rgba(0,0,0,0.06)',
                      color: activo ? '#ffffff' : TALAVERA,
                    }}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  {L(p.es, p.en)}
                </button>
                {index < pasos.length - 1 && (
                  <span className="h-px w-4 bg-zinc-300 dark:bg-zinc-700" aria-hidden />
                )}
              </li>
            )
          })}
        </ol>

        {/* ---------------------------------------------------------
            PASO 1: ESCUCHAR
        ------------------------------------------------------- */}
        {paso === 0 && (
          <div>
            <h3 className="font-serif text-2xl leading-snug text-zinc-900 dark:text-zinc-50">
              {L(
                '¿Hay alguien importante para ti a quien te gustaría recordar con este ramo?',
                'Is there someone important to you whom you would like to remember with this bouquet?'
              )}
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {L(
                'Piensa en alguien que forma parte de tu historia. Puede ser una persona que sigue contigo, alguien a quien extrañas o alguien con quien compartiste un momento importante. No hace falta contar toda una historia para crear algo que tenga sentido.',
                'Think of someone who is part of your story. It can be a person who is still with you, someone you miss, or someone you shared an important moment with. You do not have to tell the whole story to create something that means something.'
              )}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {L(
                'Puedes hacer esta reflexión sin contarla. No hace falta que nos cuentes nada, ni ahora ni después: no se guarda lo que escribas y no se envía a ningún lado.',
                'You can do this reflection without telling anyone. You do not have to share anything, now or later: nothing you write is stored and nothing is sent anywhere.'
              )}
            </p>

            {/* Intención */}
            <fieldset className="mt-8">
              <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                {L('Por dónde empiezas', 'Where you start')}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {intenciones.map((item) => {
                  const id = `intencion-${item.id}`
                  const checked = intencion === item.id
                  return (
                    <span key={item.id}>
                      <input
                        type="radio"
                        id={id}
                        name="jamaica-intencion"
                        className="peer sr-only"
                        checked={checked}
                        onChange={() => setIntencion(item.id)}
                      />
                      <label
                        htmlFor={id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-[#0E8C7A] peer-checked:border-[#0E8C7A] peer-checked:bg-[#0E8C7A]/10 peer-checked:text-[#0A6E60] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0E8C7A] peer-focus-visible:ring-offset-2 dark:border-white/15 dark:text-zinc-300 dark:peer-checked:text-[#7FD4C6]"
                      >
                        {L(item.es, item.en)}
                      </label>
                    </span>
                  )
                })}
              </div>
            </fieldset>

            {/* Sub-opción, solo cuando la intención es recordar */}
            {intencion === 'recordar' && (
              <fieldset className="mt-6">
                <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  {L('Recordar a quién', 'Whom you remember')}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {personas.map((item) => {
                    const id = `persona-${item.id}`
                    const checked = persona === item.id
                    return (
                      <span key={item.id}>
                        <input
                          type="radio"
                          id={id}
                          name="jamaica-persona"
                          className="peer sr-only"
                          checked={checked}
                          onChange={() => setPersona(item.id)}
                        />
                        <label
                          htmlFor={id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-[#C1440E] peer-checked:border-[#C1440E] peer-checked:bg-[#C1440E]/10 peer-checked:text-[#C1440E] peer-focus-visible:ring-2 peer-focus-visible:ring-[#C1440E] peer-focus-visible:ring-offset-2 dark:border-white/15 dark:text-zinc-300"
                        >
                          {L(item.es, item.en)}
                        </label>
                      </span>
                    )
                  })}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {L(
                    'Es un punto de partida, no una definición. Puedes dejarlo como está o cambiarlo; nada de esto se guarda.',
                    'It is a starting point, not a definition. You can leave it as it is or change it; none of this is stored.'
                  )}
                </p>
              </fieldset>
            )}

            {/* Preguntas del florista */}
            <details className="mt-8 rounded-xl border border-zinc-200/70 bg-zinc-50/60 px-5 py-4 dark:border-white/10 dark:bg-zinc-900/30">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7A] focus-visible:ring-offset-2 dark:text-zinc-100">
                {L(
                  'Las preguntas que el florista puede hacerte (opcionales)',
                  'The questions the florist might ask you (optional)'
                )}
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {L(
                  'Son sugerencias para adaptar la conversación, no un cuestionario. No hace falta responderlas todas: el florista escucha y cada persona decide cuánto comparte.',
                  'They are prompts for shaping the conversation, not a questionnaire. You do not have to answer all of them: the florist listens and each person decides how much to share.'
                )}
              </p>
              <ul className="mt-4 space-y-2">
                {preguntasFlorista.map((pregunta, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
                  >
                    <span
                      className="mt-2 h-1 w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: TERRACOTA }}
                      aria-hidden
                    />
                    {L(pregunta.es, pregunta.en)}
                  </li>
                ))}
              </ul>
            </details>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: TALAVERA, ['--tw-ring-color' as string]: TALAVERA }}
              >
                {L('Siguiente: elegir y aprender', 'Next: choose and learn')}
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIntencion('')
                  setPersona('')
                  setReflexion('')
                }}
                className="text-sm text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7A] dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {L('Prefiero no compartir nada', 'I would rather share nothing')}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            PASO 2: ELEGIR Y APRENDER
        ------------------------------------------------------- */}
        {paso === 1 && (
          <div>
            <h3 className="font-serif text-2xl leading-snug text-zinc-900 dark:text-zinc-50">
              {L('Elegir y aprender', 'Choose and learn')}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {L(
                'En el puesto, el florista presenta opciones reales: qué hay disponible ese día, cómo se combinan las formas, qué se conserva mejor y cuánto cuesta cada cosa. Esta página no te va a recomendar una flor para una emoción, porque esa correspondencia no existe de manera fiable: un girasol no significa alegría para todas las personas, y el mismo ramo puede querer decir dos cosas distintas.',
                'At the stall, the florist presents real options: what is available that day, how the shapes combine, what keeps better and what each thing costs. This page will not recommend a flower for an emotion, because that correspondence does not reliably exist: a sunflower does not mean joy for everyone, and the same bouquet can be meant to say two different things.'
              )}
            </p>

            <ul className="mt-8 space-y-3">
              {[
                {
                  t: 'Disponibilidad',
                  tt: 'Availability',
                  te: 'Qué llega esa madrugada y qué se agotó. Es la primera pregunta, y la que más cambia.',
                  tee: 'What arrived that dawn and what sold out. It is the first question, and the one that changes most.',
                },
                {
                  t: 'Forma y color',
                  tt: 'Shape and color',
                  te: 'Alturas, volumen y qué se ven juntos. El mismo material en otra proporción dice otra cosa.',
                  tee: 'Heights, volume and what reads well together. The same material in another proportion says something else.',
                },
                {
                  t: 'Conservación',
                  tt: 'Conservation',
                  te: 'Cuánto aguanta un ramo, con qué agua y en qué lugar de la casa. Un ramo que dura tres días y uno que dura una semana no son el mismo regalo.',
                  tee: 'How long a bunch lasts, with what water and in which spot in the house. A bunch that lasts three days and one that lasts a week are not the same gift.',
                },
                {
                  t: 'Presupuesto',
                  tt: 'Budget',
                  te: 'Es una decisión más, y no tiene que ver con cuánto valen las flores: tiene que ver con lo que te hace sentido.',
                  tee: 'It is one more decision, and it is not about what the flowers are worth: it is about what makes sense to you.',
                },
              ].map((item, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-zinc-200/70 bg-white/60 px-5 py-4 dark:border-white/10 dark:bg-zinc-900/20"
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: TERRACOTA }}
                  >
                    {L(item.t, item.tt)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {L(item.te, item.tee)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPaso(2)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: TALAVERA, ['--tw-ring-color' as string]: TALAVERA }}
              >
                {L('Siguiente: crear', 'Next: make')}
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setPaso(0)}
                className="text-sm text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7A] dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {L('Volver a escuchar', 'Back to listening')}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            PASO 3: CREAR
        ------------------------------------------------------- */}
        {paso === 2 && (
          <div>
            <h3 className="font-serif text-2xl leading-snug text-zinc-900 dark:text-zinc-50">
              {L('Crear', 'Make')}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {L(
                'El participante compone y amarra el ramo con el florista: el tallo se corta en diagonal, se acomodan las flores y se decide el papel. Es la parte del oficio que solo se aprende con las manos y con la indicación de quien lo sabe.',
                'The participant composes and ties the bouquet with the florist: the stem is cut on the diagonal, the flowers are arranged and the paper is decided. It is the part of the craft that is only learned with your hands and with the guidance of someone who knows.'
              )}
            </p>

            {/* Pregunta de cierre, opcional */}
            <div className="mt-8">
              <label
                htmlFor="jamaica-reflexion"
                className="block font-serif text-lg leading-snug text-zinc-900 dark:text-zinc-50"
              >
                {L(
                  'Ahora que terminaste tu ramo, ¿hay algo de tu intención inicial que sientas que lograste expresar?',
                  'Now that you have finished your bouquet, is there anything from your initial intention that you feel you managed to express?'
                )}
              </label>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {L(
                  'Es opcional. Lo que escribas se queda en esta página y no se envía a ningún lado: no se guarda, no se registra y no lo ve nadie más que tú.',
                  'It is optional. What you write stays on this page and is not sent anywhere: it is not stored, not logged, and nobody else sees it but you.'
                )}
              </p>
              <textarea
                id="jamaica-reflexion"
                rows={4}
                value={reflexion}
                onChange={(event) => setReflexion(event.target.value)}
                className="mt-3 w-full rounded-xl border border-zinc-300 bg-white/70 px-4 py-3 text-sm leading-relaxed text-zinc-800 focus:border-[#0E8C7A] focus:outline-none focus:ring-2 focus:ring-[#0E8C7A]/40 dark:border-white/15 dark:bg-zinc-900/40 dark:text-zinc-100"
              />
            </div>

            {/* Qué hacer con el ramo */}
            <fieldset className="mt-8">
              <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                {L('Y después del ramo', 'And after the bouquet')}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { id: 'conservar', es: 'Conservarlo', en: 'Keep it' },
                  { id: 'regalar', es: 'Regalarlo', en: 'Give it away' },
                  {
                    id: 'llevar',
                    es: 'Llevarlo a un lugar especial',
                    en: 'Take it to a special place',
                  },
                ].map((item) => {
                  const id = `destino-${item.id}`
                  const checked = destino === item.id
                  return (
                    <span key={item.id}>
                      <input
                        type="radio"
                        id={id}
                        name="jamaica-destino"
                        className="peer sr-only"
                        checked={checked}
                        onChange={() => setDestino(item.id)}
                      />
                      <label
                        htmlFor={id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-[#C1440E] peer-checked:border-[#C1440E] peer-checked:bg-[#C1440E]/10 peer-checked:text-[#C1440E] peer-focus-visible:ring-2 peer-focus-visible:ring-[#C1440E] peer-focus-visible:ring-offset-2 dark:border-white/15 dark:text-zinc-300"
                      >
                        {L(item.es, item.en)}
                      </label>
                    </span>
                  )
                })}
              </div>
            </fieldset>

            {/* Cierre */}
            <blockquote
              className="mt-10 border-l-2 pl-5 font-serif text-lg leading-relaxed text-zinc-800 dark:text-zinc-100"
              style={{ borderColor: TALAVERA }}
            >
              {L(
                'No hay una combinación correcta para recordar. El valor de este ramo no depende de que una flor tenga un significado establecido, sino de la intención que tú le das y de lo que aprendiste al crearlo con alguien que conoce el oficio.',
                'There is no correct combination for remembering. The value of this bouquet does not depend on a flower having an established meaning, but on the intention you give it and on what you learned while making it with someone who knows the craft.'
              )}
            </blockquote>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPaso(0)}
                className="text-sm text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8C7A] dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {L('Volver al principio', 'Back to the beginning')}
              </button>
              <span className="text-xs text-zinc-400">
                {L(
                  'Nada de lo que hiciste aquí se ha guardado.',
                  'Nothing you did here was stored.'
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
