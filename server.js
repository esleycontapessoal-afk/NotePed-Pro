// NotePad Pro - Servidor Simplificado (sem pagamentos)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

// Carregar variáveis de ambiente PRIMEIRO
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar Nodemailer para Gmail
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
}

// Middleware
app.use(cors({
    origin: process.env.DOMAIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.static('.')); // Servir arquivos estáticos
app.use(express.json({ limit: '10mb' })); // Aumentado o limite de JSON

// ===== ROTAS =====

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        emailConfigured: !!transporter
    });
});

/**
 * Rota padrão
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * POST /send-suggestion - Receber e enviar sugestão por email
 */
app.post('/send-suggestion', async (req, res) => {
    try {
        const { name, email, text, category } = req.body;

        // Validações
        if (!name || !email || !text || !category) {
            return res.status(400).json({ 
                error: 'Campos obrigatórios faltando' 
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Email inválido' 
            });
        }

        // Se não há transporter configurado, apenas retornar sucesso (fallback)
        if (!transporter) {
            console.warn('⚠️  Email não configurado. Sugestão não será enviada.');
            return res.json({ 
                success: true, 
                message: 'Sugestão recebida (email não configurado)',
                warning: 'Email não está configurado no servidor'
            });
        }

        // Preparar email
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8b5cf6;">📨 Nova Sugestão Recebida</h2>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>👤 Nome:</strong> ${name}</p>
                    <p><strong>📧 Email:</strong> ${email}</p>
                    <p><strong>📑 Categoria:</strong> <span style="background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;">${category}</span></p>
                    <p><strong>📅 Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>

                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">📝 Sugestão:</h3>
                    <p style="white-space: pre-wrap; line-height: 1.6;">${text}</p>
                </div>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #666; font-size: 12px; text-align: center;">
                    Esta é uma sugestão automática do NotePad Pro V.001 BETA
                </p>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENT,
            subject: `[NotePad Pro] Nova Sugestão - ${category}`,
            html: htmlContent,
            replyTo: email
        };

        // Enviar email
        await transporter.sendMail(mailOptions);

        console.log(`✅ Sugestão enviada com sucesso de ${email}`);

        res.json({ 
            success: true, 
            message: 'Sugestão enviada com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao enviar sugestão:', error);
        res.status(500).json({ 
            error: 'Erro ao enviar sugestão',
            details: error.message 
        });
    }
});


// ===== ENDPOINTS DE STRIPE (DESATIVADOS) =====
// Os endpoints de pagamento foram removidos pois o sistema está em modo gratuito
// Para reativar assinaturas no futuro, consulte a documentação em STRIPE_SETUP.md
// 
// Endpoints que podem ser restaurados:
// - POST /create-checkout-session (criar sessão de checkout)
// - GET /checkout-session/:sessionId (obter info da sessão)
// - GET /check-subscription/:email (verificar assinatura)
// - POST /create-portal-session (gerenciar assinatura)
// - POST /webhook (webhook do Stripe)
//
// Passos para reativar:
// 1. Configurar variáveis de ambiente com chaves Stripe reais
// 2. Instalar/importar dependência Stripe
// 3. Descomentar código no arquivo STRIPE_SETUP.md


// ===== TRATAMENTO DE ERROS =====

/**
 * 404 - Rota não encontrada
 */
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.path 
    });
});

/**
 * Tratamento global de erros
 */
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Erro interno do servidor',
        environment: process.env.NODE_ENV 
    });
});


// ===== INICIAR SERVIDOR =====

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║       NotePad Pro - Servidor          ║
║     (Modo Gratuito - Sem Pagamentos)  ║
╚════════════════════════════════════════╝

🚀 Servidor rodando em http://localhost:${PORT}
📝 API disponível para requisições
✨ Versão BETA V.001 ativada
🔧 Ambiente: ${NODE_ENV}

📋 Endpoints:
   GET  /health - Verificar status do servidor
   GET  /        - Página principal
   POST /send-suggestion - Enviar sugestão por email

${transporter ? '✅ Email configurado e funcionando' : '⚠️  Email NÃO configurado - Sugestões não serão enviadas'}

💡 As funcionalidades de assinatura foram temporariamente desativadas
   Para reativar no futuro, consulte a documentação em STRIPE_SETUP.md
   
⚠️  Segurança:
   - Nunca compartilhe chaves Stripe
   - Use .env para variáveis sensíveis
   - Configure CORS apropriadamente em produção
    `);
});

export default app;
