// Configuração básica da aplicação
let stripe = null;
let stripeInitialized = false;

// Configuração e variáveis globais
class BlcoDeNotas {
    constructor() {
        this.notas = [];
        this.notaSelecionada = null;
        this.tempoSalvamento = null;
        this.modoFoco = false;
        this.usuarioLogado = null;
        this.planoAtivo = 'free'; // Adicinado: variável de plano padrão
        
        this.init();
    }

    init() {
        this.carregarNotas();
        this.carregarTema();
        this.setupEventListeners();
        this.setupSuggestions();
        this.renderizarNotas();
        this.atualizarEstatisticas();
    }

    // Setup de event listeners
    setupEventListeners() {
        // Botão nova anotação
        document.getElementById('btnNovaAnotacao').addEventListener('click', () => this.criarNovaNota());

        // Botão exportar
        document.getElementById('btnExportar').addEventListener('click', () => this.exportarNotas());

        // Entrada de pesquisa
        document.getElementById('btnLogin').addEventListener('click', () => this.abrirModalLogin());

        // Entrada de pesquisa
        document.getElementById('searchInput').addEventListener('input', (e) => this.filtrarNotas(e.target.value));

        // Título e conteúdo
        document.getElementById('tituloPasta').addEventListener('input', () => this.agendarSalvamento());
        document.getElementById('categoriaPasta').addEventListener('change', () => this.agendarSalvamento());
        document.getElementById('conteudoPasta').addEventListener('input', () => {
            this.agendarSalvamento();
            this.atualizarContador();
        });

        // Botões de formatação
        document.getElementById('btnNegrito').addEventListener('click', () => this.aplicarFormatacao('**', '**'));
        document.getElementById('btnItalico').addEventListener('click', () => this.aplicarFormatacao('*', '*'));
        document.getElementById('btnSublinhado').addEventListener('click', () => this.aplicarFormatacao('__', '__'));
        document.getElementById('btnLista').addEventListener('click', () => this.inserirLista(false));
        document.getElementById('btnListaNum').addEventListener('click', () => this.inserirLista(true));
        document.getElementById('btnCodigo').addEventListener('click', () => this.aplicarFormatacao('`', '`'));

        // Atalhos de teclado
        document.getElementById('conteudoPasta').addEventListener('keydown', (e) => this.atalhosTeclado(e));

        // Botão fixar
        document.getElementById('btnFixar').addEventListener('click', () => this.toggleFixarNota());

        // Botão foco
        document.getElementById('btnFoco').addEventListener('click', () => this.toggleModoFoco());

        // Botão deletar
        document.getElementById('btnDeletar').addEventListener('click', () => this.confirmarDelecao());

        // Modal confirmação
        document.getElementById('confirmOverlay').addEventListener('click', () => this.fecharConfirmacao());
        document.getElementById('btnCancelDelete').addEventListener('click', () => this.fecharConfirmacao());
        document.getElementById('btnConfirmDelete').addEventListener('click', () => this.deletarNotaConfirmado());

        // Modal Login
        document.getElementById('btnCloseModal').addEventListener('click', () => this.fecharModalLogin());
        document.getElementById('modalOverlay').addEventListener('click', () => this.fecharModalLogin());
        document.getElementById('loginForm').addEventListener('submit', (e) => this.fazerLogin(e));
        document.getElementById('signupLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.fecharModalLogin();
            this.abrirModalSignup();
        });

        // Modal Signup
        document.getElementById('btnCloseSignup').addEventListener('click', () => this.fecharModalSignup());
        document.getElementById('modalOverlay2').addEventListener('click', () => this.fecharModalSignup());
        document.getElementById('signupForm').addEventListener('submit', (e) => this.fazerRegistro(e));
        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.fecharModalSignup();
            this.abrirModalLogin();
        });

        // Temas
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => this.mudarTema(btn.dataset.theme));
        });

        // Verificar login ao carregar
        this.verificarLogin();
    }

    // Carregar notas do localStorage
    carregarNotas() {
        const notasSalvas = localStorage.getItem('notas');
        this.notas = notasSalvas ? JSON.parse(notasSalvas) : [];
        this.usuarioLogado = localStorage.getItem('usuarioLogado');
    }

    // Salvar notas no localStorage
    salvarNotas() {
        localStorage.setItem('notas', JSON.stringify(this.notas));
        this.atualizarEstatisticas();
    }

    // Criar nova nota
    criarNovaNota() {
        const novaAnotacao = {
            id: Date.now(),
            titulo: 'Nova anotação',
            conteudo: '',
            categoria: 'pessoal',
            fixada: false,
            data: new Date().toLocaleString('pt-BR')
        };

        this.notas.unshift(novaAnotacao);
        this.salvarNotas();
        this.selecionarNota(novaAnotacao.id);
        this.renderizarNotas();
        this.atualizarEstatisticas();

        // Focar no título
        setTimeout(() => {
            document.getElementById('tituloPasta').focus();
            document.getElementById('tituloPasta').select();
        }, 100);
    }

    // Selecionar uma nota
    selecionarNota(id) {
        this.notaSelecionada = this.notas.find(n => n.id === id);

        if (this.notaSelecionada) {
            // Mostrar editor
            document.getElementById('editorVazio').style.display = 'none';
            document.getElementById('editorConteudo').style.display = 'flex';

            // Preencher dados
            document.getElementById('tituloPasta').value = this.notaSelecionada.titulo;
            document.getElementById('conteudoPasta').value = this.notaSelecionada.conteudo;
            document.getElementById('categoriaPasta').value = this.notaSelecionada.categoria || 'pessoal';
            this.atualizarContador();
            this.atualizarDataModificacao();
            this.atualizarBotaoFixar();

            // Atualizar ativo na lista
            document.querySelectorAll('.nota-item').forEach(item => {
                item.classList.remove('ativo');
            });
            document.querySelector(`[data-id="${id}"]`)?.classList.add('ativo');
        }
    }

    // Salvar nota atual
    salvarNota() {
        if (this.notaSelecionada) {
            this.notaSelecionada.titulo = document.getElementById('tituloPasta').value || 'Sem título';
            this.notaSelecionada.conteudo = document.getElementById('conteudoPasta').value;
            this.notaSelecionada.categoria = document.getElementById('categoriaPasta').value;
            this.notaSelecionada.data = new Date().toLocaleString('pt-BR');
            this.salvarNotas();
            this.renderizarNotas();
            this.atualizarDataModificacao();
        }
    }

    // Agendar salvamento automático
    agendarSalvamento() {
        clearTimeout(this.tempoSalvamento);
        const indicador = document.getElementById('autoSaveIndicator');
        
        if (indicador) {
            indicador.textContent = 'Salvando...';
            indicador.classList.add('salvando');
        }

        this.tempoSalvamento = setTimeout(() => {
            this.salvarNota();
            if (indicador) {
                indicador.textContent = 'Salvo';
                indicador.classList.remove('salvando');
            }
        }, 1500);
    }

    // Deletar nota
    deletarNota() {
        if (this.notaSelecionada && confirm('Tem certeza que deseja deletar esta nota?')) {
            this.notas = this.notas.filter(n => n.id !== this.notaSelecionada.id);
            this.salvarNotas();
            this.notaSelecionada = null;
            document.getElementById('editorVazio').style.display = 'flex';
            document.getElementById('editorConteudo').style.display = 'none';
            this.renderizarNotas();
            this.atualizarEstatisticas();
        }
    }

    // Atualizar contador de caracteres
    atualizarContador() {
        const texto = document.getElementById('conteudoPasta').value;
        const caracteres = texto.length;
        const palavras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
        const tempoLeitura = Math.ceil(palavras / 200); // 200 palavras por minuto

        document.getElementById('contador').textContent = `${caracteres} caracteres`;
        document.getElementById('contadorPalavras').textContent = `${palavras} palavras`;
        document.getElementById('tempoLeitura').textContent = `${tempoLeitura} min de leitura`;
    }

    // Atualizar data de modificação
    atualizarDataModificacao() {
        if (this.notaSelecionada) {
            const info = document.getElementById('editorInfo');
            info.textContent = `Modificado em ${this.notaSelecionada.data}`;
        }
    }

    // Filtrar notas
    filtrarNotas(termo) {
        const termoBusca = termo.toLowerCase();
        const notasFiltradas = this.notas.filter(nota =>
            nota.titulo.toLowerCase().includes(termoBusca) ||
            nota.conteudo.toLowerCase().includes(termoBusca)
        );

        this.renderizarNotas(notasFiltradas);
    }

    // Renderizar lista de notas
    renderizarNotas(notas = this.notas) {
        const listContainer = document.getElementById('notasList');
        
        // Ordenar: fixadas primeiro
        const notasOrdenadas = [...notas].sort((a, b) => {
            if (a.fixada === b.fixada) return 0;
            return a.fixada ? -1 : 1;
        });

        if (notasOrdenadas.length === 0) {
            listContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Nenhuma nota encontrada</div>';
            return;
        }

        const cores = {
            pessoal: '#ec4899',
            trabalho: '#3b82f6',
            estudo: '#10b981'
        };

        listContainer.innerHTML = notasOrdenadas.map(nota => `
            <div class="nota-item ${this.notaSelecionada?.id === nota.id ? 'ativo' : ''}" data-id="${nota.id}">
                <div class="nota-header">
                    <div class="nota-titulo">${nota.fixada ? '📌 ' : ''}${this.escaparHtml(nota.titulo)}</div>
                    <div class="nota-categoria" style="background-color: ${cores[nota.categoria] || cores.pessoal}; opacity: 0.7;">${nota.categoria}</div>
                </div>
                <div class="nota-preview">${this.escaparHtml(nota.conteudo.substring(0, 60))}</div>
                <div class="nota-data">${nota.data}</div>
            </div>
        `).join('');

        // Adicionar event listeners
        document.querySelectorAll('.nota-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.getAttribute('data-id'));
                this.selecionarNota(id);
            });
        });
    }

    // Escapar HTML para segurança
    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    // Atualizar estatísticas do header
    atualizarEstatisticas() {
        const totalNotas = this.notas.length;
        const totalCaracteres = this.notas.reduce((sum, nota) => sum + nota.conteudo.length, 0);

        document.getElementById('totalNotas').textContent = totalNotas;
        document.getElementById('totalCaracteres').textContent = totalCaracteres.toLocaleString('pt-BR');
    }

    // Exportar notas como JSON
    exportarNotas() {
        if (this.notas.length === 0) {
            alert('Nenhuma nota para exportar!');
            return;
        }

        const dataStr = JSON.stringify(this.notas, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notas_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // === FUNÇÕES DE LOGIN ===

    // Abrir modal de login
    abrirModalLogin() {
        document.getElementById('loginModal').classList.add('ativo');
        document.getElementById('email').focus();
    }

    // Fechar modal de login
    fecharModalLogin() {
        document.getElementById('loginModal').classList.remove('ativo');
        document.getElementById('loginForm').reset();
    }

    // Fazer login
    fazerLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validações melhoradas
        if (!email || !password) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        // Validação de email simples
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um email válido!');
            return;
        }

        if (password.length < 3) {
            alert('A senha deve ter pelo menos 3 caracteres!');
            return;
        }

        try {
            // Simular login (em produção seria com backend)
            const usuario = {
                email: email,
                nome: email.split('@')[0]
            };

            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            if (rememberMe) {
                localStorage.setItem('rememberEmail', email);
            }

            this.usuarioLogado = usuario;
            this.atualizarBotaoLogin();
            this.fecharModalLogin();
            alert(`Bem-vindo, ${usuario.nome}! 🎉`);
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        }
    }

    // Abrir modal de registro
    abrirModalSignup() {
        document.getElementById('signupModal').classList.add('ativo');
        document.getElementById('signupName').focus();
    }

    // Fechar modal de registro
    fecharModalSignup() {
        document.getElementById('signupModal').classList.remove('ativo');
        document.getElementById('signupForm').reset();
    }

    // Fazer registro
    fazerRegistro(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';

        // Validações melhoradas
        if (!name || !email || !password) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        // Validação de nome
        if (name.length < 3) {
            alert('O nome deve ter pelo menos 3 caracteres!');
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um email válido!');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres!');
            return;
        }

        // Validar confirmação de senha se existir
        if (confirmPassword && password !== confirmPassword) {
            alert('As senhas não correspondem!');
            return;
        }

        try {
            // Simular registro
            const usuario = {
                email: email,
                nome: name
            };

            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            this.usuarioLogado = usuario;
            this.atualizarBotaoLogin();
            this.fecharModalSignup();
            alert(`Conta criada com sucesso, ${name}! Bem-vindo! 🎉`);
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            alert('Erro ao criar conta. Tente novamente.');
        }
    }

    // Verificar se o usuário está logado
    verificarLogin() {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (usuarioLogado) {
            this.usuarioLogado = JSON.parse(usuarioLogado);
            this.atualizarBotaoLogin();
        }

        // Preencher email se foi lembrado
        const rememberEmail = localStorage.getItem('rememberEmail');
        if (rememberEmail) {
            document.getElementById('email').value = rememberEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }

    // Atualizar botão de login
    atualizarBotaoLogin() {
        const btnLogin = document.getElementById('btnLogin');
        const loginText = document.getElementById('loginText');

        if (this.usuarioLogado) {
            btnLogin.classList.add('logged');
            const plano = this.planoAtivo ? ` [${this.planoAtivo.toUpperCase()}]` : '';
            loginText.textContent = (this.usuarioLogado.nome || 'Logado') + plano;
            btnLogin.removeEventListener('click', () => this.abrirModalLogin());
            btnLogin.addEventListener('click', () => this.fazerLogout());
        } else {
            btnLogin.classList.remove('logged');
            loginText.textContent = 'Login';
            this.planoAtivo = 'free';
            btnLogin.removeEventListener('click', () => this.fazerLogout());
            btnLogin.addEventListener('click', () => this.abrirModalLogin());
        }
    }

    // Fazer logout
    fazerLogout() {
        localStorage.removeItem('usuarioLogado');
        this.usuarioLogado = null;
        this.planoAtivo = 'free';
        this.atualizarBotaoLogin();
        alert('Você saiu com sucesso! Até logo! 👋');
    }

    // === FUNÇÕES DE FORMATAÇÃO ===

    // Aplicar formatação (negrito, itálico, sublinhado, código)
    aplicarFormatacao(prefixo, sufixo) {
        const textarea = document.getElementById('conteudoPasta');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selecionado = textarea.value.substring(start, end);

        if (!selecionado) {
            const placeholder = prefixo === '**' ? 'texto em negrito' : 
                               prefixo === '*' ? 'texto em itálico' :
                               prefixo === '__' ? 'texto sublinhado' : 'código';
            textarea.value = textarea.value.substring(0, start) + prefixo + placeholder + sufixo + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + prefixo.length, start + prefixo.length + placeholder.length);
        } else {
            const novoTexto = prefixo + selecionado + sufixo;
            textarea.value = textarea.value.substring(0, start) + novoTexto + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + prefixo.length, start + prefixo.length + selecionado.length);
        }

        this.agendarSalvamento();
        this.atualizarContador();
    }

    // Inserir lista
    inserirLista(numerada = false) {
        const textarea = document.getElementById('conteudoPasta');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selecionado = textarea.value.substring(start, end);

        const prefixo = numerada ? '1. ' : '• ';
        const novaLinha = selecionado ? selecionado : 'item';
        
        textarea.value = textarea.value.substring(0, start) + prefixo + novaLinha + '\n' + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + prefixo.length, start + prefixo.length + novaLinha.length);

        this.agendarSalvamento();
        this.atualizarContador();
    }

    // Atalhos de teclado
    atalhosTeclado(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.aplicarFormatacao('**', '**');
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            this.aplicarFormatacao('*', '*');
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            this.aplicarFormatacao('__', '__');
        } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
            e.preventDefault();
            this.aplicarFormatacao('`', '`');
        }
    }

    // Fixar/desafixar nota
    toggleFixarNota() {
        if (this.notaSelecionada) {
            this.notaSelecionada.fixada = !this.notaSelecionada.fixada;
            this.salvarNotas();
            this.atualizarBotaoFixar();
            this.renderizarNotas();
        }
    }

    // Atualizar botão de fixar
    atualizarBotaoFixar() {
        const btnFixar = document.getElementById('btnFixar');
        if (this.notaSelecionada && this.notaSelecionada.fixada) {
            btnFixar.classList.add('ativo');
        } else {
            btnFixar.classList.remove('ativo');
        }
    }

    // Modo foco
    toggleModoFoco() {
        this.modoFoco = !this.modoFoco;
        document.body.classList.toggle('modo-foco', this.modoFoco);
        document.getElementById('btnFoco').classList.toggle('ativo', this.modoFoco);
        localStorage.setItem('modoFoco', this.modoFoco);
    }

    // Confirmar deleção
    confirmarDelecao() {
        if (this.notaSelecionada) {
            document.getElementById('confirmDeleteModal').classList.add('ativo');
        }
    }

    // Fechar confirmação
    fecharConfirmacao() {
        document.getElementById('confirmDeleteModal').classList.remove('ativo');
    }

    // Deletar nota após confirmação
    deletarNotaConfirmado() {
        if (this.notaSelecionada) {
            this.notas = this.notas.filter(n => n.id !== this.notaSelecionada.id);
            this.salvarNotas();
            this.notaSelecionada = null;
            document.getElementById('editorVazio').style.display = 'flex';
            document.getElementById('editorConteudo').style.display = 'none';
            this.renderizarNotas();
            this.atualizarEstatisticas();
            this.fecharConfirmacao();
        }
    }
    // === FUNÇÕES DE TEMA ===

    // Carregar tema
    carregarTema() {
        const tema = localStorage.getItem('tema') || 'dark';
        this.mudarTema(tema);
    }

    // Mudar tema
    mudarTema(tema) {
        document.body.className = '';
        if (tema !== 'dark') {
            document.body.classList.add(`${tema}-theme`);
        }
        localStorage.setItem('tema', tema);

        // Atualizar botão ativo
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('ativo');
        });
        document.querySelector(`[data-theme="${tema}"]`)?.classList.add('ativo');
    }

    // === FUNÇÕES DE SUGESTÕES ===

    // Configurar modal de sugestões
    setupSuggestions() {
        const btnSuggestion = document.getElementById('btnSuggestion');
        const sugestionModal = document.getElementById('sugestionModal');
        const btnCloseSuggestion = document.getElementById('btnCloseSuggestion');
        const suggestionForm = document.getElementById('suggestionForm');

        // Abrir modal
        btnSuggestion.addEventListener('click', () => {
            sugestionModal.classList.add('ativo');
            document.getElementById('suggestionName').focus();
        });

        // Fechar modal ao clicar no X
        btnCloseSuggestion.addEventListener('click', () => {
            this.fecharModalSuggestion();
        });

        // Fechar ao clicar fora
        sugestionModal.addEventListener('click', (e) => {
            if (e.target === sugestionModal) {
                this.fecharModalSuggestion();
            }
        });

        // Submeter sugestão
        suggestionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.enviarSugestao();
        });
    }

    // Fechar modal de sugestão
    fecharModalSuggestion() {
        const sugestionModal = document.getElementById('sugestionModal');
        const suggestionForm = document.getElementById('suggestionForm');
        const suggestionSuccess = document.getElementById('suggestionSuccess');

        sugestionModal.classList.remove('ativo');
        suggestionForm.style.display = 'flex';
        suggestionSuccess.style.display = 'none';
        suggestionForm.reset();
    }

    // Enviar sugestão
    enviarSugestao() {
        const name = document.getElementById('suggestionName').value.trim();
        const email = document.getElementById('suggestionEmail').value.trim();
        const text = document.getElementById('suggestionText').value.trim();
        const category = document.getElementById('suggestionCategory').value;

        // Validação
        if (!name || !email || !text) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um email válido!');
            return;
        }

        try {
            // Criar objeto de sugestão
            const sugestao = {
                name: name,
                email: email,
                text: text,
                category: category,
                data: new Date().toLocaleString('pt-BR')
            };

            // Salvar no localStorage também
            const sugestoesLocal = JSON.parse(localStorage.getItem('sugestoes')) || [];
            sugestoesLocal.push({
                ...sugestao,
                id: Date.now(),
                status: 'nova'
            });
            localStorage.setItem('sugestoes', JSON.stringify(sugestoesLocal));

            // Enviar para o servidor
            this.enviarSugestaoAoServidor(sugestao);

        } catch (error) {
            console.error('Erro ao processar sugestão:', error);
            alert('Erro ao processar sugestão. Tente novamente.');
        }
    }

    // Enviar sugestão ao servidor por email
    enviarSugestaoAoServidor(sugestao) {
        const btnSubmit = document.querySelector('.btn-submit-suggestion');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Enviando...';

        fetch('/send-suggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sugestao)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Sugestão enviada com sucesso!' );
                this.mostrarMensagemSucesso();
            } else {
                console.warn('⚠️  Sugestão salva localmente, mas não foi enviada por email:', data.warning || data.error);
                this.mostrarMensagemSucesso();
            }
        })
        .catch(error => {
            console.warn('⚠️  Erro ao enviar para servidor, sugestão salva localmente:', error);
            this.mostrarMensagemSucesso();
        })
        .finally(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Enviar Sugestão';
        });
    }

    // Mostrar mensagem de sucesso
    mostrarMensagemSucesso() {
        const suggestionForm = document.getElementById('suggestionForm');
        const suggestionSuccess = document.getElementById('suggestionSuccess');
        
        suggestionForm.style.display = 'none';
        suggestionSuccess.style.display = 'flex';

        // Fechar modal após 2 segundos
        setTimeout(() => {
            this.fecharModalSuggestion();
        }, 2000);
    }
}


// Função global para handle de login com Google
function handleLoginGoogle(response) {
    try {
        // Decodificar JWT token do Google
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userInfo = JSON.parse(jsonPayload);

        // Armazenar dados do usuário
        const usuario = {
            email: userInfo.email,
            nome: userInfo.name,
            foto: userInfo.picture,
            provider: 'google'
        };

        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        
        // Fechar modal e atualizar UI
        const blocoNotas = window.blocoNotasInstance;
        if (blocoNotas) {
            blocoNotas.usuarioLogado = usuario;
            blocoNotas.atualizarBotaoLogin();
            blocoNotas.fecharModalLogin();
        }

        alert(`Bem-vindo, ${userInfo.name}! 🎉`);
    } catch (error) {
        console.error('Erro ao processar login do Google:', error);
        alert('Erro ao fazer login com Google. Tente novamente.');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.blocoNotasInstance = new BlcoDeNotas();
});
