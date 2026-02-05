# NotePad Pro - Bloco de Notas Moderno com Autenticação

Um bloco de notas web moderno e responsivo com suporte a múltiplos temas, sincronização local e autenticação por Google.

## 🎯 Características

- ✨ **Interface moderna** - Design elegante com modo claro e escuro
- 💾 **Sincronização local** - Salva automaticamente as notas no localStorage
- 🎨 **4 Temas diferentes** - Dark, Light, Purple, Blue e Green
- 🔐 **Autenticação** - Login e registro com suporte a Google OAuth
- 🏷️ **Categorização** - Organize suas notas (Pessoal, Trabalho, Estudo)
- 📌 **Notas fixadas** - Mantenha suas notas importantes no topo
- 🎯 **Modo foco** - Interface simplificada para melhor concentração
- ⌨️ **Atalhos de teclado** - Ctrl+B (negrito), Ctrl+I (itálico), Ctrl+U (sublinhado)
- 📊 **Estatísticas** - Contador de caracteres, palavras e tempo de leitura
- 💾 **Exportação** - Exporte todas as notas em JSON para backup

## 🚀 Como Usar

### Instalação Local

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (`.env`):
```bash
# Copie o arquivo .env.example para .env
# Adicione suas chaves Stripe (opcional, apenas para modo premium)
```

4. Inicie o servidor:
```bash
npm start
# Ou para desenvolvimento com auto-reload:
npm run dev
```

5. Abra no navegador:
```
http://localhost:3000
```

### Uso

- **Nova Nota**: Clique em "Nova Nota" ou pressione o botão ✨
- **Editar**: Selecione uma nota da lista lateral para editar
- **Deletar**: Clique em "🗑️" para remover uma nota
- **Pesquisar**: Use a caixa de pesquisa para filtrar notas
- **Exportar**: Clique em "⬇️" para fazer backup das notas
- **Tema**: Mude o tema clicando nos ícones de tema no header

## 📁 Estrutura do Projeto

```
.
├── index.html          # Interface principal
├── app.js             # Lógica da aplicação frontend
├── server.js          # Servidor backend (Express)
├── style.css          # Estilos da aplicação
├── package.json       # Dependências do projeto
├── .env.example       # Exemplo de variáveis de ambiente
├── success.html       # Página de pagamento bem-sucedido
├── cancel.html        # Página de pagamento cancelado
└── docs/              # Documentação adicional
    ├── INDEX.md       # Índice geral
    ├── CONCLUSAO.md   # Conclusão do projeto
    └── TROUBLESHOOTING.md # Solução de problemas
```

## 🔧 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Node.js, Express.js
- **Armazenamento**: localStorage (local), Stripe (premium)
- **Autenticação**: Google OAuth2
- **Estilos**: CSS customizado com variáveis CSS

## 📝 Funcionalidades de Autenticação

### Login Local
- Crie uma conta com email e senha
- Opção "Lembrar-me" para conveniência
- Dados salvos localmente no navegador

### Login Google
- Autentica automaticamente via Google
- Sincroniza perfil do Google
- Suporte para múltiplas contas

## 💳 Integração com Stripe (Premium)

Para ativar pagamentos:
1. Configure as variáveis de ambiente com suas chaves Stripe
2. Descomente os endpoints no `server.js`
3. Configure os webhooks no dashboard do Stripe

## 🎨 Temas Disponíveis

- **Dark** - Tema padrão escuro (azul)
- **Light** - Versão clara para melhor legibilidade
- **Purple** - Roxo violeta escuro
- **Blue** - Azul moderno
- **Green** - Verde esmeralda

## 🔒 Segurança

- ✅ XSS Prevention - HTML escapado nas exibições
- ✅ Variáveis sensíveis em `.env`
- ⚠️ Chaves Stripe devem ser do modo teste ou substituídas

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop
- Tablets
- Smartphones

## 🐛 Troubleshooting

Veja [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para problemas comuns.

## 👨‍💻 Autor

Criado por **Esley Augusto**

## 📄 Licença

MIT License

## 🚀 Próximos Passos

- [ ] Sincronização em nuvem
- [ ] Compartilhamento de notas
- [ ] Busca avançada
- [ ] Histórico de versões
- [ ] Colaboração em tempo real
