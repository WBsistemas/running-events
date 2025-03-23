# Running Events

Este projeto é uma aplicação web para gerenciamento e visualização de eventos de corrida, construído com React, TypeScript, Vite e Shadcn UI.

## Padrões de Código

Este projeto segue o padrão [Standard.js](https://standardjs.com/) para JavaScript/TypeScript, que estabelece regras consistentes de formatação de código sem configuração adicional necessária. Algumas características principais do Standard.js incluem:

- Uso de aspas simples em vez de duplas
- Sem ponto e vírgula
- Indentação de 2 espaços
- Espaços após palavras-chave (if, for, etc.)
- Sem espaços antes de parênteses em declarações de função

## Estrutura do Projeto

```
running-events/
├── public/              # Arquivos estáticos
├── scripts/             # Scripts utilitários
│   └── convert-to-standard.js # Script para conversão de código para Standard.js
├── src/                 # Código fonte
│   ├── components/      # Componentes React
│   │   ├── events/      # Componentes relacionados a eventos
│   │   ├── layout/      # Componentes de layout
│   │   ├── map/         # Componentes relacionados ao mapa
│   │   ├── search/      # Componentes de busca
│   │   └── ui/          # Componentes UI do Shadcn
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Bibliotecas e utilitários
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços da aplicação
│   ├── styles/          # Estilos globais e variáveis
│   │   └── variables.styl # Variáveis Stylus
│   └── types/           # Definições de tipos TypeScript
```

## Componentes UI

Este projeto utiliza [Shadcn UI](https://ui.shadcn.com/), uma coleção de componentes React reutilizáveis e acessíveis construídos com [Radix UI](https://www.radix-ui.com/) e [Tailwind CSS](https://tailwindcss.com/).

A pasta `src/components/ui` contém todos os componentes do Shadcn UI, que podem ser personalizados diretamente no código-fonte. Ao contrário de bibliotecas tradicionais, o Shadcn UI não é instalado como um pacote npm, mas sim copiado para o projeto, permitindo total controle e personalização.

## Stylus

Este projeto utiliza [Stylus](https://stylus-lang.com/) para variáveis globais de estilo. As variáveis globais estão definidas em `src/styles/variables.styl`.

Enquanto os componentes UI utilizam principalmente Tailwind CSS para estilização, o Stylus é usado para definir variáveis globais que podem ser acessadas pela configuração do Vite.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run build-no-errors` - Compila o projeto ignorando erros de TypeScript
- `npm run lint` - Executa o linter para verificar problemas de código
- `npm run lint:fix` - Corrige automaticamente problemas de linting
- `npm run format` - Formata os arquivos usando Prettier
- `npm run preview` - Visualiza a versão de produção localmente
- `npm run types:supabase` - Gera tipos TypeScript do Supabase
- `npm run convert-to-standard` - Converte os arquivos do projeto para seguir o padrão Standard.js

## Implementação de Standard.js

Para implementar o Standard.js neste projeto, foram realizadas as seguintes etapas:

1. Configuração do ESLint com regras do Standard.js
2. Criação de configurações do editor (.editorconfig) para manter a consistência
3. Desenvolvimento de um script de conversão para transformar arquivos existentes
4. Ajuste da formatação em todos os arquivos do projeto

## Tecnologias Principais

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI / Radix UI
- Stylus (para variáveis globais)
- ESLint com Standard.js
- MapLibre GL para visualização de mapas
- Supabase para backend

## Próximos Passos

- Correção gradual dos avisos de lint pendentes
- Adição de testes automatizados
- Documentação detalhada dos componentes

## Como Contribuir

1. Siga as convenções de código do Standard.js
2. Execute `npm run lint` antes de enviar alterações
3. Para componentes personalizados, crie-os na pasta apropriada seguindo a estrutura do projeto
4. Utilize as variáveis globais de estilo para manter a consistência visual
5. Ao trabalhar com componentes UI, modifique diretamente os arquivos em `src/components/ui` conforme necessário

