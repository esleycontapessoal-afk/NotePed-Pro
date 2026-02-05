# 🚀 Quick Start - NotePad Pro

Comece em menos de 2 minutos!

## Pré-requisitos

- Node.js 14+ instalado
- npm ou yarn

## Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start
```

Acesse: **http://localhost:3000**

## Para Desenvolvimento

```bash
npm run dev
```
Usa `nodemon` para auto-reload

## 📝 Funcionalidades Básicas

### Login
- Email: qualquer email valido
- Senha: mínimo 6 caracteres
- Clique em "Login" no header

### Criar Nota
- Clique em "✨ Nova Nota"
- Preencha título e conteúdo
- Auto-salva a cada 1.5 segundos

### Atalhos de Teclado
- `Ctrl+B` - Negrito
- `Ctrl+I` - Itálico  
- `Ctrl+U` - Sublinhado
- `Ctrl+`` - Código

### Temas
- Clique no header para mudar de tema
- Tema salvo automaticamente

## 📂 Estrutura Essencial

```
.
├── index.html       ← Abra aqui
├── app.js           ← Lógica frontend
├── server.js        ← Backend
├── style.css        ← Estilos
├── .env             ← Configurações (não commitar!)
└── docs/            ← Documentação completa
```

## ⚙️ Configuração

Copie `.env.example` para `.env` se necessário:
```bash
cp .env.example .env
```

Atualize as variáveis com seus valores.

## 🆘 Problemas?

1. **"Port 3000 em uso"** → Mude PORT no `.env`
2. **"Module not found"** → Execute `npm install`
3. **Notas não salvam** → Verifique localStorage do navegador

Veja documentação completa em `docs/TROUBLESHOOTING.md`

## 📚 Documentação

- [INDEX.md](docs/INDEX.md) - Guia completo
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Solução de problemas
- [README.md](README.md) - Visão geral do projeto

## 💡 Próximas Ações

- [ ] Teste a aplicação
- [ ] Crie suas primeiras notas
- [ ] Configure Google OAuth se desejar
- [ ] Ative Stripe para modo premium (opcional)

---

**Pronto?** Abra `index.html` ou execute `npm start`! 🎉
