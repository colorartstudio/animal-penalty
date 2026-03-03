# Animal Penalty - MVP Mobile

Este projeto é um MVP de jogo de pênaltis mobile-first, desenvolvido com React + Vite.

## Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn

## Instalação

```bash
npm install
```

## Desenvolvimento Local

```bash
npm run dev
```

## Build para Produção

```bash
npm run build
```

## Deploy no Vercel

Este projeto está configurado para deploy fácil no Vercel.

1. Instale a CLI do Vercel (opcional) ou conecte seu repositório Git ao Vercel.
2. Configurações de Build (normalmente detectadas automaticamente):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

O arquivo `vercel.json` incluído garante que o roteamento SPA funcione corretamente (redirecionando todas as requisições para `index.html`).

## Estrutura de Pastas

- `src/`: Código fonte React
- `public/`: Assets estáticos (imagens, sons, vídeos)
- `dist/`: Arquivos gerados após o build

## Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas variáveis locais se necessário.
**Nunca commite o arquivo .env com chaves reais.**
