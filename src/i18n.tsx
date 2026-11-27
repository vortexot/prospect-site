import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import site from '../site.config.json'

export type Lang = 'pt' | 'en'

const pt = {
  meta: {
    title: 'Prospect — Estúdio digital independente | Sites, marketing e identidade visual',
    description: 'Não sabe por onde começar? A Prospect ajuda a tirar sua empresa do papel: identidade visual, site, marketing e anúncios.',
    skip: 'Pular para o conteúdo',
  },
  nav: { work: 'Trabalho', services: 'Serviços', about: 'Sobre', contact: 'Contato', menu: 'Menu', close: 'Fechar', home: 'Prospect, voltar ao início', lang: 'Idioma', main: 'Principal' },
  loader: { loading: 'Carregando o universo Prospect' },
  wa: { opens: 'abre o WhatsApp em nova aba', message: 'Olá, Prospect! Quero iniciar um projeto.' },
  pending: { tag: 'PENDENTE', email: 'E-mail de contato', social: 'Redes sociais', team: 'Equipe: nomes e funções', timeline: 'Prazos típicos', price: 'Faixa de preço', deliverables: 'Entregáveis deste serviço' },
  hero: {
    label: 'ESTÚDIO DIGITAL INDEPENDENTE — 2026',
    title: ['Não sabe', 'por onde', 'começar?', 'A gente ajuda.'],
    sub: 'Ajudamos quem quer tirar a empresa do papel: criação, identidade visual, site, marketing e anúncios.',
    explore: 'VER TRABALHOS',
    start: 'INICIAR UM PROJETO',
    hint: 'Arraste para girar a estrutura',
    scroll: 'Role para entrar',
  },
  showcase: {
    title: 'Oito mundos digitais',
    intro: 'Oito negócios, oito linguagens visuais. Cada tela é um conceito de site desenhado pela Prospect para mostrar o que podemos construir.',
    note: 'Conceitos demonstrativos com marcas fictícias. Não são clientes.',
    concept: 'Conceito demonstrativo',
    skip: 'Pular a vitrine',
    prev: 'Conceito anterior',
    next: 'Próximo conceito',
    niches: ['Construção', 'Imobiliária', 'Barbearia', 'Restaurante', 'Estética', 'Fitness', 'Automotivo', 'Moda'],
  },
  about: {
    title: 'Sobre a Prospect',
    text: 'A Prospect é um estúdio digital independente. Ajudamos quem quer construir uma empresa e não sabe por onde começar, da criação à identidade visual. Também criamos sites, landing pages e sistemas, fazemos marketing e rodamos anúncios. Em cada etapa o cuidado é o mesmo: entender o negócio, dar forma à ideia e entregar algo que funciona de verdade.',
    team: 'Equipe',
  },
  services: {
    title: 'Serviços',
    intro: 'Do site aos anúncios, um mesmo método: entender o negócio antes de desenhar a primeira tela.',
    deliverables: 'Entregáveis',
    items: [
      { title: ['SITES'], desc: 'Presença digital pensada para comunicar valor, construir credibilidade e gerar oportunidades.', deliverables: ['Design do site', 'Desenvolvimento do site'] },
      { title: ['LANDING', 'PAGES'], desc: 'Experiências focadas, desenhadas para conduzir o visitante a uma ação específica.', deliverables: ['Design da landing page', 'Desenvolvimento da landing page'] },
      { title: ['SISTEMAS'], desc: 'Plataformas, painéis e ferramentas sob medida, construídos em torno das necessidades do negócio.', deliverables: ['Plataformas', 'Painéis', 'Ferramentas sob medida'] },
      { title: ['IDENTIDADE', 'VISUAL'], desc: 'A identidade visual da empresa inteira, aplicada ao site, ao Instagram, ao TikTok e a onde mais a marca aparecer.', deliverables: ['Identidade da empresa', 'Identidade do site', 'Identidade para redes sociais'] },
      { title: ['MARKETING'], desc: 'Marketing no Instagram, no TikTok ou em qualquer outro canal em que o seu negócio queira aparecer, com a mesma identidade em todos eles.', deliverables: ['Instagram', 'TikTok', 'Outros canais'] },
      { title: ['ANÚNCIOS'], desc: 'Rodamos anúncios para promover a sua empresa, com a mesma identidade visual do site e das redes.', deliverables: ['Anúncios', 'Promoção da marca'] },
      { title: ['SOLUÇÕES', 'DIGITAIS'], desc: 'Tecnologia pensada para resolver problemas reais e criar novas possibilidades.', deliverables: [] as string[] },
    ],
  },
  process: {
    title: 'Processo',
    steps: [
      { name: 'Descoberta', desc: 'Entender o negócio, seus objetivos, público e desafios.' },
      { name: 'Estratégia', desc: 'Definir a direção, a estrutura, o design e a experiência.' },
      { name: 'Desenvolvimento', desc: 'Construir, testar, refinar e implementar a solução.' },
      { name: 'Lançamento', desc: 'Entregar e preparar o projeto para crescer.' },
    ],
  },
  faq: {
    title: 'Perguntas frequentes',
    items: [
      { q: 'O que a Prospect faz?', a: 'Criamos sites, landing pages e sistemas sob medida, cuidamos da identidade visual de empresas, fazemos marketing no Instagram, no TikTok e em outros canais e rodamos anúncios.' },
      { q: 'Quero abrir um negócio e não sei por onde começar. Vocês ajudam?', a: 'Sim. A gente ajuda desde o começo, tanto na criação quanto na identidade visual. Conte a sua ideia pelo WhatsApp.' },
      { q: 'Como funciona um projeto?', a: 'Em quatro passos: Descoberta, Estratégia, Desenvolvimento e Lançamento. Começamos entendendo o negócio e terminamos com a entrega do projeto, preparado para crescer.' },
      { q: 'Os sites da vitrine são de clientes reais?', a: 'Não. São oito conceitos demonstrativos com marcas fictícias, criados para mostrar o que podemos construir.' },
      { q: 'O atendimento também é em inglês?', a: 'Sim. Atendemos em português e em inglês.' },
      { q: 'Como começo um projeto?', a: 'Envie uma mensagem pelo WhatsApp contando sobre o seu negócio e o que você precisa.' },
    ],
    timeline: 'Qual é o prazo típico?',
    price: 'Quanto custa um projeto?',
  },
  finale: {
    title: ['Vamos criar algo', 'extraordinário.'],
    sub: 'Sua próxima experiência digital começa aqui.',
    cta: 'INICIAR UM PROJETO',
  },
  footer: {
    tagline: 'Estúdio digital independente. Sites, sistemas, identidade visual, marketing e anúncios.',
    contact: 'Contato',
    explore: 'Navegar',
    top: 'Voltar ao topo',
    rights: 'Todos os direitos reservados.',
    privacy: 'Privacidade',
  },
  cursor: { drag: 'Arraste', view: 'Ver', visit: 'Visitar' },
  external: 'abre em nova aba',
}

type Dict = typeof pt

const en: Dict = {
  meta: {
    title: 'Prospect — Independent digital studio | Websites, marketing and visual identity',
    description: "Don't know where to start? Prospect helps get your business off the ground: visual identity, website, marketing and ads.",
    skip: 'Skip to content',
  },
  nav: { work: 'Work', services: 'Services', about: 'About', contact: 'Contact', menu: 'Menu', close: 'Close', home: 'Prospect, back to top', lang: 'Language', main: 'Main' },
  loader: { loading: 'Loading the Prospect universe' },
  wa: { opens: 'opens WhatsApp in a new tab', message: "Hi Prospect! I'd like to start a project." },
  pending: { tag: 'PENDING', email: 'Contact email', social: 'Social profiles', team: 'Team: names and roles', timeline: 'Typical timelines', price: 'Price range', deliverables: 'Deliverables for this service' },
  hero: {
    label: 'INDEPENDENT DIGITAL STUDIO — 2026',
    title: ["Don't know", 'where to', 'start?', 'We can help.'],
    sub: 'We help people get their business off the ground: creation, visual identity, website, marketing and ads.',
    explore: 'SEE OUR WORK',
    start: 'START A PROJECT',
    hint: 'Drag to turn the structure',
    scroll: 'Scroll to enter',
  },
  showcase: {
    title: 'Eight digital worlds',
    intro: 'Eight businesses, eight visual languages. Each screen is a website concept designed by Prospect to show what we can build.',
    note: 'Demonstration concepts with fictional brands. Not clients.',
    concept: 'Demo concept',
    skip: 'Skip the showcase',
    prev: 'Previous concept',
    next: 'Next concept',
    niches: ['Construction', 'Real estate', 'Barbershop', 'Restaurant', 'Aesthetics', 'Fitness', 'Automotive', 'Fashion'],
  },
  about: {
    title: 'About Prospect',
    text: "Prospect is an independent digital studio. We help people who want to build a company and don't know where to start, from creation to visual identity. We also build websites, landing pages and systems, do marketing and run ads. Every step gets the same care: understand the business, shape the idea, and deliver something that genuinely works.",
    team: 'Team',
  },
  services: {
    title: 'Services',
    intro: 'From websites to ads, one method: understand the business before designing the first screen.',
    deliverables: 'Deliverables',
    items: [
      { title: ['WEBSITES'], desc: 'Digital presence designed to communicate value, build credibility, and create opportunities.', deliverables: ['Website design', 'Website development'] },
      { title: ['LANDING', 'PAGES'], desc: 'Focused experiences designed to guide visitors toward a specific action.', deliverables: ['Landing page design', 'Landing page development'] },
      { title: ['SYSTEMS'], desc: 'Custom platforms, dashboards, and tools built around business needs.', deliverables: ['Platforms', 'Dashboards', 'Custom tools'] },
      { title: ['VISUAL', 'IDENTITY'], desc: 'The visual identity of the whole company, applied to the website, Instagram, TikTok and wherever else the brand shows up.', deliverables: ['Company identity', 'Website identity', 'Social media identity'] },
      { title: ['MARKETING'], desc: 'Marketing on Instagram, TikTok or any other channel where your business wants to show up, with one identity across all of them.', deliverables: ['Instagram', 'TikTok', 'Other channels'] },
      { title: ['ADS'], desc: 'We run ads to promote your company, with the same visual identity as your website and social channels.', deliverables: ['Ads', 'Brand promotion'] },
      { title: ['DIGITAL', 'SOLUTIONS'], desc: 'Technology designed to solve real problems and create new possibilities.', deliverables: [] },
    ],
  },
  process: {
    title: 'Process',
    steps: [
      { name: 'Discovery', desc: 'Understanding the business, its goals, audience, and challenges.' },
      { name: 'Strategy', desc: 'Defining the direction, structure, design, and experience.' },
      { name: 'Development', desc: 'Building, testing, refining, and implementing the solution.' },
      { name: 'Launch', desc: 'Delivering and preparing the project to grow.' },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      { q: 'What does Prospect do?', a: 'We build websites, landing pages and custom systems, take care of company visual identity, do marketing on Instagram, TikTok and other channels, and run ads.' },
      { q: "I want to start a business and don't know where to begin. Can you help?", a: 'Yes. We help from the very beginning, with both creation and visual identity. Tell us your idea on WhatsApp.' },
      { q: 'How does a project work?', a: 'In four steps: Discovery, Strategy, Development and Launch. We start by understanding the business and finish by delivering a project that is ready to grow.' },
      { q: 'Are the showcase websites real clients?', a: 'No. They are eight demonstration concepts with fictional brands, made to show what we can build.' },
      { q: 'Do you work in English?', a: 'Yes. We work in Portuguese and English.' },
      { q: 'How do I start a project?', a: 'Send a message on WhatsApp telling us about your business and what you need.' },
    ],
    timeline: 'What is the typical timeline?',
    price: 'How much does a project cost?',
  },
  finale: {
    title: ["LET'S CREATE", "WHAT'S NEXT."],
    sub: 'Your next digital experience starts here.',
    cta: 'START A PROJECT',
  },
  footer: {
    tagline: 'Independent digital studio. Websites, systems, visual identity, marketing and ads.',
    contact: 'Contact',
    explore: 'Explore',
    top: 'Back to top',
    rights: 'All rights reserved.',
    privacy: 'Privacy',
  },
  cursor: { drag: 'Drag', view: 'View', visit: 'Visit' },
  external: 'opens in a new tab',
}

const dicts = { pt, en }

export const waUrl = (message: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>(null!)

/** The address decides the language: / is Portuguese, /en is English. */
const langFromPath = (): Lang => (/^\/en(\/|$)/.test(location.pathname) ? 'en' : 'pt')

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(langFromPath)

  useEffect(() => {
    const sync = () => setLangState(langFromPath())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const value = useMemo(
    () => ({
      lang,
      t: dicts[lang],
      setLang: (l: Lang) => {
        if (l === langFromPath()) return
        history.pushState(null, '', (l === 'en' ? '/en' : '/') + location.search + location.hash)
        setLangState(l)
      },
    }),
    [lang],
  )

  useEffect(() => {
    const { meta } = value.t
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    document.title = meta.title
    const set = (selector: string, attr: string, v: string) => document.querySelector(selector)?.setAttribute(attr, v)
    set('meta[name="description"]', 'content', meta.description)
    set('meta[property="og:description"]', 'content', meta.description)
    set('meta[name="twitter:description"]', 'content', meta.description)
    set('meta[property="og:locale"]', 'content', lang === 'pt' ? 'pt_BR' : 'en_US')
    if (site.siteUrl) {
      const url = site.siteUrl + (lang === 'en' ? '/en' : '/')
      set('link[rel="canonical"]', 'href', url)
      set('meta[property="og:url"]', 'content', url)
    }
  }, [lang, value])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
export { site }
