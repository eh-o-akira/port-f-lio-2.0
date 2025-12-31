// script.js - VERSÃO SIMPLIFICADA E FUNCIONAL

console.log('🚀 Script.js iniciado - Sistema de autenticação');

// ===========================================
// 🔥 INICIALIZAÇÃO FIREBASE DIRETA
// ===========================================
const firebaseConfig = {
    apiKey: "AIzaSyD08wjJ9rTqyZrzNWBJHLxsb1ztYElA3z8",
    authDomain: "meu-portifolio-21f88.firebaseapp.com",
    projectId: "meu-portifolio-21f88",
    storageBucket: "meu-portifolio-21f88.appspot.com",
    messagingSenderId: "806930819935",
    appId: "1:806930819935:web:3aa738a18026d925d7e4ea"
};

// Inicializa Firebase DIRETAMENTE (sem arquivo separado)
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase inicializado com sucesso');
    } else {
        console.error('❌ Firebase não está carregado');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// ===========================================
// 📦 VARIÁVEIS GLOBAIS
// ===========================================
let isRegisterMode = false;

// ===========================================
// 🚀 INICIALIZAÇÃO PRINCIPAL
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 DOM Carregado - Script.js');
    
    // Aguarda mais tempo para garantir que lab-effects.js carregou primeiro
    setTimeout(() => {
        setupModalAuthEvents();
        testButtons();
    }, 1500);
});

// ===========================================
// 🔐 CONFIGURAÇÃO DOS EVENTOS DE AUTENTICAÇÃO
// ===========================================
function setupModalAuthEvents() {
    console.log('🔧 Configurando eventos de autenticação...');
    
    // 1. Botão "Criar conta / Já tenho conta"
    const toggleBtn = document.getElementById('modal-toggle-register');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Alternando modo registro/login');
            
            isRegisterMode = !isRegisterMode;
            this.textContent = isRegisterMode ? 'Já tenho conta' : 'Criar nova conta no lab';
            
            // Mostra/esconde campo de nome
            const nameInput = document.getElementById('modal-name');
            if (nameInput) {
                nameInput.style.display = isRegisterMode ? 'block' : 'none';
            }
            
            // Muda texto do botão
            const emailBtn = document.getElementById('modal-email-btn');
            if (emailBtn) {
                emailBtn.innerHTML = isRegisterMode ? 
                    '<i class="fas fa-user-plus"></i> Cadastrar' : 
                    '<i class="fas fa-door-open"></i> Entrar';
            }
        });
    } else {
        console.warn('⚠️ Botão modal-toggle-register não encontrado');
    }
    
    // 2. Botão Login com Google
    const googleBtn = document.getElementById('modal-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 Google Login clicado');
            
            if (typeof firebase === 'undefined') {
                showError('Firebase não carregado. Recarregue a página.');
                return;
            }
            
            handleGoogleLogin();
        });
    } else {
        console.warn('⚠️ Botão modal-google não encontrado');
    }
    
    // 3. Botão Login/Registro com Email
    const emailBtn = document.getElementById('modal-email-btn');
    if (emailBtn) {
        emailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📧 Botão Email clicado');
            
            if (typeof firebase === 'undefined') {
                showError('Firebase não carregado. Recarregue a página.');
                return;
            }
            
            handleEmailAuth();
        });
    } else {
        console.warn('⚠️ Botão modal-email-btn não encontrado');
    }
    
    // 4. Enter para enviar formulário
    const emailInput = document.getElementById('modal-email');
    const passwordInput = document.getElementById('modal-password');
    const nameInput = document.getElementById('modal-name');
    
    [emailInput, passwordInput, nameInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleEmailAuth();
                }
            });
        }
    });
    
    console.log('✅ Eventos de autenticação configurados');
}

// ===========================================
// 🔐 HANDLERS DE AUTENTICAÇÃO
// ===========================================
async function handleGoogleLogin() {
    try {
        showLoading('Conectando com Google...');
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Login Google bem-sucedido:', user.email);
        
        // Verifica se é novo usuário
        const isNewUser = result.additionalUserInfo?.isNewUser;
        
        if (isNewUser) {
            showSuccess(`Conta criada com sucesso, ${user.displayName}!`);
        } else {
            showSuccess(`Bem-vindo de volta, ${user.displayName}!`);
        }
        
        // Fecha o modal
        setTimeout(() => {
            if (window.closeLoginModal) {
                window.closeLoginModal();
            }
            // Redireciona para home.html após 2 segundos
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        }, 1500);
        
    } catch (error) {
        console.error('❌ Erro no login Google:', error);
        showError(getFirebaseErrorMessage(error));
    }
}

async function handleEmailAuth() {
    const email = document.getElementById('modal-email')?.value.trim() || '';
    const password = document.getElementById('modal-password')?.value || '';
    const nome = document.getElementById('modal-name')?.value.trim() || '';
    
    console.log('📧 Tentando autenticar:', { email: email.substring(0, 3) + '...', isRegisterMode });
    
    // Validações básicas
    if (!email || !password) {
        showError('Preencha email e senha');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        showError('Email inválido');
        return;
    }
    
    if (isRegisterMode) {
        // MODO REGISTRO
        if (!nome) {
            showError('Preencha seu nome');
            return;
        }
        
        if (password.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        await handleRegister(email, password, nome);
    } else {
        // MODO LOGIN
        await handleLogin(email, password);
    }
}

async function handleRegister(email, password, nome) {
    try {
        showLoading('Criando sua conta...');
        
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Usuário criado:', user.email);
        
        // Atualiza perfil
        await user.updateProfile({
            displayName: nome,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=90ee90&color=fff`
        });
        
        // Envia email de verificação
        await user.sendEmailVerification();
        
        showSuccess(`Conta criada com sucesso, ${nome}! Verifique seu email.`);
        
        // Fecha o modal
        setTimeout(() => {
            if (window.closeLoginModal) {
                window.closeLoginModal();
            }
            // Redireciona após 2 segundos
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro no registro:', error);
        showError(getFirebaseErrorMessage(error));
    }
}

async function handleLogin(email, password) {
    try {
        showLoading('Entrando...');
        
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Login bem-sucedido:', user.email);
        
        if (!user.emailVerified) {
            showWarning('Verifique seu email para acesso completo.');
        }
        
        showSuccess(`Bem-vindo, ${user.displayName || 'Usuário'}!`);
        
        // Fecha o modal
        setTimeout(() => {
            if (window.closeLoginModal) {
                window.closeLoginModal();
            }
            // Redireciona para home.html após 2 segundos
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        }, 1500);
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showError(getFirebaseErrorMessage(error));
    }
}

// ===========================================
// 🐛 FUNÇÃO DE TESTE DOS BOTÕES
// ===========================================
function testButtons() {
    console.log('🧪 Testando botões...');
    
    // Testa botões do modal
    const buttons = [
        'modal-google',
        'modal-email-btn', 
        'modal-toggle-register',
        'modal-email',
        'modal-password',
        'modal-name'
    ];
    
    buttons.forEach(id => {
        const el = document.getElementById(id);
        console.log(`- ${id}: ${el ? '✅' : '❌'}`);
    });
}

// ===========================================
// 📱 SISTEMA DE NOTIFICAÇÕES
// ===========================================
function showLoading(message) {
    hideNotifications();
    
    const notification = document.createElement('div');
    notification.className = 'notification loading';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="spinner"></div>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    positionNotification(notification, '#87ceeb');
    
    return notification;
}

function showSuccess(message) {
    hideNotifications();
    
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    positionNotification(notification, '#90ee90');
    
    setTimeout(() => removeNotification(notification), 3000);
}

function showError(message) {
    hideNotifications();
    
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    positionNotification(notification, '#ff6b6b');
    
    setTimeout(() => removeNotification(notification), 4000);
}

function showWarning(message) {
    hideNotifications();
    
    const notification = document.createElement('div');
    notification.className = 'notification warning';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    positionNotification(notification, '#ffd93d');
    
    setTimeout(() => removeNotification(notification), 4000);
}

function positionNotification(notification, color) {
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(10, 10, 15, 0.98);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        border-left: 5px solid ${color};
        z-index: 10000;
        animation: slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        backdrop-filter: blur(20px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        max-width: 350px;
        min-width: 300px;
        transform-origin: top right;
        border: 1px solid rgba(144, 238, 144, 0.1);
    `;
    
    // Adiciona gradiente baseado no tipo
    if (color === '#90ee90') {
        notification.style.background = 'linear-gradient(90deg, rgba(10, 10, 15, 0.98) 0%, rgba(144, 238, 144, 0.05) 100%)';
    } else if (color === '#ff6b6b') {
        notification.style.background = 'linear-gradient(90deg, rgba(10, 10, 15, 0.98) 0%, rgba(255, 107, 107, 0.05) 100%)';
    } else if (color === '#ffd93d') {
        notification.style.background = 'linear-gradient(90deg, rgba(10, 10, 15, 0.98) 0%, rgba(255, 217, 61, 0.05) 100%)';
    } else {
        notification.style.background = 'linear-gradient(90deg, rgba(10, 10, 15, 0.98) 0%, rgba(135, 206, 235, 0.05) 100%)';
    }
}

function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

function hideNotifications() {
    document.querySelectorAll('.notification').forEach(removeNotification);
}

// ===========================================
// 🛠️ FUNÇÕES UTILITÁRIAS
// ===========================================
function getFirebaseErrorMessage(error) {
    const errorMessages = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Esta conta foi desativada',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/operation-not-allowed': 'Operação não permitida',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
        'auth/popup-closed-by-user': 'Popup fechado pelo usuário',
        'auth/popup-blocked': 'Popup bloqueado. Permita popups para login'
    };
    
    return errorMessages[error.code] || error.message || 'Erro desconhecido';
}

// ===========================================
// 🎨 ESTILOS DINÂMICOS
// ===========================================
const authStyles = document.createElement('style');
authStyles.textContent = `
    @keyframes slideInRight {
        0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
        80% {
            transform: translateX(-10px) scale(1.02);
        }
        100% {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        0% {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        20% {
            transform: translateX(-10px) scale(1.02);
        }
        100% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
    }
    
    .notification .spinner {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(135, 206, 235, 0.2);
        border-top-color: #87ceeb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 10px;
        vertical-align: middle;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(authStyles);

console.log('✅ Script.js pronto para uso!');