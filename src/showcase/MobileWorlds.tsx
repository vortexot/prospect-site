import { Img, type Tx } from './Worlds'

/**
 * The same eight concepts composed for narrow screens. These are not the 1440 px
 * artboards scaled down: they are drawn at real size, with only a brand, a headline
 * and one action each, and no text below 12 px.
 */
type Concept = {
  key: string
  img: string
  logo: string
  title: [pt: string, en: string]
  cta: [pt: string, en: string]
}

const CONCEPTS: Concept[] = [
  { key: 'arch', img: 'arch-1', logo: 'MONOLITO', title: ['Construindo um futuro melhor.', 'Building a better future.'], cta: ['Ver projetos', 'View projects'] },
  { key: 'estate', img: 'estate-2', logo: 'Altavista', title: ['Viva o extraordinário.', 'Live the extraordinary.'], cta: ['Buscar imóveis', 'Search homes'] },
  { key: 'barber', img: 'barber-1', logo: 'OFÍCIO', title: ['Mais que um corte.', 'More than a haircut.'], cta: ['Agendar horário', 'Book a time'] },
  { key: 'food', img: 'food-1', logo: 'Éter', title: ['Além do paladar.', 'Beyond taste.'], cta: ['Reservar mesa', 'Book a table'] },
  { key: 'clinic', img: 'clinic-1', logo: 'luma', title: ['Realce o seu melhor.', 'Bring out your best.'], cta: ['Agendar avaliação', 'Book a consultation'] },
  { key: 'fit', img: 'fitness-2', logo: 'FORJA', title: ['Supere seus limites.', 'Push your limits.'], cta: ['Aula experimental', 'Trial class'] },
  { key: 'auto', img: 'auto-1', logo: 'VÉRTICE', title: ['Performance em cada detalhe.', 'Performance in every detail.'], cta: ['Agendar test drive', 'Book a test drive'] },
  { key: 'fashion', img: 'fashion-1', logo: 'SOMBRA', title: ['Estilo que transcende.', 'Style that transcends.'], cta: ['Ver coleção', 'View collection'] },
]

export const MOBILE_WORLDS = CONCEPTS.map((c) =>
  function MobileWorld({ tx }: { tx: Tx }) {
    return (
      <div className={`world mw mw-${c.key}`}>
        <b className="mw-logo">{c.logo}</b>
        <div className="mw-media">
          <Img n={c.img} sizes="(max-width: 899px) 90vw, 1px" />
        </div>
        <div className="mw-body">
          <p className="mw-title r1">{tx(...c.title)}</p>
          <span className="mw-cta r2">{tx(...c.cta)}</span>
        </div>
      </div>
    )
  },
)
