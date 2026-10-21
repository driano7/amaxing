'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { Reveal } from './Reveal'

interface InterpretationNoteProps {
  title: string
  body: string
  accent: string
}

/**
 * Bloque de interpretación de Amaxing.
 *
 * Existe para separar visualmente lo que la historia documenta de lo que
 * opinamos nosotros. Cuando una lectura contemporanea aparece en el guion,
 * va aqui, marcada como lectura: no se atribuye a los artistas ni a las
 * fuentes, y el visitante puede distinguirla de un dato.
 */
export function InterpretationNote({ title, body, accent }: InterpretationNoteProps) {
  return (
    <Reveal className="mt-10">
      <aside
        className="rounded-2xl border border-dashed p-6 sm:p-7"
        style={{ borderColor: `${accent}66` }}
        aria-label={title}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: `${accent}1F`, color: accent }}
            aria-hidden
          >
            ?
          </span>
          <h3
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {title}
          </h3>
        </div>
        <p className="max-w-2xl leading-relaxed text-zinc-700 dark:text-zinc-200">{body}</p>
      </aside>
    </Reveal>
  )
}
