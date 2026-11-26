import '@fontsource/big-shoulders-display/latin-800'
import '@fontsource/big-shoulders-display/latin-500'
import '@fontsource/italiana/latin-400'
import '@fontsource/anton/latin-400'
import '@fontsource/bodoni-moda/latin-400'
import '@fontsource/bodoni-moda/latin-400-italic'
import '@fontsource/tenor-sans/latin-400'
import '@fontsource/michroma/latin-400'
import '@fontsource/instrument-serif/latin-400'
import '@fontsource/instrument-serif/latin-400-italic'
import './worlds.css'

/**
 * Eight website hero concepts for fictional brands. Each is drawn on a fixed
 * 1440×900 artboard and scaled to the showcase frame, like a real browser viewport.
 */

function Img({ n, sizes = '1000px', eager = false, className }: { n: string; sizes?: string; eager?: boolean; className?: string }) {
  return (
    <img
      className={className}
      src={`/showcase/${n}.webp`}
      srcSet={`/showcase/${n}-sm.webp 800w, /showcase/${n}.webp 1600w`}
      sizes={sizes}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      data-liquid=""
    />
  )
}

const Arch = () => (
  <div className="world w-arch">
    <Img n="arch-1" eager className="wa-bg" sizes="(max-width: 899px) 100vw, 1100px" />
    <div className="wa-grid">
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
    <header className="w-nav">
      <b className="wa-logo">
        MONOLITO<small>arquitetura &amp; construção</small>
      </b>
      <nav>
        <span>Projetos</span>
        <span>Escritório</span>
        <span>Obras</span>
        <span>Contato</span>
      </nav>
      <span className="wa-quote">Solicitar orçamento</span>
    </header>
    <div className="wa-title r1">
      Construindo
      <br />
      um futuro
      <br />
      melhor.
    </div>
    <div className="wa-side r2">
      <p>Projetos residenciais e corporativos com rigor técnico, do primeiro traço à entrega das chaves.</p>
      <span className="wa-btn">Ver projetos</span>
    </div>
    <dl className="wa-spec r3">
      <div>
        <dt>Projeto</dt>
        <dd>Pavilhão Duna</dd>
      </div>
      <div>
        <dt>Área</dt>
        <dd>12.400 m²</dd>
      </div>
      <div>
        <dt>Entrega</dt>
        <dd>2025</dd>
      </div>
    </dl>
  </div>
)

const Estate = () => (
  <div className="world w-estate">
    <div className="we-media">
      <Img n="estate-2" sizes="(max-width: 899px) 70vw, 760px" />
    </div>
    <div className="we-panel">
      <header className="w-nav">
        <b className="we-logo">
          Altavista<small>Residências</small>
        </b>
        <nav>
          <span>Comprar</span>
          <span>Lançamentos</span>
          <span>Sobre</span>
        </nav>
      </header>
      <div className="we-title r1">
        Viva o<br />
        extraordinário.
      </div>
      <p className="we-sub r2">Residências de alto padrão selecionadas uma a uma, com atendimento reservado do primeiro contato às chaves.</p>
    </div>
    <div className="we-card r3">
      <Img n="estate-1" sizes="260px" />
      <div>
        <small>Destaque</small>
        <b>Casa Horizonte</b>
        <span>4 suítes · 620 m²</span>
      </div>
    </div>
    <div className="we-search r2">
      <div>
        <small>Localização</small>
        <span>Lago Sul, Brasília</span>
      </div>
      <div>
        <small>Tipo</small>
        <span>Casa</span>
      </div>
      <div>
        <small>Investimento</small>
        <span>Acima de R$ 5 mi</span>
      </div>
      <span className="we-go">Buscar imóveis</span>
    </div>
  </div>
)

const Barber = () => (
  <div className="world w-barber">
    <Img n="barber-1" className="wb-img" sizes="(max-width: 899px) 70vw, 900px" />
    <header className="w-nav">
      <b className="wb-logo">OFÍCIO</b>
      <nav>
        <span>Serviços</span>
        <span>Barbeiros</span>
        <span>Loja</span>
      </nav>
      <span className="wb-book">Agendar</span>
    </header>
    <div className="wb-title r1">
      <span>Mais que</span>
      <span>um corte.</span>
    </div>
    <div className="wb-sub r2">Um estilo de vida.</div>
    <div className="wb-agenda r3">
      <small>Horários de hoje</small>
      <div className="wb-slots">
        <span>14:30</span>
        <span className="on">15:15</span>
        <span>16:00</span>
        <span>17:45</span>
      </div>
      <span className="wb-cta">Agendar horário</span>
    </div>
    <div className="wb-meta">Corte + barba — 60 min</div>
  </div>
)

const Food = () => (
  <div className="world w-food">
    <header className="w-nav">
      <span>Menu</span>
      <span>Adega</span>
      <b className="wf-logo">Éter</b>
      <span>História</span>
      <span className="wf-res">Reservar</span>
    </header>
    <div className="wf-plate">
      <Img n="food-1" sizes="(max-width: 899px) 50vw, 600px" />
    </div>
    <div className="wf-t1 r1">Uma experiência</div>
    <div className="wf-t2 r1">além do paladar.</div>
    <div className="wf-menu r2">
      <small>Menu degustação</small>
      <ol>
        <li>Pão de fermentação natural</li>
        <li>Peixe curado, cítricos</li>
        <li>Cordeiro, terra e brasa</li>
      </ol>
      <span>7 tempos, harmonização opcional</span>
    </div>
    <div className="wf-book r3">
      <span>Sexta, 20:30</span>
      <span>2 pessoas</span>
      <span className="wf-cta">Reservar mesa</span>
    </div>
  </div>
)

const Clinic = () => (
  <div className="world w-clinic">
    <header className="w-nav">
      <b className="wc-logo">
        luma<small>estética avançada</small>
      </b>
      <nav>
        <span>Tratamentos</span>
        <span>Equipe</span>
        <span>A clínica</span>
      </nav>
      <span className="wc-s">Agendar</span>
    </header>
    <div className="wc-title r1">Realce o que há de melhor em você.</div>
    <p className="wc-sub r2">Protocolos personalizados de estética facial e corporal, conduzidos por especialistas.</p>
    <div className="wc-form r3">
      <div>
        <small>Tratamento</small>
        <span>Bioestimulador</span>
      </div>
      <div>
        <small>Data</small>
        <span>12 de março</span>
      </div>
      <span className="wc-go">Agendar avaliação</span>
    </div>
    <div className="wc-arch">
      <Img n="clinic-1" sizes="(max-width: 899px) 40vw, 520px" />
    </div>
    <div className="wc-thumb">
      <Img n="clinic-2" sizes="240px" />
    </div>
    <ul className="wc-list">
      <li>Facial</li>
      <li>Corporal</li>
      <li>Laser</li>
    </ul>
  </div>
)

const Fitness = () => (
  <div className="world w-fit">
    <div className="wfi-img">
      <Img n="fitness-2" sizes="(max-width: 899px) 80vw, 1000px" />
    </div>
    <header className="w-nav">
      <b className="wfi-logo">FORJA</b>
      <nav>
        <span>Modalidades</span>
        <span>Planos</span>
        <span>Unidades</span>
      </nav>
      <span className="wfi-s">Matricule-se</span>
    </header>
    <div className="wfi-title r1">
      <span>Supere</span>
      <span>seus</span>
      <span>limites.</span>
    </div>
    <p className="wfi-sub r2">Força e condicionamento com acompanhamento de perto, do primeiro treino ao seu melhor tempo.</p>
    <div className="wfi-sched r3">
      <small>Hoje</small>
      <div>
        <b>06:00</b>
        <span>Força</span>
      </div>
      <div>
        <b>12:15</b>
        <span>HIIT</span>
      </div>
      <div>
        <b>18:30</b>
        <span>Mobilidade</span>
      </div>
      <span className="wfi-cta">Aula experimental</span>
    </div>
  </div>
)

const Auto = () => (
  <div className="world w-auto">
    <header className="w-nav">
      <b className="wau-logo">VÉRTICE</b>
      <nav>
        <span>Modelos</span>
        <span>Configurar</span>
        <span>Concessionárias</span>
      </nav>
      <span className="wau-s">Test drive</span>
    </header>
    <div className="wau-title r1">
      Performance em
      <br />
      cada detalhe.
    </div>
    <div className="wau-car">
      <Img n="auto-1" sizes="(max-width: 899px) 100vw, 1300px" />
    </div>
    <div className="wau-specs r2">
      <div>
        <b>3,2 s</b>
        <span>0–100 km/h</span>
      </div>
      <div>
        <b>650 cv</b>
        <span>Potência</span>
      </div>
      <div>
        <b>318 km/h</b>
        <span>Velocidade máx.</span>
      </div>
    </div>
    <div className="wau-foot r3">
      <span className="wau-model">Série V — GT</span>
      <span className="wau-cta">Agendar test drive</span>
    </div>
  </div>
)

const Fashion = () => (
  <div className="world w-fashion">
    <header className="w-nav">
      <b className="wfa-logo">SOMBRA</b>
      <nav>
        <span>Novidades</span>
        <span>Coleções</span>
        <span>Lookbook</span>
      </nav>
      <span>Sacola (2)</span>
    </header>
    <div className="wfa-main">
      <Img n="fashion-1" sizes="(max-width: 899px) 50vw, 640px" />
    </div>
    <div className="wfa-title r1">
      Estilo que
      <br />
      transcende.
    </div>
    <div className="wfa-side r2">
      <Img n="fashion-2" sizes="380px" />
      <div className="wfa-prod">
        <span>Jaqueta Shell Oversized</span>
        <b>R$ 689</b>
      </div>
    </div>
    <div className="wfa-coll r3">
      <small>Coleção</small>
      <span>Inverno 26</span>
      <span className="wfa-cta">Ver coleção</span>
    </div>
    <div className="wfa-issue">N.º 08</div>
  </div>
)

export const WORLDS = [Arch, Estate, Barber, Food, Clinic, Fitness, Auto, Fashion]
export const WORLD_HEADLINES = [
  'Construindo um futuro melhor.',
  'Viva o extraordinário.',
  'Mais que um corte. Um estilo de vida.',
  'Uma experiência além do paladar.',
  'Realce o que há de melhor em você.',
  'Supere seus limites.',
  'Performance em cada detalhe.',
  'Estilo que transcende.',
]
