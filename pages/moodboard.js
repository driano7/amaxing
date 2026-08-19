{
  /* eslint-disable react/no-unescaped-entities */
}
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'

const styles = `
  .moodboard {
    font-family: 'Nunito', sans-serif;
    background: #FAF3EA;
    color: #2E2E33;
    line-height: 1.5;
    padding-bottom: 80px;
  }

  .moodboard header {
    background: linear-gradient(135deg, #E4007C 0%, #B5006A 100%);
    color: #FFF8F0;
    padding: 64px 32px 56px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .moodboard header::after {
    content: "";
    position: absolute;
    bottom: -30px;
    left: 0;
    right: 0;
    height: 60px;
    background: repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,248,240,0.15) 18px, rgba(255,248,240,0.15) 20px);
  }

  .moodboard header h1 {
    font-family: 'Fraunces', serif;
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .moodboard header p {
    margin-top: 12px;
    font-size: 1.1rem;
    opacity: 0.92;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }

  .moodboard section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 56px 32px 0;
  }

  .moodboard h2 {
    font-family: 'Fraunces', serif;
    font-size: 1.8rem;
    color: #B5006A;
    margin-bottom: 8px;
  }

  .moodboard .subtitle {
    color: #7A6A62;
    margin-bottom: 28px;
    max-width: 700px;
  }

  .moodboard .palette {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 16px;
    margin-bottom: 8px;
  }

  .moodboard .swatch {
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(58,46,42,0.12);
  }

  .moodboard .swatch .color { height: 100px; }

  .moodboard .swatch .label {
    background: #FFFDF9;
    padding: 10px 12px;
    font-size: 0.82rem;
  }

  .moodboard .swatch .label b { display: block; font-size: 0.88rem; }

  .moodboard .type-card {
    background: #FFFDF9;
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 20px;
    box-shadow: 0 4px 14px rgba(58,46,42,0.08);
  }

  .moodboard .type-card .tag {
    display: inline-block;
    background: #FCE4F1;
    color: #B5006A;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 14px;
  }

  .moodboard .headline-sample {
    font-family: 'Fraunces', serif;
    font-size: 2.4rem;
    font-weight: 600;
    color: #2E2E33;
  }

  .moodboard .headline-sample.italic { font-style: italic; font-weight: 500; }

  .moodboard .body-sample {
    font-family: 'Nunito', sans-serif;
    font-size: 1.05rem;
    color: #5B4B44;
    margin-top: 10px;
  }

  .moodboard .mascot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .moodboard .mascot-card {
    background: #FFFDF9;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 14px rgba(58,46,42,0.08);
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .moodboard .mascot-card svg { flex-shrink: 0; }

  .moodboard .mascot-card h3 {
    font-family: 'Fraunces', serif;
    color: #B5006A;
    font-size: 1.15rem;
    margin-bottom: 6px;
  }

  .moodboard .mascot-card p { font-size: 0.92rem; color: #5B4B44; }

  .moodboard .mascot-card .pick {
    display: inline-block;
    margin-top: 8px;
    font-size: 0.75rem;
    font-weight: 800;
    color: #0E8C7A;
    letter-spacing: 0.04em;
  }

  .moodboard .naming-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 14px;
  }

  .moodboard .name-card {
    background: #FFFDF9;
    border-left: 5px solid #E4007C;
    border-radius: 10px;
    padding: 16px 18px;
    box-shadow: 0 3px 10px rgba(58,46,42,0.07);
  }

  .moodboard .name-card .name {
    font-family: 'Fraunces', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #2E2E33;
  }

  .moodboard .name-card p { font-size: 0.85rem; color: #7A6A62; margin-top: 4px; }

  .moodboard footer {
    text-align: center;
    margin-top: 60px;
    color: #A8968C;
    font-size: 0.85rem;
  }

  .moodboard .papel-picado {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin: 40px 0 0;
  }
  .moodboard .papel-picado span {
    width: 10px; height: 10px; border-radius: 2px;
    background: #E4007C;
  }
  .moodboard .papel-picado span:nth-child(2n) { background: #0E8C7A; }
  .moodboard .papel-picado span:nth-child(3n) { background: #F2A03D; }
`

export default function Moodboard() {
  return (
    <>
      <PageSEO
        title="Amaxing — Moodboard de Identidad Visual"
        description="Dirección visual de la marca Amaxing: paleta, tipografía, mascota y nombre."
      />
      <style>{styles}</style>
      <div className="moodboard">
        <header>
          <h1>Amaxing — Dirección Visual</h1>
          <p>
            v2: que la marca se sienta como el abrazo de un mexicano — cálida, orgullosamente
            chilanga, y con raíz en el oficio popular. Mascota ajustada tras feedback: fuera ajolote
            y jaguar literal, dentro el jaguar llevado a símbolo o patrón abstracto.
          </p>
        </header>

        <section>
          <h2>Paleta de color</h2>
          <p className="subtitle">
            Rosa mexicano como base, acompañado de tonos que vienen del mercado, la talavera, el
            papel picado y el cempasúchil — para que el rosa no quede solo, sino en compañía. Se
            sustituye el negro puro del sitio actual por un gris carbón neutro (sin subtono café,
            para no perder el aire moderno) y un hueso/crema en vez de blanco frío.
          </p>
          <div className="palette">
            <div className="swatch">
              <div className="color" style={{ background: '#E4007C' }} />
              <div className="label">
                <b>Rosa mexicano</b>#E4007C — primario
              </div>
            </div>
            <div className="swatch">
              <div className="color" style={{ background: '#0E8C7A' }} />
              <div className="label">
                <b>Turquesa talavera</b>#0E8C7A — de la máscara tallada
              </div>
            </div>
            <div className="swatch">
              <div className="color" style={{ background: '#F2A03D' }} />
              <div className="label">
                <b>Cempasúchil</b>#F2A03D — acento festivo
              </div>
            </div>
            <div className="swatch">
              <div className="color" style={{ background: '#C1440E' }} />
              <div className="label">
                <b>Terracota / barro</b>#C1440E — acento cálido
              </div>
            </div>
            <div className="swatch">
              <div className="color" style={{ background: '#2E2E33' }} />
              <div className="label">
                <b>Gris carbón</b>#2E2E33 — reemplaza el negro, neutro y moderno
              </div>
            </div>
            <div className="swatch">
              <div className="color" style={{ background: '#FAF3EA', border: '1px solid #eee' }} />
              <div className="label">
                <b>Hueso / crema</b>#FAF3EA — reemplaza el blanco frío
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>Tipografía</h2>
          <p className="subtitle">
            Una serif con carácter para títulos (evoca rótulos pintados a mano, sin caer en la
            tipografía "azteca de antro turístico") y una sans redondeada y amigable para texto —
            legible, cálida, nada corporativa fría.
          </p>

          <div className="type-card">
            <span className="tag">Titulares — Fraunces</span>
            <div className="headline-sample">Descubre el CDMX que abraza</div>
            <div className="headline-sample italic">amaxing, la ciudad en cada bocado</div>
          </div>

          <div className="type-card">
            <span className="tag">Texto — Nunito</span>
            <div className="body-sample">
              Tours diseñados por chilangos, para quien viaja solo y quiere sentirse acompañado.
              Sabores, calles y olores de la Ciudad de México, contados por quienes de verdad la
              conocen.
            </div>
          </div>
        </section>

        <section>
          <h2>Conceptos de mascota — v2: jaguar en abstracción</h2>
          <p className="subtitle">
            <strong>Descartado:</strong> ajolote (sobreexplotado como símbolo CDMX) y jaguar/ocelote
            literal-figurativo (sobreexplotado en turismo mexicano). Nueva dirección: quedarnos con
            el jaguar como símbolo, pero <em>reducido a su esencia</em> — un mark geométrico o de
            patrón, no un personaje con cara de caricatura. Cuatro caminos:
          </p>
          <div className="mascot-grid">
            <div className="mascot-card">
              <svg width="72" height="72" viewBox="0 0 100 100">
                <rect x="5" y="5" width="90" height="90" rx="24" fill="#2E2E33" />
                <path d="M30 50 Q38 30 46 50 Q38 70 30 50 Z" fill="#FAF3EA" />
                <path d="M54 50 Q62 30 70 50 Q62 70 54 50 Z" fill="#FAF3EA" />
                <circle cx="38" cy="50" r="3.5" fill="#E4007C" />
                <circle cx="62" cy="50" r="3.5" fill="#E4007C" />
              </svg>
              <div>
                <h3>Ojos en la oscuridad</h3>
                <p>
                  El jaguar reducido a lo mínimo reconocible: la mirada. Negativo de dos ojos
                  felinos sobre un fondo sólido. Misterioso, poderoso, funciona en tamaño diminuto
                  (favicon, ícono de WhatsApp) — nada de "cara de peluche".
                </p>
              </div>
            </div>
            <div className="mascot-card">
              <svg width="72" height="72" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="#FAF3EA" />
                <circle cx="50" cy="30" r="7" fill="#0E8C7A" />
                <circle cx="68" cy="38" r="7" fill="#0E8C7A" />
                <circle cx="72" cy="58" r="7" fill="#0E8C7A" />
                <circle cx="58" cy="72" r="7" fill="#0E8C7A" />
                <circle cx="38" cy="70" r="7" fill="#0E8C7A" />
                <circle cx="28" cy="52" r="6" fill="#0E8C7A" />
                <circle cx="50" cy="50" r="10" fill="#E4007C" />
              </svg>
              <div>
                <h3>Roseta abstracta</h3>
                <p>
                  En vez de dibujar al animal, se usa <em>su patrón</em> — la roseta del pelaje de
                  jaguar convertida en mark independiente. Funciona como ícono, como sello, y como
                  textura repetible en empaques, stickers o el patrón de fondo del sitio.
                </p>
              </div>
            </div>
            <div className="mascot-card">
              <svg width="72" height="72" viewBox="0 0 100 100">
                <polygon
                  points="50,10 30,5 38,28 15,45 25,75 50,90 75,75 85,45 62,28 70,5"
                  fill="#2E2E33"
                />
                <polygon points="50,10 85,45 50,50" fill="#E4007C" opacity="0.9" />
                <polygon points="50,50 85,45 75,75" fill="#0E8C7A" opacity="0.9" />
                <polygon points="50,50 75,75 50,90" fill="#F2A03D" opacity="0.9" />
                <polygon points="50,90 25,75 50,50" fill="#C1440E" opacity="0.9" />
                <polygon points="50,50 25,75 15,45" fill="#B5006A" opacity="0.9" />
                <polygon points="50,50 15,45 50,10" fill="#FAF3EA" opacity="0.5" />
              </svg>
              <div>
                <h3>Cabeza facetada</h3>
                <p>
                  Silueta de cabeza felina construida en planos geométricos, como piedra tallada.
                  Cada faceta puede tomar un color de la paleta — es el punto medio entre "se nota
                  que es un jaguar" y "no es un dibujo animado".
                </p>
              </div>
            </div>
            <div className="mascot-card">
              <svg width="72" height="72" viewBox="0 0 100 100">
                <rect x="4" y="4" width="92" height="92" fill="#FAF3EA" />
                <path
                  d="M10,25 L10,15 L20,15 L20,25 L30,25 L30,15 L40,15 L40,25 L60,25 L60,15 L70,15 L70,25 L80,25 L80,15 L90,15 L90,25"
                  fill="none"
                  stroke="#C1440E"
                  stroke-width="4"
                />
                <path
                  d="M10,75 L10,85 L20,85 L20,75 L30,75 L30,85 L40,85 L40,75 L60,75 L60,85 L70,85 L70,75 L80,75 L80,85 L90,85 L90,75"
                  fill="none"
                  stroke="#C1440E"
                  stroke-width="4"
                />
                <path d="M50 38 Q60 50 50 62 Q40 50 50 38 Z" fill="#2E2E33" />
                <circle cx="50" cy="50" r="4" fill="#E4007C" />
              </svg>
              <div>
                <h3>Greca oaxaqueña + ojo felino</h3>
                <p>
                  El ojo del jaguar enmarcado por una greca escalonada tipo Mitla (Oaxaca) — el
                  patrón geométrico prehispánico más icónico del estado de origen de uno de los
                  fundadores. Menos "turismo genérico mexicano", más raíz personal y específica.
                </p>
                <span className="pick">◆ conecta directo con la historia de origen oaxaqueña</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>Exploración de nombre (con juego "MX")</h2>
          <p className="subtitle">
            Mantienen la puerta abierta a cambiar el nombre si conserva el guiño a "MX". Aquí
            algunas direcciones para reaccionar — ninguna es definitiva.
          </p>
          <div className="naming-grid">
            <div className="name-card">
              <div className="name">Amaxing</div>
              <p>
                El actual. Ya funciona en inglés/español, fácil de decir, reconocible. Cambiarlo
                tiene costo de continuidad.
              </p>
            </div>
            <div className="name-card">
              <div className="name">MXperience</div>
              <p>
                MX + experience/experiencia. Bilingüe de forma natural, suena a producto de viajes.
              </p>
            </div>
            <div className="name-card">
              <div className="name">ChilangoMX</div>
              <p>
                El más directo en reivindicar el término. Menos "juego", más declaración de
                identidad.
              </p>
            </div>
            <div className="name-card">
              <div className="name">VamoMX</div>
              <p>
                Tono casual e invitador ("vamos" + MX). Muy hablado, cercano al público joven local.
              </p>
            </div>
            <div className="name-card">
              <div className="name">CDMXtraordinaria</div>
              <p>CDMX + extraordinaria. Muy descriptivo, un poco más largo para logo/redes.</p>
            </div>
          </div>
        </section>

        <div className="papel-picado">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <footer>Amaxing · Documento de trabajo · Identidad visual v1 · Agosto 2026</footer>
      </div>
    </>
  )
}
