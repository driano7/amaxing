import io
import re
import json

TRAD = {
 'data/journeys/chapultepec.js': [
  'Falta un par de fotografías históricas y actuales verificadas del mismo punto, con procedencia y crédito documentados.',
  'A verified pair of historical and current photographs of the same spot is still missing, with documented origin and credit.',
 ],
 'data/journeys/centro.js': [
  'La fachada del Palacio Nacional estaba en restauración durante 2026, y los trabajos pueden alterar la vista. Confirma el estado antes de la visita.',
  'The National Palace façade was under restoration during 2026, and the works may change what you see. Check the state before you visit.',
  'El Museo Mural Diego Rivera abre de martes a domingo, de 10:00 a 18:00, con boleto y entrada libre los domingos. Es una extensión opcional: añade unos 50 minutos.',
  'The Museo Mural Diego Rivera opens Tuesday to Sunday, 10:00 to 18:00, with a ticket and free entry on Sundays. It is an optional extension: it adds about 50 minutes.',
 ],
 'data/journeys/antropologia.js': [
  'Historia de la construcción del museo y del patio: por documentar con la ficha institucional.',
  'The history of the building and the courtyard: to be documented from the institutional record.',
  'Ficha de la obra, fecha y programa iconográfico: por documentar con el museo.',
  'The label of the work, its date and its iconographic programme: to be documented with the museum.',
  'Relación exacta entre Dualidad y Día y la noche, y la sala donde se exhibe el boceto: por verificar.',
  'The exact relationship between Dualidad and Day and Night, and the room where the study is shown: to be verified.',
  'Fotografía verificada del relieve tallado, su sala exacta y su datación: por confirmar.',
  'A verified photograph of the carved relief, its exact room and its dating: to be confirmed.',
  'Identificación de la fuente, su contexto y su datación: por documentar.',
  'The identification of the fountain, its context and its dating: to be documented.',
  'Lectura del calendario y función del monolito: por documentar con la ficha del museo.',
  'The reading of the calendar and the function of the monolith: to be documented from the museum label.',
  'Cronología y piezas concretas de la sala: por documentar.',
  'The chronology and the specific pieces in the room: to be documented.',
  'Representación concreta que abre el bloque, su sala y su numero de inventario: por identificar.',
  'The specific representation that opens the block, its room and its inventory number: to be identified.',
  'Testimonios, fuentes y lectura del periodo: por documentar con el museo. Es el bloque donde el relato debe apoyarse en fuentes y no en el tono.',
  'Testimonies, sources and the reading of the period: to be documented with the museum. This is the block where the story has to rest on sources and not on tone.',
  'Pieza concreta, su estado de conservación y la historia de su excavación: por documentar. Ninguna afirmacion sobre este bloque debe publicarse sin fuente.',
  'The specific piece, its state of conservation and the history of its excavation: to be documented. No claim about this block should be published without a source.',
  'Pieza concreta, ubicacion y datacion: por verificar antes de cerrar el contenido.',
  'The specific piece, its location and its dating: to be verified before the content is closed.',
 ],
}

PATRON = re.compile(r"^([ \t]*)pending:\s*'((?:[^'\\]|\\.)*)',[ \t]*$", re.M | re.S)

for path, pares in TRAD.items():
    s = io.open(path, encoding='utf-8').read()
    mapa = dict(pares)

    def reemplazar(m):
        valor = m.group(2)
        if valor not in mapa:
            return m.group(0)
        return "%s\n%spending_en: %s," % (
            m.group(0),
            m.group(1),
            json.dumps(mapa[valor], ensure_ascii=False),
        )

    s = PATRON.sub(reemplazar, s)
    io.open(path, 'w', encoding='utf-8').write(s)
    print(path, '->', s.count('pending_en'), 'notas')
