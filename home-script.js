// home.js - Sistema da Dashboard
console.log('🏠 Home.js iniciando...');

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD08wjJ9rTqyZrzNWBJHLxsb1ztYElA3z8",
    authDomain: "meu-portifolio-21f88.firebaseapp.com",
    projectId: "meu-portifolio-21f88",
    storageBucket: "meu-portifolio-21f88.appspot.com",
    messagingSenderId: "806930819935",
    appId: "1:806930819935:web:3aa738a18026d925d7e4ea"
};

// Inicializa Firebase
let app, auth, database;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    database = firebase.database();
    console.log('✅ Firebase inicializado na home');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Home DOM carregado');
    
    initAuthCheck();
    initDashboard();
    initLogout();
    
    // novo: handlers gerais
    initModalHandlers();
    initSkillHandlers();
    initFileUploadHandlers();
});

// ===========================================
// 🔐 VERIFICAÇÃO DE AUTENTICAÇÃO
// ===========================================
function initAuthCheck() {
    if (!auth) {
        console.error('❌ Firebase não disponível');
        return;
    }
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ Usuário autenticado na home:', user.email);
            updateUserInfo(user);
            loadUserProjects(user.uid);
            loadUserSkills(user.uid); // novo: carrega skills do DB
        } else {
            console.log('🔐 Usuário não autenticado, redirecionando...');
            // Se não está logado, volta para index.html
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    });
}

// ===========================================
// 👤 ATUALIZA INFORMAÇÕES DO USUÁRIO
// ===========================================
function updateUserInfo(user) {
    const userNameElements = document.querySelectorAll('#user-name');
    const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
    
    userNameElements.forEach(el => {
        el.textContent = displayName;
    });
    
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
        } else {
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=90ee90&color=fff`;
        }
    }
}

// ===========================================
// 📁 CARREGA PROJETOS DO USUÁRIO
// ===========================================
function loadUserProjects(userId) {
    const container = document.getElementById('projetos-container');
    if (!container || !database) return;
    
    database.ref('users/' + userId + '/projetos').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            const projetosArray = Object.values(data);
            projetosArray.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
            
            // Atualiza contador
            const projectsCount = document.getElementById('projects-count');
            if (projectsCount) {
                projectsCount.textContent = projetosArray.length;
            }
            
            // Renderiza projetos
            renderProjects(projetosArray);
        } else {
            showEmptyState();
        }
    });
}

function renderProjects(projetos) {
    const container = document.getElementById('projetos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    projetos.forEach(projeto => {
        const card = createProjectCard(projeto);
        container.appendChild(card);
    });
}

function createProjectCard(projeto) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const imgHTML = projeto.imagem ? 
        `<div class="project-image" style="background-image: url('${projeto.imagem}')"></div>` : 
        `<div class="project-placeholder">
            <i class="fas fa-flask"></i>
        </div>`;
    
    const linkHTML = projeto.link ? 
        `<a href="${projeto.link}" target="_blank" class="project-link">
            <i class="fas fa-external-link-alt"></i> Ver Projeto
        </a>` : '';
    
    // Novo: preview/link para attachment (pdf/json)
    let attachmentHTML = '';
    if (projeto.attachmentUrl) {
        const t = projeto.attachmentType || projeto.attachmentMime || '';
        if (t.includes('pdf')) {
            attachmentHTML = `
                <div class="project-attachment">
                    <a class="project-preview" href="${projeto.attachmentUrl}" target="_blank" title="Abrir PDF">
                        <i class="fas fa-file-pdf"></i> Ver PDF
                    </a>
                    <div class="project-embed">
                        <iframe src="${projeto.attachmentUrl}" frameborder="0" loading="lazy"></iframe>
                    </div>
                </div>
            `;
        } else if (t.includes('json')) {
            attachmentHTML = `
                <div class="project-attachment">
                    <a class="project-download" href="${projeto.attachmentUrl}" target="_blank" title="Baixar JSON">
                        <i class="fas fa-file-code"></i> JSON
                    </a>
                </div>
            `;
        } else {
            // outros (zip, etc) - apenas link para download/visualização
            attachmentHTML = `
                <div class="project-attachment">
                    <a class="project-download" href="${projeto.attachmentUrl}" target="_blank" title="Baixar Anexo">
                        <i class="fas fa-file-archive"></i> Anexo
                    </a>
                </div>
            `;
        }
    }

    card.innerHTML = `
        ${imgHTML}
        
        <div class="project-content">
            <div class="project-header">
                <h3>${projeto.titulo}</h3>
                <span class="project-status">${projeto.status || 'Em Desenvolvimento'}</span>
            </div>
            
            <p class="project-desc">${projeto.descricao?.substring(0, 120) || 'Sem descrição'}...</p>
            
            <div class="project-meta">
                ${linkHTML}
                
                <div class="project-stats">
                    <span class="project-stat">
                        <i class="far fa-calendar"></i> ${formatDate(projeto.dataCriacao)}
                    </span>
                </div>
            </div>

            ${attachmentHTML}
        </div>
        
        <div class="project-actions">
            <button class="btn-edit" data-id="${projeto.id}" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" data-id="${projeto.id}" title="Deletar">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

function showEmptyState() {
    const container = document.getElementById('projetos-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state" id="empty-projects">
            <div class="empty-icon">
                <i class="fas fa-flask"></i>
            </div>
            <h3>Laboratório Vazio</h3>
            <p>Comece criando seu primeiro experimento!</p>
            <button id="create-first-project" class="lab-btn lab-btn-primary">
                <i class="fas fa-plus"></i> Criar Primeiro Projeto
            </button>
        </div>
    `;
    
    // Adiciona evento ao botão
    document.getElementById('create-first-project')?.addEventListener('click', () => {
        const addBtn = document.getElementById('add-project');
        if (addBtn) addBtn.click();
    });
}

// ===========================================
// 🚪 SISTEMA DE LOGOUT
// ===========================================
function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                showNotification('Saindo...', 'loading');
                
                if (auth) {
                    await auth.signOut();
                }
                
                showNotification('Logout realizado!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } catch (error) {
                console.error('Erro no logout:', error);
                showNotification('Erro ao fazer logout', 'error');
            }
        });
    }
}

// ===========================================
// 🎨 INICIALIZAÇÃO DO DASHBOARD
// ===========================================
function initDashboard() {
    // Animações dos status
    animateStatusCards();
    
    // Sistema de busca
    const searchInput = document.getElementById('search-projects');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProjects(e.target.value);
        });
    }
    
    // Botão adicionar projeto
    const addButton = document.getElementById('add-project');
    if (addButton) {
        addButton.addEventListener('click', () => {
            const modal = document.getElementById('modal-add');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Fechar modal
    const closeButtons = document.querySelectorAll('.close, .modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = document.getElementById('modal-add');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
}

function animateStatusCards() {
    const creativeMeter = document.getElementById('creative-meter');
    const creativeValue = document.getElementById('creative-value');
    
    if (creativeMeter && creativeValue) {
        setInterval(() => {
            const value = 85 + Math.sin(Date.now() / 7000) * 7;
            creativeMeter.style.width = Math.min(100, value) + '%';
            creativeValue.textContent = Math.round(Math.min(100, value)) + '%';
        }, 100);
    }
    
    const tempValue = document.getElementById('temp-value');
    const tempFill = document.querySelector('.temp-fill');
    
    if (tempValue && tempFill) {
        setInterval(() => {
            const temp = 38 + Math.sin(Date.now() / 5000) * 4;
            tempValue.textContent = Math.round(temp) + '°C';
            tempFill.style.width = Math.min(100, (temp - 30) * 2) + '%';
        }, 1000);
    }
}

// ===========================================
// 🛠️ FUNÇÕES UTILITÁRIAS
// ===========================================
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return 'Data desconhecida';
    }
}

function searchProjects(query) {
    const cards = document.querySelectorAll('.project-card');
    const normalizedQuery = query.toLowerCase().trim();
    
    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(normalizedQuery) || desc.includes(normalizedQuery);
        card.style.display = matches || normalizedQuery === '' ? 'block' : 'none';
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(10, 10, 15, 0.95);
        color: ${type === 'success' ? '#90ee90' : type === 'error' ? '#ff6b6b' : '#87ceeb'};
        padding: 15px 20px;
        border-radius: 10px;
        border-left: 4px solid ${type === 'success' ? '#90ee90' : type === 'error' ? '#ff6b6b' : '#87ceeb'};
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
        max-width: 300px;
    `;
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===========================================
// 🎨 ESTILOS DINÂMICOS
// ===========================================
const homeStyles = document.createElement('style');
homeStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(homeStyles);

// ==================== NOVAS FUNÇÕES: MODAIS, SKILLS E UPLOAD ====================
function initModalHandlers() {
    // delegação para abrir modais via data-open-modal
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-open-modal]');
        if (btn) {
            const modalId = btn.getAttribute('data-open-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        }

        // fechar modal por atributo data-close-modal
        const closeBtn = e.target.closest('[data-close-modal]');
        if (closeBtn) {
            const modal = closeBtn.closest('.modal') || document.querySelector('.modal.open');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        }

        // botão de editar (lápis) - abre modal de edição de projeto se existir
        const editBtn = e.target.closest('.btn-edit, .btn-edit-project');
        if (editBtn) {
            const modal = document.getElementById('modal-edit') || document.getElementById('modal-add');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        }

        // botão/pencil para editar skills (id ou class comum)
        const editSkillsBtn = e.target.closest('#edit-skills, .btn-edit-skills');
        if (editSkillsBtn) {
            const skillsModal = document.getElementById('modal-skills') || document.getElementById('modal-add-skills');
            if (skillsModal) {
                skillsModal.style.display = 'flex';
                skillsModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        }
    });

    // fechar modal ao clicar fora do conteúdo
    document.addEventListener('click', (e) => {
        const openModal = document.querySelector('.modal.open');
        if (openModal && e.target === openModal) {
            openModal.style.display = 'none';
            openModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

function initSkillHandlers() {
    // delegação para checkboxes (assume class .skill-checkbox)
    document.addEventListener('change', (e) => {
        const checkbox = e.target.closest('.skill-checkbox');
        if (!checkbox) return;

        // atualiza preview local imediatamente
        updateSkillsUIFromDOM();

        // salva no DB se usuário estiver autenticado
        const user = auth?.currentUser;
        if (user) {
            const selected = Array.from(document.querySelectorAll('.skill-checkbox:checked'))
                .map(cb => cb.value || cb.getAttribute('data-skill'))
                .filter(Boolean);
            database.ref('users/' + user.uid + '/skills').set(selected).catch(err => console.error(err));
        }
    });

    // botão salvar skills (se existir)
    const saveBtn = document.getElementById('save-skills');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const user = auth?.currentUser;
            if (!user) return;
            const selected = Array.from(document.querySelectorAll('.skill-checkbox:checked'))
                .map(cb => cb.value || cb.getAttribute('data-skill'))
                .filter(Boolean);
            database.ref('users/' + user.uid + '/skills').set(selected)
                .then(() => {
                    updateSkillsUI(selected);
                    const modal = document.querySelector('#modal-skills, #modal-add-skills');
                    if (modal) { modal.style.display = 'none'; modal.classList.remove('open'); document.body.style.overflow = ''; }
                }).catch(err => {
                    console.error('Erro ao salvar skills:', err);
                    showNotification('Erro ao salvar habilidades', 'error');
                });
        });
    }
}

function updateSkillsUIFromDOM() {
    const selected = Array.from(document.querySelectorAll('.skill-checkbox:checked'))
        .map(cb => cb.value || cb.getAttribute('data-skill'))
        .filter(Boolean);
    updateSkillsUI(selected);
}

function updateSkillsUI(skills) {
    // skills: array de strings
    const container = document.getElementById('skills-list') || document.querySelector('.skills-display') || document.getElementById('skills-tags-container');
    if (!container) return;
    container.innerHTML = '';
    skills = skills || [];
    skills.forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'skill-chip';
        chip.textContent = s;
        container.appendChild(chip);
    });
}

// carrega skills do DB para inicializar UI
function loadUserSkills(userId) {
    if (!database) return;
    database.ref('users/' + userId + '/skills').once('value').then(snapshot => {
        const skills = snapshot.val();
        if (Array.isArray(skills)) {
            updateSkillsUI(skills);
            // marca checkboxes se existirem
            skills.forEach(s => {
                const cb = document.querySelector(`.skill-checkbox[value="${CSS.escape(s)}"]`);
                if (cb) cb.checked = true;
            });
        }
    }).catch(err => console.error('Erro ao carregar skills:', err));
}

// ==================== UPLOAD DE ANEXOS DE PROJETO ====================
function initFileUploadHandlers() {
    // delegação para input de arquivo com id 'project-file-input'
    document.addEventListener('change', async (e) => {
        const input = e.target.closest('#project-file-input');
        if (!input || !input.files || input.files.length === 0) return;
        const file = input.files[0];
        const user = auth?.currentUser;
        if (!user) {
            showNotification('Você precisa estar logado para enviar arquivos', 'error');
            return;
        }
        try {
            showNotification('Enviando anexo...', 'info');
            const res = await uploadProjectAttachment(file, user.uid);
            // preenche campos do formulário do projeto com attachmentUrl e tipo (assume inputs com esses ids)
            const attUrlInput = document.getElementById('project-attachment-url');
            const attTypeInput = document.getElementById('project-attachment-type');
            if (attUrlInput) attUrlInput.value = res.url;
            if (attTypeInput) attTypeInput.value = res.type;
            showNotification('Anexo enviado', 'success');
        } catch (err) {
            console.error('Erro upload anexo:', err);
            showNotification('Falha no upload', 'error');
        }
    });
}

async function uploadProjectAttachment(file, userId) {
    if (!firebase || !firebase.storage) throw new Error('Firebase Storage não disponível');
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    let type = file.type || '';
    const storageRef = firebase.storage().ref();
    const path = `projects/${userId}/${Date.now()}_${file.name}`;
    const ref = storageRef.child(path);
    const snapshot = await ref.put(file);
    const url = await snapshot.ref.getDownloadURL();

    // Se for zip e JSZip estiver disponível, tentamos extrair o primeiro PDF para preview:
    if ((ext === 'zip' || type === 'application/zip') && typeof JSZip !== 'undefined') {
        try {
            const zip = await JSZip.loadAsync(file);
            const pdfFileName = Object.keys(zip.files).find(n => n.toLowerCase().endsWith('.pdf'));
            if (pdfFileName) {
                const pdfData = await zip.files[pdfFileName].async('blob');
                // upload extra do pdf para storage para obter URL público
                const pdfPath = `projects/${userId}/${Date.now()}_extracted_${pdfFileName}`;
                const pdfRef = storageRef.child(pdfPath);
                const pdfSnap = await pdfRef.put(pdfData);
                const pdfUrl = await pdfSnap.ref.getDownloadURL();
                return { url: pdfUrl, type: 'application/pdf', name: pdfFileName };
            }
        } catch (e) {
            console.warn('JSZip extração falhou:', e);
        }
    }

    // para json apenas marca tipo text/json
    if (ext === 'json' || type === 'application/json') type = 'application/json';

    return { url, type: type || file.type, name: file.name };
}

console.log('✅ Home.js completamente carregado!');