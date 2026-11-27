# Auditoria UX/UI de 27/11/2026: o que mudou

Branch `fix/auditoria-ux-ui`, em revisão por pull request. O site no ar só muda quando
ela entrar na branch principal.
A lista “O que está bom (manter)” não veio junto com o pedido; o que a auditoria não
citou foi preservado.

## Por item

| # | Situação | Mudança |
| --- | --- | --- |
| 1 | Feito | “Contato” cai na seção final com título e botão visíveis desde o primeiro quadro. Nada ali fica escondido durante a animação. |
| 2 | Feito | “Iniciar um projeto” é o botão primário; “Ver trabalhos” é o secundário e leva à seção Trabalho. |
| 3 | **Retirado a seu pedido** | Sem botão de WhatsApp no cabeçalho, entre as seções ou nos serviços. O contato fica em “Iniciar um projeto” (topo e final da página), no rodapé e no menu do celular. O aceite “botão visível em qualquer ponto da rolagem” deixa de valer. |
| 4 | Parcial | Caso EVO **removido a seu pedido**. A vitrine virou a seção Trabalho, logo após o topo, marcada como conceitos demonstrativos. Perguntas frequentes só com informação do site e a que você deu. Equipe, e-mail, redes, prazo e preço ficam ocultos até haver dado real. Nenhum depoimento. |
| 5 | Feito | `#contact`, `#trabalho` e demais âncoras funcionam ao colar em aba nova; o menu atualiza o endereço. |
| 6 | Feito | Botões transparentes da vitrine rolam até ficar visíveis ao receber foco; sem `visibility: hidden` em botões; anel de foco de 2 px; botão final alcançável por Tab. |
| 7 | **Não atendido, por sua decisão** | Cenas presas restauradas: vitrine 6,3 + processo 3,4 + final 2,1 = **11,8 telas** (antes 15,4; a meta era 7). No processo aparece um passo por vez, com os 4 nomes sempre legíveis; com “reduzir movimento” os 4 aparecem em lista. O voo pelas telas do caso saiu junto com a EVO. |
| 8 | Feito | Menu na ordem da página (Trabalho, Sobre, Serviços, Contato); sem botão “Menu” no desktop. |
| 9 | **Revertido a seu pedido** | A abertura toca em toda visita, como antes, e a página já cai na seção certa em links diretos. O botão “Pular intro” continua retirado. |
| 10 | Alterado por você | A frase “Falar no WhatsApp” saiu do site. Os botões dizem “Iniciar um projeto”, com o ícone do WhatsApp; rodapé e menu mostram “WhatsApp” e o número. |
| 11 | Feito abaixo de 900 px | Oito composições próprias para celular, sem texto menor que 12 px. Acima de 900 px os mockups continuam sendo telas inteiras reduzidas, com texto interno menor. |
| 12 | Feito, a confirmar | Sete serviços: entraram **Identidade visual, Marketing e Anúncios**. Cada um com uma foto real do Unsplash, em preto e branco e sem texto sobreposto (fontes no `README.md`). **Sem botão por serviço, a seu pedido.** “Soluções digitais” está sem entregáveis. Revise os textos novos: foram escritos a partir da sua descrição. |
| 13 | Feito | A barra usa só os nomes dos passos; passos futuros com contraste acima de 4,5:1. |
| 14 | Feito | Cursor nativo sempre visível; o anel é complemento. |
| 15 | Parcial | Imagens abaixo da dobra sob demanda; fontes só em WOFF2 latino, sem o peso não usado; cache longo para `/assets`; evento `whatsapp_click` no `window.dataLayer`. Nenhum script de terceiros: **qual ferramenta de medição você quer?** |
| 16 | Feito | Textos de 12 px ou mais, alvos de 44 px ou mais, aviso dos conceitos com contraste suficiente. |
| 17 | Feito | Escultura escurecida atrás do título em telas abaixo de 380 px. |
| 18 | Feito | `/en` com vitrine, mockups e meta description em inglês. O endereço define o idioma; a troca automática pelo idioma do navegador deixou de existir. |
| 19 | Feito, conferir após publicar | `favicon.ico`, `/privacidade`, `url` no JSON-LD (redes entram quando preenchidas) e cabeçalhos de segurança em `vercel.json`. A página 404 já existia. |

## Pedidos depois da auditoria

- Título do topo: “Não sabe por onde começar? A gente ajuda.”, com a mesma mensagem no
  “Sobre”, nas perguntas frequentes, na descrição para o Google e em inglês.
- Foto de “Landing pages” e de “Soluções digitais” trocadas; a última linha de serviços
  passou a usar a imagem larga.

## Lighthouse

Medido antes dos serviços novos, das fotos, do título novo e da volta da abertura em
toda visita. Vale repetir antes de publicar.

Build original contra build novo, no mesmo computador, mediana de 4 medições de cada.

| Medida | Celular antes | Celular depois | Desktop antes | Desktop depois |
| --- | --- | --- | --- | --- |
| Desempenho | 46 | 60 | 61 | 66 |
| Acessibilidade | 96 | 100 | 96 | 100 |
| Primeira pintura | 0,9 s | 1,9 s | 0,35 s | 0,35 s |
| Maior conteúdo (LCP) | 4,9 s | 2,7 s | 1,2 s | 1,3 s |
| Bloqueio total (TBT) | 2,9 s | 3,7 s | 1,0 s | 0,7 s |

- A primeira pintura no celular piorou por causa da pré-carga da fonte. Sem ela, em 3
  medições, a nota caiu para 50 e o LCP subiu para 3,9 s, então ela ficou.
- O bloqueio total varia muito entre medições (1,4 s a 7,5 s) e vem sobretudo da cena 3D.
- Site no ar, antes (uma medição): celular 53 e 96; desktop 64 e 96.

## Testes

- `npm run build` e `npm run lint` (oxlint, adicionado) sem erros.
- Automatizados no Chrome em 320, 375, 768, 1366 e 1440 px: abertura, clique em Contato,
  links diretos, cenas presas, “reduzir movimento”, ordem do Tab, texto mínimo e alvos
  de toque. Nem toda checagem foi repetida em todas as larguras depois do último ajuste.

## Arquivos

- **Novos:** `.oxlintrc.json`, `vercel.json`, `privacidade.html`, `AUDITORIA.md`,
  `public/favicon.ico`, `public/services/*.webp` (14 fotos), `src/content.ts`,
  `src/core/track.ts`, `src/components/{Pending,Roll,WhatsApp}.tsx`,
  `src/sections/Faq.tsx`, `src/showcase/{MobileWorlds.tsx,fonts.css}`,
  `src/styles/{fonts,privacy}.css`
- **Alterados:** `404.html`, `README.md`, `index.html`, `package.json`,
  `package-lock.json`, `site.config.json`, `vite.config.ts`, `src/App.tsx`,
  `src/i18n.tsx`, `src/main.tsx`, `src/notfound.ts`,
  `src/components/{Cursor,Nav,Preloader}.tsx`,
  `src/core/{sceneState,scroll}.ts`,
  `src/sections/{About,Finale,Hero,Process,Services,Showcase}.tsx`,
  `src/showcase/{Worlds.tsx,worlds.css}`, `src/styles/{base,sections}.css`,
  `src/webgl/Universe.ts`
- **Removidos:** `src/sections/Work.tsx`, `public/work/` (5 imagens),
  `public/services/{websites.webp,systems.svg}`

## Pendências

- Confirmar os textos de Identidade visual, Marketing e Anúncios, e o que mais entra
  em cada um (entregáveis, canais, plataformas de anúncio).
- Enviar dados reais: e-mail, redes, equipe, prazos, faixa de preço, entregáveis de
  “Soluções digitais” e um novo caso. Campos em `site.config.json` (ver `README.md`);
  `?pendencias` no endereço mostra onde entram.
- “Trabalho” e “Ver trabalhos” agora levam a conceitos: renomear, se preferir.
- Domínio próprio (decisão sua) e revisão jurídica da página de privacidade.
- Ferramenta de medição; ao instalar, ajustar a política de segurança em `vercel.json`.
- Depois de publicar: conferir cabeçalhos, cache, `/en` e `/privacidade`. A barra de
  ferramentas das prévias da Vercel pode ser bloqueada pela política de segurança.
- Teste manual: Safari/iOS, leitor de tela real, envio de mensagem pelo WhatsApp e
  “reduzir movimento” em um aparelho.
