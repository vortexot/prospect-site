import './fonts.css'
import './worlds.css'

/**
 * Eight website hero concepts for fictional brands. Each is drawn on a fixed
 * 1440×900 artboard and scaled to the showcase frame, like a real browser viewport.
 */

/** Every visible string of a concept, in the page's language. */
export type Tx = (pt: string, en: string) => string

export function Img({ n, sizes = '1000px', className }: { n: string; sizes?: string; className?: string }) {
  return (
    <img
      className={className}
      src={`/showcase/${n}.webp`}
      srcSet={`/showcase/${n}-sm.webp 800w, /showcase/${n}.webp 1600w`}
      sizes={sizes}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      data-liquid=""
    />
  )
}

const Arch = ({ tx }: { tx: Tx }) => (
  <div className="world w-arch">
    <Img n="arch-1" className="wa-bg" sizes="(max-width: 899px) 100vw, 1100px" />
    <div className="wa-grid">
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
    <header className="w-nav">
      <b className="wa-logo">
        MONOLITO<small>{tx('arquitetura & construção', 'architecture & construction')}</small>
      </b>
      <nav>
        <span>{tx('Projetos', 'Projects')}</span>
        <span>{tx('Escritório', 'Studio')}</span>
        <span>{tx('Obras', 'Sites')}</span>
        <span>{tx('Contato', 'Contact')}</span>
      </nav>
      <span className="wa-quote">{tx('Solicitar orçamento', 'Request a quote')}</span>
    </header>
    <div className="wa-title r1">
      {tx('Construindo', 'Building')}
      <br />
      {tx('um futuro', 'a better')}
      <br />
      {tx('melhor.', 'future.')}
    </div>
    <div className="wa-side r2">
      <p>{tx('Projetos residenciais e corporativos com rigor técnico, do primeiro traço à entrega das chaves.', 'Residential and corporate projects with technical rigour, from the first sketch to handing over the keys.')}</p>
      <span className="wa-btn">{tx('Ver projetos', 'View projects')}</span>
    </div>
    <dl className="wa-spec r3">
      <div>
        <dt>{tx('Projeto', 'Project')}</dt>
        <dd>{tx('Pavilhão Duna', 'Dune Pavilion')}</dd>
      </div>
      <div>
        <dt>{tx('Área', 'Area')}</dt>
        <dd>{tx('12.400 m²', '12,400 m²')}</dd>
      </div>
      <div>
        <dt>{tx('Entrega', 'Handover')}</dt>
        <dd>2025</dd>
      </div>
    </dl>
  </div>
)

const Estate = ({ tx }: { tx: Tx }) => (
  <div className="world w-estate">
    <div className="we-media">
      <Img n="estate-2" sizes="(max-width: 899px) 70vw, 760px" />
    </div>
    <div className="we-panel">
      <header className="w-nav">
        <b className="we-logo">
          Altavista<small>{tx('Residências', 'Residences')}</small>
        </b>
        <nav>
          <span>{tx('Comprar', 'Buy')}</span>
          <span>{tx('Lançamentos', 'New homes')}</span>
          <span>{tx('Sobre', 'About')}</span>
        </nav>
      </header>
      <div className="we-title r1">
        {tx('Viva o', 'Live the')}
        <br />
        {tx('extraordinário.', 'extraordinary.')}
      </div>
      <p className="we-sub r2">{tx('Residências de alto padrão selecionadas uma a uma, com atendimento reservado do primeiro contato às chaves.', 'High-end homes selected one by one, with private service from the first contact to the keys.')}</p>
    </div>
    <div className="we-card r3">
      <Img n="estate-1" sizes="260px" />
      <div>
        <small>{tx('Destaque', 'Featured')}</small>
        <b>{tx('Casa Horizonte', 'Horizon House')}</b>
        <span>{tx('4 suítes · 620 m²', '4 suites · 620 m²')}</span>
      </div>
    </div>
    <div className="we-search r2">
      <div>
        <small>{tx('Localização', 'Location')}</small>
        <span>Lago Sul, Brasília</span>
      </div>
      <div>
        <small>{tx('Tipo', 'Type')}</small>
        <span>{tx('Casa', 'House')}</span>
      </div>
      <div>
        <small>{tx('Investimento', 'Budget')}</small>
        <span>{tx('Acima de R$ 5 mi', 'Above R$ 5M')}</span>
      </div>
      <span className="we-go">{tx('Buscar imóveis', 'Search homes')}</span>
    </div>
  </div>
)

const Barber = ({ tx }: { tx: Tx }) => (
  <div className="world w-barber">
    <Img n="barber-1" className="wb-img" sizes="(max-width: 899px) 70vw, 900px" />
    <header className="w-nav">
      <b className="wb-logo">OFÍCIO</b>
      <nav>
        <span>{tx('Serviços', 'Services')}</span>
        <span>{tx('Barbeiros', 'Barbers')}</span>
        <span>{tx('Loja', 'Shop')}</span>
      </nav>
      <span className="wb-book">{tx('Agendar', 'Book')}</span>
    </header>
    <div className="wb-title r1">
      <span>{tx('Mais que', 'More than')}</span>
      <span>{tx('um corte.', 'a haircut.')}</span>
    </div>
    <div className="wb-sub r2">{tx('Um estilo de vida.', 'A way of life.')}</div>
    <div className="wb-agenda r3">
      <small>{tx('Horários de hoje', 'Today\'s slots')}</small>
      <div className="wb-slots">
        <span>14:30</span>
        <span className="on">15:15</span>
        <span>16:00</span>
        <span>17:45</span>
      </div>
      <span className="wb-cta">{tx('Agendar horário', 'Book a time')}</span>
    </div>
    <div className="wb-meta">{tx('Corte + barba — 60 min', 'Cut + beard — 60 min')}</div>
  </div>
)

const Food = ({ tx }: { tx: Tx }) => (
  <div className="world w-food">
    <header className="w-nav">
      <span>Menu</span>
      <span>{tx('Adega', 'Cellar')}</span>
      <b className="wf-logo">Éter</b>
      <span>{tx('História', 'Story')}</span>
      <span className="wf-res">{tx('Reservar', 'Reserve')}</span>
    </header>
    <div className="wf-plate">
      <Img n="food-1" sizes="(max-width: 899px) 50vw, 600px" />
    </div>
    <div className="wf-t1 r1">{tx('Uma experiência', 'An experience')}</div>
    <div className="wf-t2 r1">{tx('além do paladar.', 'beyond taste.')}</div>
    <div className="wf-menu r2">
      <small>{tx('Menu degustação', 'Tasting menu')}</small>
      <ol>
        <li>{tx('Pão de fermentação natural', 'Sourdough bread')}</li>
        <li>{tx('Peixe curado, cítricos', 'Cured fish, citrus')}</li>
        <li>{tx('Cordeiro, terra e brasa', 'Lamb, earth and ember')}</li>
      </ol>
      <span>{tx('7 tempos, harmonização opcional', '7 courses, optional pairing')}</span>
    </div>
    <div className="wf-book r3">
      <span>{tx('Sexta, 20:30', 'Friday, 8:30 pm')}</span>
      <span>{tx('2 pessoas', '2 guests')}</span>
      <span className="wf-cta">{tx('Reservar mesa', 'Book a table')}</span>
    </div>
  </div>
)

const Clinic = ({ tx }: { tx: Tx }) => (
  <div className="world w-clinic">
    <header className="w-nav">
      <b className="wc-logo">
        luma<small>{tx('estética avançada', 'advanced aesthetics')}</small>
      </b>
      <nav>
        <span>{tx('Tratamentos', 'Treatments')}</span>
        <span>{tx('Equipe', 'Team')}</span>
        <span>{tx('A clínica', 'The clinic')}</span>
      </nav>
      <span className="wc-s">{tx('Agendar', 'Book')}</span>
    </header>
    <div className="wc-title r1">{tx('Realce o que há de melhor em você.', 'Bring out the best in you.')}</div>
    <p className="wc-sub r2">{tx('Protocolos personalizados de estética facial e corporal, conduzidos por especialistas.', 'Personalised face and body protocols, led by specialists.')}</p>
    <div className="wc-form r3">
      <div>
        <small>{tx('Tratamento', 'Treatment')}</small>
        <span>{tx('Bioestimulador', 'Biostimulator')}</span>
      </div>
      <div>
        <small>{tx('Data', 'Date')}</small>
        <span>{tx('12 de março', 'March 12')}</span>
      </div>
      <span className="wc-go">{tx('Agendar avaliação', 'Book a consultation')}</span>
    </div>
    <div className="wc-arch">
      <Img n="clinic-1" sizes="(max-width: 899px) 40vw, 520px" />
    </div>
    <div className="wc-thumb">
      <Img n="clinic-2" sizes="240px" />
    </div>
    <ul className="wc-list">
      <li>{tx('Facial', 'Face')}</li>
      <li>{tx('Corporal', 'Body')}</li>
      <li>Laser</li>
    </ul>
  </div>
)

const Fitness = ({ tx }: { tx: Tx }) => (
  <div className="world w-fit">
    <div className="wfi-img">
      <Img n="fitness-2" sizes="(max-width: 899px) 80vw, 1000px" />
    </div>
    <header className="w-nav">
      <b className="wfi-logo">FORJA</b>
      <nav>
        <span>{tx('Modalidades', 'Classes')}</span>
        <span>{tx('Planos', 'Plans')}</span>
        <span>{tx('Unidades', 'Locations')}</span>
      </nav>
      <span className="wfi-s">{tx('Matricule-se', 'Join now')}</span>
    </header>
    <div className="wfi-title r1">
      <span>{tx('Supere', 'Push')}</span>
      <span>{tx('seus', 'your')}</span>
      <span>{tx('limites.', 'limits.')}</span>
    </div>
    <p className="wfi-sub r2">{tx('Força e condicionamento com acompanhamento de perto, do primeiro treino ao seu melhor tempo.', 'Strength and conditioning with close coaching, from the first session to your best time.')}</p>
    <div className="wfi-sched r3">
      <small>{tx('Hoje', 'Today')}</small>
      <div>
        <b>06:00</b>
        <span>{tx('Força', 'Strength')}</span>
      </div>
      <div>
        <b>12:15</b>
        <span>HIIT</span>
      </div>
      <div>
        <b>18:30</b>
        <span>{tx('Mobilidade', 'Mobility')}</span>
      </div>
      <span className="wfi-cta">{tx('Aula experimental', 'Trial class')}</span>
    </div>
  </div>
)

const Auto = ({ tx }: { tx: Tx }) => (
  <div className="world w-auto">
    <header className="w-nav">
      <b className="wau-logo">VÉRTICE</b>
      <nav>
        <span>{tx('Modelos', 'Models')}</span>
        <span>{tx('Configurar', 'Configure')}</span>
        <span>{tx('Concessionárias', 'Dealers')}</span>
      </nav>
      <span className="wau-s">Test drive</span>
    </header>
    <div className="wau-title r1">
      {tx('Performance em', 'Performance in')}
      <br />
      {tx('cada detalhe.', 'every detail.')}
    </div>
    <div className="wau-car">
      <Img n="auto-1" sizes="(max-width: 899px) 100vw, 1300px" />
    </div>
    <div className="wau-specs r2">
      <div>
        <b>{tx('3,2 s', '3.2 s')}</b>
        <span>0–100 km/h</span>
      </div>
      <div>
        <b>{tx('650 cv', '650 hp')}</b>
        <span>{tx('Potência', 'Power')}</span>
      </div>
      <div>
        <b>318 km/h</b>
        <span>{tx('Velocidade máx.', 'Top speed')}</span>
      </div>
    </div>
    <div className="wau-foot r3">
      <span className="wau-model">{tx('Série V — GT', 'V Series — GT')}</span>
      <span className="wau-cta">{tx('Agendar test drive', 'Book a test drive')}</span>
    </div>
  </div>
)

const Fashion = ({ tx }: { tx: Tx }) => (
  <div className="world w-fashion">
    <header className="w-nav">
      <b className="wfa-logo">SOMBRA</b>
      <nav>
        <span>{tx('Novidades', 'New in')}</span>
        <span>{tx('Coleções', 'Collections')}</span>
        <span>Lookbook</span>
      </nav>
      <span>{tx('Sacola (2)', 'Bag (2)')}</span>
    </header>
    <div className="wfa-main">
      <Img n="fashion-1" sizes="(max-width: 899px) 50vw, 640px" />
    </div>
    <div className="wfa-title r1">
      {tx('Estilo que', 'Style that')}
      <br />
      {tx('transcende.', 'transcends.')}
    </div>
    <div className="wfa-side r2">
      <Img n="fashion-2" sizes="380px" />
      <div className="wfa-prod">
        <span>{tx('Jaqueta Shell Oversized', 'Oversized shell jacket')}</span>
        <b>R$ 689</b>
      </div>
    </div>
    <div className="wfa-coll r3">
      <small>{tx('Coleção', 'Collection')}</small>
      <span>{tx('Inverno 26', 'Winter 26')}</span>
      <span className="wfa-cta">{tx('Ver coleção', 'View collection')}</span>
    </div>
    <div className="wfa-issue">{tx('N.º 08', 'No. 08')}</div>
  </div>
)

export const WORLDS = [Arch, Estate, Barber, Food, Clinic, Fitness, Auto, Fashion]
export const WORLD_HEADLINES = {
  pt: [
    'Construindo um futuro melhor.',
    'Viva o extraordinário.',
    'Mais que um corte. Um estilo de vida.',
    'Uma experiência além do paladar.',
    'Realce o que há de melhor em você.',
    'Supere seus limites.',
    'Performance em cada detalhe.',
    'Estilo que transcende.',
  ],
  en: [
    'Building a better future.',
    'Live the extraordinary.',
    'More than a haircut. A way of life.',
    'An experience beyond taste.',
    'Bring out the best in you.',
    'Push your limits.',
    'Performance in every detail.',
    'Style that transcends.',
  ],
}
