import Head from 'next/head'
import { Navbar } from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ui/ScrollReveal'
import CardStack from '@/components/about/CardStack'
import { useLanguage } from '@/lib/hooks/useLanguage'
import dynamic from 'next/dynamic'

const MobileDock = dynamic(() => import('@/components/MobileDock').then((m) => m.MobileDock), {
  loading: () => null,
})
const HubMenu = dynamic(() => import('@/components/HubMenu').then((m) => m.HubMenu), {
  ssr: false,
  loading: () => null,
})

const COLORS = {
  pink: '#E4007C',
  magenta: '#B5006A',
  cream: '#FAF3EA',
  teal: '#0E8C7A',
  amber: '#F2A03D',
  terracota: '#C1440E',
  dark: '#2E2E33',
  offWhite: '#FFF6F1',
  lightPink: '#FCE4F1',
}

export default function AboutPage() {
  const { t } = useLanguage()
  return (
    <>
      <Head>
        <title>{`Amaxing — ${t('aboutPage.whoTitle')}`}</title>
        <meta
          name="description"
          content={
            t('aboutPage.whoLead') ||
            'Amaxing nace del cruce de dos historias en la Ciudad de México.'
          }
        />
      </Head>

      <style jsx global>{`
        .about-page {
          background: ${COLORS.cream};
        }
        :global(.dark) .about-page {
          background: #18181b;
        }
        .about-page .wrap {
          max-width: 880px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .about-hero {
          background: radial-gradient(
            120% 140% at 50% -10%,
            #ff4fa3 0%,
            ${COLORS.pink} 45%,
            ${COLORS.magenta} 100%
          );
          color: ${COLORS.offWhite};
          padding: 90px 32px 110px;
          text-align: center;
        }
        .about-mark {
          width: 96px;
          height: 96px;
          margin: 0 auto 28px;
          filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.18));
        }
        .about-kicker {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.16);
          padding: 6px 16px;
          border-radius: 30px;
          margin-bottom: 22px;
        }
        .about-hero h1 {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: clamp(3rem, 9vw, 5.2rem);
          letter-spacing: -1px;
        }
        .about-tagline-es {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(1.3rem, 3vw, 1.7rem);
          margin-top: 18px;
          max-width: 560px;
          margin-left: auto;
          margin-right: auto;
        }
        .about-tagline-en {
          font-size: 1rem;
          opacity: 0.82;
          margin-top: 10px;
          letter-spacing: 0.02em;
        }

        .about-wave {
          display: block;
          width: 100%;
          height: 60px;
          margin-top: -2px;
        }

        .about-section {
          padding: 72px 0;
          position: relative;
        }
        .about-section-cream {
          background: ${COLORS.cream};
        }
        :global(.dark) .about-section-cream {
          background: #18181b;
        }
        .about-section-tint {
          background: ${COLORS.lightPink};
        }
        :global(.dark) .about-section-tint {
          background: #27272a;
        }

        .about-section-title {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: clamp(1.9rem, 4vw, 2.5rem);
          color: ${COLORS.magenta};
          margin-bottom: 24px;
          text-align: center;
        }
        :global(.dark) .about-section-title {
          color: #f472b6;
        }
        .about-lead {
          font-size: 1.12rem;
          color: #3f3a38;
          max-width: 680px;
          margin: 0 auto 18px;
          text-align: center;
        }
        :global(.dark) .about-lead {
          color: #d4d4d8;
        }

        .about-founders {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 40px 0 8px;
          flex-wrap: wrap;
        }
        .about-founder-chip {
          background: #fffdf9;
          border-radius: 16px;
          padding: 18px 26px;
          box-shadow: 0 4px 14px rgba(46, 46, 51, 0.08);
          text-align: center;
          min-width: 180px;
        }
        :global(.dark) .about-founder-chip {
          background: #27272a;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .about-founder-chip .role {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          color: ${COLORS.teal};
          font-size: 1.05rem;
        }
        .about-founder-chip .desc {
          font-size: 0.88rem;
          color: #6b5f58;
          margin-top: 4px;
        }

        .about-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .about-card {
          background: #fffdf9;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(46, 46, 51, 0.08);
          box-shadow: 0 4px 16px rgba(46, 46, 51, 0.07);
          transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 420ms cubic-bezier(0.22, 1, 0.36, 1);
          cursor: default;
        }
        :global(.dark) .about-card {
          background: #27272a;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .about-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px rgba(181, 0, 106, 0.12), 0 8px 16px rgba(46, 46, 51, 0.08);
          border-color: rgba(181, 0, 106, 0.2);
        }
        .about-card-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          background: linear-gradient(135deg, ${COLORS.lightPink} 0%, #f3e8ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .about-card-img-placeholder {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, ${COLORS.lightPink} 0%, #f3e8ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          opacity: 0.5;
        }
        .about-card-body {
          padding: 22px 22px 26px;
        }
        .about-card-icon {
          font-size: 1.6rem;
          margin-bottom: 8px;
          display: inline-block;
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .about-card:hover .about-card-icon {
          transform: scale(1.15) rotate(-4deg);
        }
        .about-card h3 {
          font-family: 'Fraunces', serif;
          color: ${COLORS.magenta};
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .about-card p {
          font-size: 0.92rem;
          color: #5b4b44;
          line-height: 1.6;
        }
        :global(.dark) .about-card p {
          color: #a1a1aa;
        }
        .about-card-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          font-size: 0.85rem;
          font-weight: 700;
          color: ${COLORS.magenta};
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .about-card:hover .about-card-link {
          opacity: 1;
          transform: translateX(0);
        }

        .about-symbol-block {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .about-symbol-visual {
          width: 220px;
          height: 220px;
          flex-shrink: 0;
          filter: drop-shadow(0 8px 20px rgba(46, 46, 51, 0.15));
        }
        .about-symbol-text {
          max-width: 420px;
        }
        .about-symbol-text p {
          font-size: 1.05rem;
          color: #3f3a38;
        }
        :global(.dark) .about-symbol-text p {
          color: #d4d4d8;
        }

        .about-greca {
          display: flex;
          justify-content: center;
          margin: 8px 0 0;
        }
        .about-greca svg {
          display: block;
        }

        .about-palette-strip {
          display: flex;
          height: 26px;
          border-radius: 13px;
          overflow: hidden;
          max-width: 460px;
          margin: 36px auto 0;
          box-shadow: 0 4px 14px rgba(46, 46, 51, 0.1);
        }
        .about-palette-strip div {
          flex: 1;
        }

        .about-footer {
          background: ${COLORS.dark};
          color: #f5eee7;
          padding: 70px 32px 50px;
          text-align: center;
          position: relative;
        }
        .about-footer h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.7rem, 4vw, 2.3rem);
          margin-bottom: 14px;
        }
        .about-footer .sub {
          color: #c9beb6;
          max-width: 520px;
          margin: 0 auto 34px;
        }

        .about-cta-row {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .about-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 40px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none;
          transition: transform 0.15s ease;
        }
        .about-btn:hover {
          transform: translateY(-2px);
        }
        .about-btn-primary {
          background: ${COLORS.pink};
          color: ${COLORS.offWhite};
        }
        .about-btn-ghost {
          background: transparent;
          color: #f5eee7;
          border: 1.5px solid #6b6870;
        }
        .about-footer .foot-tagline {
          margin-top: 46px;
          font-family: 'Fraunces', serif;
          font-style: italic;
          color: #c9beb6;
          font-size: 0.95rem;
        }

        @media (max-width: 560px) {
          .about-symbol-block {
            flex-direction: column;
            gap: 24px;
          }
          .about-symbol-text {
            text-align: center;
          }
          .about-hero {
            padding: 60px 20px 80px;
          }
          .about-card-img-placeholder {
            height: 160px;
          }
          .about-cards {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }
      `}</style>

      <div className="about-page min-h-screen pb-24 md:pb-0">
        {/* HERO */}
        <header className="about-hero">
          <svg
            className="about-mark"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="50,10 30,5 38,28 15,45 25,75 50,90 75,75 85,45 62,28 70,5"
              fill={COLORS.offWhite}
            />
            <polygon points="50,10 85,45 50,50" fill={COLORS.pink} opacity="0.92" />
            <polygon points="50,50 85,45 75,75" fill={COLORS.teal} opacity="0.92" />
            <polygon points="50,50 75,75 50,90" fill={COLORS.amber} opacity="0.92" />
            <polygon points="50,90 25,75 50,50" fill={COLORS.terracota} opacity="0.92" />
            <polygon points="50,50 25,75 15,45" fill={COLORS.magenta} opacity="0.92" />
            <polygon points="50,50 15,45 50,10" fill={COLORS.offWhite} opacity="0.35" />
            <path d="M40 48 Q46 40 50 48 Q46 56 40 48 Z" fill={COLORS.dark} />
            <path d="M50 48 Q56 40 60 48 Q56 56 50 48 Z" fill={COLORS.dark} />
          </svg>
          <span className="about-kicker">{t('aboutPage.kicker')}</span>
          <h1>{t('aboutPage.heroTitle')}</h1>
          <p className="about-tagline-es">{t('aboutPage.taglineEs')}</p>
          <p className="about-tagline-en">{t('aboutPage.taglineEn')}</p>
        </header>

        {/* WAVE */}
        <svg className="about-wave" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path
            d="M0,32 C240,64 480,0 720,20 C960,40 1200,64 1440,32 L1440,0 L0,0 Z"
            fill={COLORS.magenta}
          />
          <path
            d="M0,40 C240,68 480,16 720,32 C960,48 1200,68 1440,40 L1440,60 L0,60 Z"
            fill={COLORS.cream}
          />
        </svg>

        {/* QUIÉNES SOMOS */}
        <section className="about-section about-section-cream">
          <div className="wrap">
            <h2 className="about-section-title">{t('aboutPage.whoTitle')}</h2>
            <p className="about-lead">{t('aboutPage.whoLead')}</p>
            <div className="about-founders">
              <div className="about-founder-chip">
                <div className="role">{t('aboutPage.founderOax')}</div>
                <div className="desc">{t('aboutPage.founderOaxDesc')}</div>
              </div>
              <div className="about-founder-chip">
                <div className="role">{t('aboutPage.founderDef')}</div>
                <div className="desc">{t('aboutPage.founderDefDesc')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE NOSOTROS — card stack animation */}
        <CardStack />

        {/* POR QUÉ CHILANGO */}
        <section className="about-section about-section-tint">
          <div className="wrap">
            <h2 className="about-section-title">{t('aboutPage.whyTitle')}</h2>
            <p className="about-lead">{t('aboutPage.whyLead')}</p>
          </div>
        </section>

        {/* PARA QUIÉN */}
        <section className="about-section about-section-cream">
          <div className="wrap">
            <h2 className="about-section-title">{t('aboutPage.forWhoTitle')}</h2>
            <p className="about-lead">{t('aboutPage.forWhoLead')}</p>
            <ScrollReveal className="about-cards" itemClassName="">
              <div className="about-card">
                <div className="about-card-img-placeholder">🌮</div>
                <div className="about-card-body">
                  <span className="about-card-icon">🌮</span>
                  <h3>{t('aboutPage.cardFlavors')}</h3>
                  <p>{t('aboutPage.cardFlavorsDesc')}</p>
                  <span className="about-card-link">{t('aboutPage.viewTours')}</span>
                </div>
              </div>
              <div className="about-card">
                <div className="about-card-img-placeholder">🧭</div>
                <div className="about-card-body">
                  <span className="about-card-icon">🧭</span>
                  <h3>{t('aboutPage.cardPlaces')}</h3>
                  <p>{t('aboutPage.cardPlacesDesc')}</p>
                  <span className="about-card-link">{t('aboutPage.viewTours')}</span>
                </div>
              </div>
              <div className="about-card">
                <div className="about-card-img-placeholder">✨</div>
                <div className="about-card-body">
                  <span className="about-card-icon">✨</span>
                  <h3>{t('aboutPage.cardSurreal')}</h3>
                  <p>{t('aboutPage.cardSurrealDesc')}</p>
                  <span className="about-card-link">{t('aboutPage.viewTours')}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CONTACT US — 3 apple-style cards */}
        <section className="about-section about-section-cream">
          <div className="wrap">
            <h2 className="about-section-title">{t('aboutPage.contactTitle')}</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {/* WhatsApp */}
              <article className="rounded-[2rem] border border-zinc-200/70 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
                <div className="mb-4 flex h-44 items-center justify-center rounded-[1.4rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-400/20 via-white to-emerald-500/10 dark:from-emerald-900/20 dark:via-zinc-900 dark:to-emerald-800/10">
                  <span className="text-5xl">💬</span>
                </div>
                <div className="px-2 pb-2">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400">
                    WhatsApp
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-zinc-900 dark:text-white">
                    {t('aboutPage.contactCardTitle')}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t('aboutPage.contactCardDesc')}
                  </p>
                  <a
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-600 underline decoration-emerald-500/30 underline-offset-4 hover:text-emerald-500 dark:text-emerald-400"
                    href="https://wa.me/525512291607"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp →
                  </a>
                </div>
              </article>
              {/* Instagram */}
              <article className="rounded-[2rem] border border-zinc-200/70 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
                <div className="mb-4 flex h-44 items-center justify-center rounded-[1.4rem] border border-pink-500/20 bg-gradient-to-br from-pink-500/20 via-white to-fuchsia-500/10 dark:from-pink-900/20 dark:via-zinc-900 dark:to-fuchsia-800/10">
                  <span className="text-5xl">📷</span>
                </div>
                <div className="px-2 pb-2">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400">
                    Instagram
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-zinc-900 dark:text-white">
                    Síguenos
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Historias, reels y detrás de cámaras de cada tour.
                  </p>
                  <a
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-pink-600 underline decoration-pink-500/30 underline-offset-4 hover:text-pink-500 dark:text-pink-400"
                    href="https://www.instagram.com/donovan_amx/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram →
                  </a>
                </div>
              </article>
              {/* Email */}
              <article className="rounded-[2rem] border border-zinc-200/70 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
                <div className="mb-4 flex h-44 items-center justify-center rounded-[1.4rem] border border-sky-500/20 bg-gradient-to-br from-sky-400/20 via-white to-blue-500/10 dark:from-sky-900/20 dark:via-zinc-900 dark:to-blue-800/10">
                  <span className="text-5xl">✉️</span>
                </div>
                <div className="px-2 pb-2">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400">
                    Email
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-zinc-900 dark:text-white">
                    Escríbenos
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Para grupos, prensa o colaboraciones.
                  </p>
                  <a
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-600 underline decoration-sky-500/30 underline-offset-4 hover:text-sky-500 dark:text-sky-400"
                    href="mailto:dnvn@duck.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    dnvn@duck.com →
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* NUESTRO SÍMBOLO */}
        <section className="about-section about-section-tint">
          <div className="wrap">
            <h2 className="about-section-title">{t('aboutPage.symbolTitle')}</h2>
            <div className="about-symbol-block">
              <svg
                className="about-symbol-visual"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="50,10 30,5 38,28 15,45 25,75 50,90 75,75 85,45 62,28 70,5"
                  fill={COLORS.dark}
                />
                <polygon points="50,10 85,45 50,50" fill={COLORS.pink} opacity="0.92" />
                <polygon points="50,50 85,45 75,75" fill={COLORS.teal} opacity="0.92" />
                <polygon points="50,50 75,75 50,90" fill={COLORS.amber} opacity="0.92" />
                <polygon points="50,90 25,75 50,50" fill={COLORS.terracota} opacity="0.92" />
                <polygon points="50,50 25,75 15,45" fill={COLORS.magenta} opacity="0.92" />
                <polygon points="50,50 15,45 50,10" fill={COLORS.cream} opacity="0.4" />
                <path d="M40 48 Q46 40 50 48 Q46 56 40 48 Z" fill={COLORS.cream} />
                <path d="M50 48 Q56 40 60 48 Q56 56 50 48 Z" fill={COLORS.cream} />
              </svg>
              <div className="about-symbol-text">
                <p>{t('aboutPage.symbolDesc')}</p>
              </div>
            </div>
            <div className="about-greca">
              <svg width="320" height="30" viewBox="0 0 320 30">
                <path
                  d="M0,15 L0,5 L20,5 L20,15 L40,15 L40,5 L60,5 L60,15 L80,15 L80,5 L100,5 L100,15 L120,15 L120,5 L140,5 L140,15 L160,15 L160,5 L180,5 L180,15 L200,15 L200,5 L220,5 L220,15 L240,15 L240,5 L260,5 L260,15 L280,15 L280,5 L300,5 L300,15 L320,15"
                  fill="none"
                  stroke={COLORS.terracota}
                  strokeWidth="3"
                />
              </svg>
            </div>
            <div className="about-palette-strip">
              <div style={{ background: COLORS.pink }} />
              <div style={{ background: COLORS.teal }} />
              <div style={{ background: COLORS.amber }} />
              <div style={{ background: COLORS.terracota }} />
              <div style={{ background: COLORS.dark }} />
            </div>
          </div>
        </section>

        {/* FOOTER / CTA */}
        <footer className="about-footer">
          <h2>{t('aboutPage.footerTitle')}</h2>
          <p className="sub">{t('aboutPage.footerSub')}</p>
          <div className="about-cta-row">
            <a
              className="about-btn about-btn-primary"
              href="https://wa.me/525512291607"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 {t('aboutPage.whatsapp')}
            </a>
            <a
              className="about-btn about-btn-ghost"
              href="https://www.instagram.com/donovan_amx/"
              target="_blank"
              rel="noopener noreferrer"
            >
              📷 {t('aboutPage.instagram')}
            </a>
          </div>
          <p className="foot-tagline">{t('aboutPage.footTagline')}</p>
        </footer>
      </div>
    </>
  )
}

AboutPage.getLayout = (page) => (
  <div className="relative flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1 pt-20">{page}</main>
    <Footer />
    <MobileDock />
    <HubMenu showTrigger={false} />
  </div>
)
