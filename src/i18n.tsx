import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import site from '../site.config.json'

export type Lang = 'pt' | 'en'

const pt = {
  meta: {
    title: 'Prospect — Estúdio digital independente | Sites, landing pages e sistemas',
    skip: 'Pular para o conteúdo',
  },
  nav: { work: 'Trabalho', services: 'Serviços', about: 'Sobre', contact: 'Contato', menu: 'Menu', close: 'Fechar', home: 'Prospect, voltar ao início', lang: 'Idioma' },
  loader: { skip: 'Pular intro', loading: 'Carregando o universo Prospect' },
  hero: {
    label: 'ESTÚDIO DIGITAL INDEPENDENTE — 2026',
    title: ['Transformamos', 'ideias em experiências', 'digitais.'],
    sub: 'Sites, sistemas e soluções digitais feitos para fazer negócios avançarem.',
    explore: 'EXPLORE NOSSO UNIVERSO',
    start: 'INICIAR UM PROJETO',
    hint: 'Arraste para girar a estrutura',
    scroll: 'Role para entrar',
  },
  showcase: {
    title: 'Oito mundos digitais',
    intro: 'Oito negócios, oito linguagens visuais. Cada tela é um conceito de site desenhado pela Prospect para mostrar o que podemos construir.',
    note: 'Conceitos com marcas fictícias',
    skip: 'Pular a vitrine',
    prev: 'Conceito anterior',
    next: 'Próximo conceito',
    niches: ['Construção', 'Imobiliária', 'Barbearia', 'Restaurante', 'Estética', 'Fitness', 'Automotivo', 'Moda'],
  },
  about: {
    title: 'Sobre a Prospect',
    text: 'A Prospect é um estúdio digital independente. Desenhamos e desenvolvemos sites, landing pages e sistemas sob medida, com o mesmo cuidado em cada etapa: entender o negócio, dar forma à ideia e entregar algo que funciona de verdade.',
  },
  services: {
    title: 'Serviços',
    intro: 'Quatro frentes, um mesmo método: entender o negócio antes de desenhar a primeira tela.',
    items: [
      { title: ['SITES'], desc: 'Presença digital pensada para comunicar valor, construir credibilidade e gerar oportunidades.' },
      { title: ['LANDING', 'PAGES'], desc: 'Experiências focadas, desenhadas para conduzir o visitante a uma ação específica.' },
      { title: ['SISTEMAS'], desc: 'Plataformas, painéis e ferramentas sob medida, construídos em torno das necessidades do negócio.' },
      { title: ['SOLUÇÕES', 'DIGITAIS'], desc: 'Tecnologia pensada para resolver problemas reais e criar novas possibilidades.' },
    ],
  },
  work: {
    title: 'Trabalho',
    live: 'No ar',
    name: 'EVO Reformas',
    kind: 'Site institucional para um escritório de arquitetura, reformas e construção.',
    scope: 'Design e desenvolvimento do site',
    visit: 'Visitar o site',
    next: 'Seu projeto pode ser o próximo.',
    cta: 'Conversar sobre um projeto',
    alt: ['Página inicial do site EVO Reformas', 'Seção de serviços do site EVO Reformas', 'Seleção de projetos do site EVO Reformas', 'Site EVO Reformas no celular', 'Assinatura EVO Reformas no rodapé do site'],
  },
  process: {
    title: 'Processo',
    steps: [
      { name: 'Descoberta', desc: 'Entender o negócio, seus objetivos, público e desafios.', form: 'Fragmentos' },
      { name: 'Estratégia', desc: 'Definir a direção, a estrutura, o design e a experiência.', form: 'Geometria' },
      { name: 'Desenvolvimento', desc: 'Construir, testar, refinar e implementar a solução.', form: 'Construção' },
      { name: 'Lançamento', desc: 'Entregar e preparar o projeto para crescer.', form: 'Luz' },
    ],
  },
  finale: {
    title: ['Vamos criar algo', 'extraordinário.'],
    sub: 'Sua próxima experiência digital começa aqui.',
    cta: 'INICIAR UM PROJETO',
  },
  footer: {
    tagline: 'Estúdio digital independente. Sites, landing pages, sistemas e soluções digitais.',
    contact: 'Contato',
    whatsapp: 'WhatsApp',
    explore: 'Navegar',
    top: 'Voltar ao topo',
    rights: 'Todos os direitos reservados.',
  },
  cursor: { drag: 'Arraste', view: 'Ver', visit: 'Visitar' },
  wa: 'Olá, Prospect! Quero iniciar um projeto.',
  external: 'abre em nova aba',
}

type Dict = typeof pt

const en: Dict = {
  meta: {
    title: 'Prospect — Independent digital studio | Websites, landing pages and systems',
    skip: 'Skip to content',
  },
  nav: { work: 'Work', services: 'Services', about: 'About', contact: 'Contact', menu: 'Menu', close: 'Close', home: 'Prospect, back to top', lang: 'Language' },
  loader: { skip: 'Skip intro', loading: 'Loading the Prospect universe' },
  hero: {
    label: 'INDEPENDENT DIGITAL STUDIO — 2026',
    title: ['We turn ideas', 'into digital', 'experiences.'],
    sub: 'Websites, systems, and digital solutions built to move businesses forward.',
    explore: 'EXPLORE OUR WORLD',
    start: 'START A PROJECT',
    hint: 'Drag to turn the structure',
    scroll: 'Scroll to enter',
  },
  showcase: {
    title: 'Eight digital worlds',
    intro: 'Eight businesses, eight visual languages. Each screen is a website concept designed by Prospect to show what we can build.',
    note: 'Concepts with fictional brands',
    skip: 'Skip the showcase',
    prev: 'Previous concept',
    next: 'Next concept',
    niches: ['Construction', 'Real estate', 'Barbershop', 'Restaurant', 'Aesthetics', 'Fitness', 'Automotive', 'Fashion'],
  },
  about: {
    title: 'About Prospect',
    text: 'Prospect is an independent digital studio. We design and build websites, landing pages and custom systems with the same care at every step: understand the business, shape the idea, and deliver something that genuinely works.',
  },
  services: {
    title: 'Services',
    intro: 'Four disciplines, one method: understand the business before designing the first screen.',
    items: [
      { title: ['WEBSITES'], desc: 'Digital presence designed to communicate value, build credibility, and create opportunities.' },
      { title: ['LANDING', 'PAGES'], desc: 'Focused experiences designed to guide visitors toward a specific action.' },
      { title: ['SYSTEMS'], desc: 'Custom platforms, dashboards, and tools built around business needs.' },
      { title: ['DIGITAL', 'SOLUTIONS'], desc: 'Technology designed to solve real problems and create new possibilities.' },
    ],
  },
  work: {
    title: 'Work',
    live: 'Live',
    name: 'EVO Reformas',
    kind: 'Company website for an architecture, renovation and construction firm.',
    scope: 'Website design and development',
    visit: 'Visit the website',
    next: 'Your project could be next.',
    cta: 'Talk about a project',
    alt: ['EVO Reformas website home page', 'EVO Reformas services section', 'EVO Reformas project selection', 'EVO Reformas website on a phone', 'EVO Reformas signature in the website footer'],
  },
  process: {
    title: 'Process',
    steps: [
      { name: 'Discovery', desc: 'Understanding the business, its goals, audience, and challenges.', form: 'Fragments' },
      { name: 'Strategy', desc: 'Defining the direction, structure, design, and experience.', form: 'Geometry' },
      { name: 'Development', desc: 'Building, testing, refining, and implementing the solution.', form: 'Construction' },
      { name: 'Launch', desc: 'Delivering and preparing the project to grow.', form: 'Light' },
    ],
  },
  finale: {
    title: ["LET'S CREATE", "WHAT'S NEXT."],
    sub: 'Your next digital experience starts here.',
    cta: 'START A PROJECT',
  },
  footer: {
    tagline: 'Independent digital studio. Websites, landing pages, systems and digital solutions.',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    explore: 'Explore',
    top: 'Back to top',
    rights: 'All rights reserved.',
  },
  cursor: { drag: 'Drag', view: 'View', visit: 'Visit' },
  wa: "Hi Prospect! I'd like to start a project.",
  external: 'opens in a new tab',
}

const dicts = { pt, en }

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void; wa: string }>(null!)

function initialLang(): Lang {
  const saved = localStorage.getItem('prospect-lang')
  if (saved === 'pt' || saved === 'en') return saved
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const value = useMemo(() => {
    const t = dicts[lang]
    return {
      lang,
      t,
      setLang: (l: Lang) => {
        localStorage.setItem('prospect-lang', l)
        setLangState(l)
      },
      wa: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t.wa)}`,
    }
  }, [lang])
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    document.title = value.t.meta.title
  }, [lang, value])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
export { site }
