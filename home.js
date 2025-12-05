// home.js - Dashboard IgnisLab CORRIGIDO E FUNCIONAL
console.log('🏠 Dashboard IgnisLab - Versão Corrigida');

// ===========================================
// 🔥 CONFIGURAÇÃO DO FIREBASE
// ===========================================
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
    console.log('✅ Firebase inicializado');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// ===========================================
// 📦 VARIÁVEIS GLOBAIS
// ===========================================
let habilidadesUsuario = [];
let projetosUsuario = [];
let criatividadeLevel = 92;
let timerCriatividade;
let tagsProjetoAtual = [];
let projetoAtual = null; // Para edição

// ===========================================
// 🚀 INICIALIZAÇÃO
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 DOM carregado');
    
    initAuthCheck();
    initDashboard();
    initCriatividadeTimer();
    
    // Inicializa partículas
    if (typeof particlesJS !== 'undefined') {
        initParticlesDashboard();
    }
});

// ===========================================
// 🔐 SISTEMA DE AUTENTICAÇÃO
// ===========================================
function initAuthCheck() {
    if (!auth) {
        showNotification('Erro no sistema de autenticação', 'error');
        return;
    }
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ Usuário autenticado:', user.email);
            updateUserInfo(user);
            loadUserData(user.uid);
            loadUserHabilidades(user.uid);
            loadUserProjects(user.uid);
        } else {
            console.log('🔐 Usuário não autenticado, redirecionando...');
            showNotification('Redirecionando para login...', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

// ===========================================
// 👤 ATUALIZA INFORMAÇÕES DO USUÁRIO
// ===========================================
function updateUserInfo(user) {
    const userNameElements = document.querySelectorAll('#user-name');
    const displayName = user.displayName || user.email?.split('@')[0] || 'Explorador';
    
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
    
    // Atualiza badge do usuário
    const userBadge = document.getElementById('user-badge');
    if (userBadge) {
        userBadge.innerHTML = `
            <i class="fas fa-user-astronaut"></i>
            <span>${displayName}</span>
            <span class="user-status online"></span>
        `;
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
    
    // Filtros de projetos
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProjects(btn.dataset.filter);
        });
    });
    
    // Botão adicionar projeto
    const addButton = document.getElementById('add-project');
    if (addButton) {
        addButton.addEventListener('click', () => {
            openProjectModal();
        });
    }
    
    // Botão criar primeiro projeto
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'create-first-project') {
            openProjectModal();
        }
    });
    
    // Sistema de tags
    const tagsInput = document.getElementById('tecnologias-input');
    if (tagsInput) {
        tagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });
        
        tagsInput.addEventListener('blur', () => {
            if (tagsInput.value.trim()) {
                addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });
    }
    
    // Sistema de habilidades - BOTÃO CORRETO
    const editSkillsBtn = document.getElementById('edit-skills-btn');
    if (editSkillsBtn) {
        editSkillsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openHabilidadesModal();
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                showNotification('Saindo do laboratório...', 'loading');
                await auth.signOut();
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
    
    // Menu do usuário
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Fecha ao clicar fora
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
    }
    
    // Submit do formulário de projeto - AGORA FUNCIONA
    const formProjeto = document.getElementById('form-projeto');
    if (formProjeto) {
        formProjeto.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProject();
        });
    }
    
    console.log('✅ Dashboard inicializado');
}

// ===========================================
// 🧠 SISTEMA DE HABILIDADES - CORRIGIDO
// ===========================================
function openHabilidadesModal() {
    // Remove modal existente se houver
    const existingModal = document.getElementById('habilidades-modal');
    if (existingModal) existingModal.remove();
    
    // Cria o modal
    const modalHTML = `
        <div id="habilidades-modal" class="lab-modal">
            <div class="lab-modal-content habilidades-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-tools"></i> Minhas Habilidades</h2>
                    <button class="modal-close" id="close-habilidades-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="habilidades-list">
                        <p class="modal-instruction">Adicione suas habilidades abaixo:</p>
                        
                        <div class="selected-habilidades" id="selected-habilidades">
                            ${habilidadesUsuario.length > 0 ? 
                                habilidadesUsuario.map(skill => `
                                    <span class="skill-tag selected" data-skill="${skill}">
                                        ${skill}
                                        <button type="button" class="remove-skill" aria-label="Remover ${skill}">&times;</button>
                                    </span>
                                `).join('') 
                                : '<span class="no-skills-message">Nenhuma habilidade adicionada ainda</span>'}
                        </div>
                        
                        <div class="habilidades-input">
                            <input type="text" id="nova-habilidade" 
                                   placeholder="Digite uma habilidade (ex: React, Figma)" 
                                   class="lab-input"
                                   aria-label="Nova habilidade">
                            <button id="add-habilidade-btn" class="lab-btn lab-btn-outline">
                                <i class="fas fa-plus"></i> Adicionar
                            </button>
                        </div>
                        
                        <div class="habilidades-suggestions">
                            <h4>Sugestões rápidas:</h4>
                            <div class="suggestions-grid" id="suggestions-grid">
                                ${getHabilidadesSuggestions().map(skill => `
                                    <span class="skill-suggestion ${habilidadesUsuario.includes(skill) ? 'selected' : ''}" 
                                          data-skill="${skill}"
                                          role="button"
                                          tabindex="0">
                                        ${skill}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="lab-btn lab-btn-primary" id="save-skills-btn">
                                <i class="fas fa-save"></i> Salvar Habilidades
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('habilidades-modal');
    const modalContent = modal.querySelector('.habilidades-modal-content');
    
    // Mostra o modal com animação
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Evento para adicionar habilidade via botão
    document.getElementById('add-habilidade-btn').addEventListener('click', addHabilidadeFromInput);
    
    // Evento para adicionar habilidade via Enter
    document.getElementById('nova-habilidade').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addHabilidadeFromInput();
        }
    });
    
    // Evento para salvar habilidades
    document.getElementById('save-skills-btn').addEventListener('click', saveHabilidades);
    
    // Evento para fechar com X
    document.getElementById('close-habilidades-modal').addEventListener('click', closeHabilidadesModal);
    
    // Fechar ao clicar fora do modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHabilidadesModal();
        }
    });
    
    // Fechar com ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeHabilidadesModal();
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Eventos para sugestões
    document.querySelectorAll('.skill-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', toggleHabilidadeFromSuggestion);
        suggestion.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleHabilidadeFromSuggestion.call(suggestion);
            }
        });
    });
    
    // Adiciona eventos aos botões de remover
    document.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', function() {
            const skillTag = this.closest('.skill-tag');
            const skill = skillTag.dataset.skill;
            removeHabilidade(skill);
        });
    });
    
    // Foca no input
    setTimeout(() => {
        document.getElementById('nova-habilidade').focus();
    }, 300);
    
    console.log('✅ Modal de habilidades aberto');
}

function addHabilidadeFromInput() {
    const input = document.getElementById('nova-habilidade');
    const habilidade = input.value.trim();
    
    if (habilidade) {
        if (!habilidadesUsuario.includes(habilidade)) {
            addHabilidadeToList(habilidade);
            input.value = '';
            input.focus();
        } else {
            showNotification('Esta habilidade já foi adicionada', 'warning');
        }
    }
}

function toggleHabilidadeFromSuggestion() {
    const skill = this.dataset.skill;
    const isSelected = this.classList.contains('selected');
    
    if (isSelected) {
        removeHabilidade(skill);
    } else {
        addHabilidadeToList(skill);
    }
}

function addHabilidadeToList(habilidade) {
    if (!habilidadesUsuario.includes(habilidade)) {
        habilidadesUsuario.push(habilidade);
        
        const selectedContainer = document.getElementById('selected-habilidades');
        if (selectedContainer) {
            // Remove mensagem de "nenhuma habilidade"
            const noSkillsMsg = selectedContainer.querySelector('.no-skills-message');
            if (noSkillsMsg) noSkillsMsg.remove();
            
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag selected';
            skillTag.dataset.skill = habilidade;
            skillTag.innerHTML = `
                ${habilidade}
                <button type="button" class="remove-skill" aria-label="Remover ${habilidade}">&times;</button>
            `;
            
            selectedContainer.appendChild(skillTag);
            
            // Adiciona evento de remoção
            skillTag.querySelector('.remove-skill').addEventListener('click', () => {
                removeHabilidade(habilidade);
            });
        }
        
        // Atualiza sugestão correspondente
        const suggestion = document.querySelector(`.skill-suggestion[data-skill="${habilidade}"]`);
        if (suggestion) {
            suggestion.classList.add('selected');
        }
        
        console.log(`✅ Habilidade adicionada: ${habilidade}`);
    }
}

function removeHabilidade(habilidade) {
    habilidadesUsuario = habilidadesUsuario.filter(s => s !== habilidade);
    
    // Remove do DOM
    const skillTag = document.querySelector(`.skill-tag[data-skill="${habilidade}"]`);
    if (skillTag) {
        skillTag.remove();
    }
    
    // Atualiza sugestão correspondente
    const suggestion = document.querySelector(`.skill-suggestion[data-skill="${habilidade}"]`);
    if (suggestion) {
        suggestion.classList.remove('selected');
    }
    
    // Se não há mais habilidades, mostra mensagem
    const selectedContainer = document.getElementById('selected-habilidades');
    if (selectedContainer && habilidadesUsuario.length === 0) {
        selectedContainer.innerHTML = '<span class="no-skills-message">Nenhuma habilidade adicionada ainda</span>';
    }
    
    console.log(`❌ Habilidade removida: ${habilidade}`);
}

async function saveHabilidades() {
    const user = auth.currentUser;
    if (!user) {
        showNotification('Você precisa estar logado para salvar', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('save-skills-btn');
    const originalText = saveBtn.innerHTML;
    
    try {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        saveBtn.disabled = true;
        
        showNotification('Salvando suas habilidades...', 'loading');
        
        // Salva no Firebase
        await database.ref('users/' + user.uid + '/habilidades').set(habilidadesUsuario);
        
        // Atualiza UI
        updateHabilidadesUI();
        
        // Fecha o modal
        closeHabilidadesModal();
        
        showNotification('Habilidades salvas com sucesso! 🎯', 'success');
        
        console.log('✅ Habilidades salvas no Firebase:', habilidadesUsuario);
        
    } catch (error) {
        console.error('❌ Erro ao salvar habilidades:', error);
        showNotification('Erro ao salvar habilidades', 'error');
    } finally {
        // Restaura o botão
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

function closeHabilidadesModal() {
    const modal = document.getElementById('habilidades-modal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.habilidades-modal-content');
    
    // Animação de saída
    modal.style.opacity = '0';
    modalContent.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.remove();
        
        // Remove evento ESC
        document.removeEventListener('keydown', closeHabilidadesModal);
    }, 300);
    
    console.log('✅ Modal de habilidades fechado');
}

function getHabilidadesSuggestions() {
    return [
        'HTML5', 'CSS3', 'JavaScript', 'React', 'Vue.js', 'Angular',
        'Node.js', 'Python', 'Java', 'PHP', 'C#', 'TypeScript',
        'Firebase', 'MongoDB', 'MySQL', 'PostgreSQL', 'Git',
        'Figma', 'Adobe XD', 'UI/UX Design', 'Responsive Design',
        'REST APIs', 'GraphQL', 'Docker', 'AWS', 'Azure'
    ];
}

function updateHabilidadesUI() {
    const skillsContainer = document.querySelector('.skills-tags');
    if (skillsContainer) {
        skillsContainer.innerHTML = '';
        
        if (habilidadesUsuario.length === 0) {
            const placeholder = document.createElement('span');
            placeholder.className = 'no-skills-placeholder';
            placeholder.textContent = 'Nenhuma habilidade';
            skillsContainer.appendChild(placeholder);
        } else {
            habilidadesUsuario.slice(0, 4).forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'skill-tag';
                tag.textContent = skill;
                skillsContainer.appendChild(tag);
            });
            
            if (habilidadesUsuario.length > 4) {
                const moreTag = document.createElement('span');
                moreTag.className = 'skill-tag more';
                moreTag.textContent = `+${habilidadesUsuario.length - 4}`;
                moreTag.title = habilidadesUsuario.slice(4).join(', ');
                skillsContainer.appendChild(moreTag);
            }
        }
        
        console.log('✅ UI de habilidades atualizada:', habilidadesUsuario);
    }
}

// ===========================================
// 📊 ANIMAÇÕES DOS STATUS - CORRIGIDO
// ===========================================
function animateStatusCards() {
    // Medidor de criatividade
    const creativeMeter = document.getElementById('creative-meter');
    const creativeValue = document.getElementById('creative-value');
    
    if (creativeMeter && creativeValue) {
        function updateCreativeMeter() {
            creativeMeter.style.width = criatividadeLevel + '%';
            creativeValue.textContent = Math.round(criatividadeLevel) + '%';
            
            // Muda a cor baseada no nível
            if (criatividadeLevel > 70) {
                creativeMeter.style.background = 'linear-gradient(90deg, #90ee90, #87ceeb)';
            } else if (criatividadeLevel > 40) {
                creativeMeter.style.background = 'linear-gradient(90deg, #ffd93d, #ffa726)';
            } else {
                creativeMeter.style.background = 'linear-gradient(90deg, #ff6b6b, #ffa726)';
            }
            
            // Verifica se precisa alertar o usuário
            if (criatividadeLevel < 20 && criatividadeLevel > 15) {
                showNotification('⚠️ Nível de criatividade baixo! Considere descansar.', 'warning');
            }
        }
        
        updateCreativeMeter();
        setInterval(updateCreativeMeter, 1000);
    }
    
    // Temperatura do lab
    const tempValue = document.getElementById('temp-value');
    const tempFill = document.querySelector('.temp-fill');
    
    if (tempValue && tempFill) {
        setInterval(() => {
            const baseTemp = 35 + (criatividadeLevel / 100 * 15);
            const temp = baseTemp + Math.sin(Date.now() / 5000) * 2;
            tempValue.textContent = Math.round(temp) + '°C';
            tempFill.style.width = Math.min(100, ((temp - 30) / 30 * 100)) + '%';
        }, 1000);
    }
    
    // Atualiza contador de projetos (deve mostrar 0 inicialmente)
    updateProjectsCount(0);
}

// ===========================================
// ⏰ TIMER DE CRIATIVIDADE
// ===========================================
function initCriatividadeTimer() {
    // Carrega nível salvo
    const savedLevel = localStorage.getItem('ignislab-criatividade');
    if (savedLevel) {
        criatividadeLevel = parseFloat(savedLevel);
    }
    
    // Inicia timer de decaimento (10 minutos = 600,000ms)
    timerCriatividade = setInterval(() => {
        if (criatividadeLevel > 0) {
            criatividadeLevel -= 0.5; // Decai 0.5% a cada 10 minutos
            if (criatividadeLevel < 0) criatividadeLevel = 0;
            
            localStorage.setItem('ignislab-criatividade', criatividadeLevel);
            
            console.log(`📉 Criatividade: ${criatividadeLevel.toFixed(1)}%`);
            
            // Aviso quando estiver muito baixo
            if (criatividadeLevel < 15) {
                showNotification('💡 Sua criatividade está baixa! Que tal uma pausa?', 'warning');
            }
        }
    }, 600000); // 10 minutos
    
    // Recarrega criatividade ao adicionar projeto
    document.addEventListener('project-added', () => {
        if (criatividadeLevel < 95) {
            criatividadeLevel += 15; // +15% por projeto
            if (criatividadeLevel > 100) criatividadeLevel = 100;
            localStorage.setItem('ignislab-criatividade', criatividadeLevel);
            showNotification('✨ Criatividade recarregada!', 'success');
        }
    });
}

// ===========================================
// 📁 SISTEMA DE PROJETOS - CORRIGIDO
// ===========================================
async function loadUserData(userId) {
    try {
        database.ref('users/' + userId).on('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                updateDashboardStats();
            }
        });
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}

async function loadUserHabilidades(userId) {
    try {
        database.ref('users/' + userId + '/habilidades').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
                habilidadesUsuario = data;
                updateHabilidadesUI();
                console.log('✅ Habilidades carregadas:', habilidadesUsuario);
            } else {
                // Limpa as habilidades se não houver dados
                habilidadesUsuario = [];
                updateHabilidadesUI();
                console.log('✅ Nenhuma habilidade encontrada');
            }
        });
    } catch (error) {
        console.error('Erro ao carregar habilidades:', error);
        habilidadesUsuario = [];
        updateHabilidadesUI();
    }
}

async function loadUserProjects(userId) {
    const container = document.getElementById('projetos-container');
    if (!container || !database) return;
    
    try {
        database.ref('users/' + userId + '/projetos').on('value', (snapshot) => {
            const data = snapshot.val();
            
            if (data) {
                projetosUsuario = Object.values(data);
                projetosUsuario.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
                
                // Atualiza contador de projetos
                updateProjectsCount(projetosUsuario.length);
                
                // Renderiza projetos
                renderProjects(projetosUsuario);
                
                // Atualiza estatísticas
                updateDashboardStats();
                
                console.log(`✅ Projetos carregados: ${projetosUsuario.length} projetos`);
            } else {
                projetosUsuario = [];
                updateProjectsCount(0);
                updateDashboardStats();
                showEmptyState();
                console.log('✅ Nenhum projeto encontrado');
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        showNotification('Erro ao carregar projetos', 'error');
        projetosUsuario = [];
        updateProjectsCount(0);
        showEmptyState();
    }
}

function updateProjectsCount(count) {
    const projectsCount = document.getElementById('projects-count');
    if (projectsCount) {
        projectsCount.textContent = count;
        projectsCount.style.animation = 'pulse 0.5s';
        setTimeout(() => {
            projectsCount.style.animation = '';
        }, 500);
    }
}

// ===========================================
// 📝 MODAL DE PROJETO - CORRIGIDO E FUNCIONAL
// ===========================================
function openProjectModal(projeto = null) {
    // Remove modal existente se houver
    const existingModal = document.getElementById('modal-add');
    if (existingModal) existingModal.remove();
    
    projetoAtual = projeto;
    
    // Define tags para o projeto atual
    if (projeto && projeto.tecnologias) {
        tagsProjetoAtual = [...projeto.tecnologias];
    } else {
        tagsProjetoAtual = [];
    }
    
    // Cria modal novo
    const modalHTML = `
        <div id="modal-add" class="lab-modal">
            <div class="lab-modal-content modal-small">
                <div class="modal-header">
                    <h2><i class="fas fa-vial"></i> <span id="modal-title">${projeto ? 'Editar Experimento' : 'Novo Experimento'}</span></h2>
                    <button class="modal-close" id="close-project-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="form-projeto">
                        <div class="form-group">
                            <label for="titulo">
                                <i class="fas fa-heading"></i> Título do Experimento *
                            </label>
                            <input type="text" id="titulo" placeholder="Ex: Ignis Dashboard v2.0" required class="lab-input" value="${projeto ? (projeto.titulo || '') : ''}">
                        </div>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="categoria">
                                    <i class="fas fa-tag"></i> Categoria
                                </label>
                                <select id="categoria" class="lab-input">
                                    <option value="web" ${projeto?.categoria === 'web' ? 'selected' : ''}>Web</option>
                                    <option value="mobile" ${projeto?.categoria === 'mobile' ? 'selected' : ''}>Mobile</option>
                                    <option value="design" ${projeto?.categoria === 'design' ? 'selected' : ''}>Design</option>
                                    <option value="prototype" ${projeto?.categoria === 'prototype' ? 'selected' : ''}>Protótipo</option>
                                    <option value="experiment" ${projeto?.categoria === 'experiment' ? 'selected' : ''}>Experimento</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="status">
                                    <i class="fas fa-tasks"></i> Status
                                </label>
                                <select id="status" class="lab-input">
                                    <option value="planning" ${projeto?.status === 'planning' ? 'selected' : ''}>Planejamento</option>
                                    <option value="development" ${projeto?.status === 'development' ? 'selected' : ''}>Em Desenvolvimento</option>
                                    <option value="testing" ${projeto?.status === 'testing' ? 'selected' : ''}>Testes</option>
                                    <option value="completed" ${projeto?.status === 'completed' ? 'selected' : ''}>Concluído</option>
                                    <option value="paused" ${projeto?.status === 'paused' ? 'selected' : ''}>Pausado</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="tecnologias">
                                <i class="fas fa-code"></i> Tecnologias Utilizadas
                            </label>
                            <div class="tags-input" id="tags-container">
                                ${tagsProjetoAtual.length > 0 ? 
                                    tagsProjetoAtual.map(tag => `
                                        <span class="tag">
                                            ${tag}
                                            <button type="button" class="remove-tag" aria-label="Remover ${tag}">&times;</button>
                                        </span>
                                    `).join('') : 
                                    '<span class="tags-placeholder">Nenhuma tecnologia adicionada</span>'}
                            </div>
                            <input type="text" id="tecnologias-input" placeholder="Digite uma tecnologia e pressione Enter" class="lab-input">
                            <small class="form-hint">Ex: React, Firebase, Figma, Node.js</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="descricao">
                                <i class="fas fa-align-left"></i> Descrição
                            </label>
                            <textarea id="descricao" placeholder="Descreva seu experimento, tecnologias usadas, desafios superados..." rows="3" class="lab-input">${projeto ? (projeto.descricao || '') : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="link">
                                <i class="fas fa-link"></i> URL do Projeto (opcional)
                            </label>
                            <input type="url" id="link" placeholder="https://exemplo.com/projeto" class="lab-input" value="${projeto ? (projeto.link || '') : ''}">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="lab-btn lab-btn-outline" id="cancel-project-btn">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="submit" class="lab-btn lab-btn-primary" id="save-project-btn">
                                <i class="fas fa-save"></i> ${projeto ? 'Atualizar' : 'Salvar'} Experimento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('modal-add');
    const modalContent = modal.querySelector('.lab-modal-content');
    
    // Mostra o modal com animação
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Configura eventos
    const form = document.getElementById('form-projeto');
    const cancelBtn = document.getElementById('cancel-project-btn');
    const closeBtn = document.getElementById('close-project-modal');
    const tagsInput = document.getElementById('tecnologias-input');
    const saveBtn = document.getElementById('save-project-btn');
    
    // Submit do formulário - AGORA FUNCIONA
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProject();
        });
    }
    
    // Botão cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProjectModal);
    }
    
    // Fechar com X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }
    
    // Sistema de tags
    if (tagsInput) {
        tagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });
        
        tagsInput.addEventListener('blur', () => {
            if (tagsInput.value.trim()) {
                addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });
    }
    
    // Adiciona eventos aos botões de remover tags existentes
    document.querySelectorAll('.remove-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            const tagElement = this.closest('.tag');
            const tagText = tagElement.textContent.replace('×', '').trim();
            removeTag(tagText);
        });
    });
    
    // Fecha ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProjectModal();
        }
    });
    
    // Fecha com ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeProjectModal();
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Foca no primeiro campo
    setTimeout(() => {
        document.getElementById('titulo')?.focus();
    }, 300);
    
    console.log('✅ Modal de projeto aberto');
}

function closeProjectModal() {
    const modal = document.getElementById('modal-add');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.lab-modal-content');
    
    // Animação de saída
    modal.style.opacity = '0';
    modalContent.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.remove();
        
        // Reset variáveis
        tagsProjetoAtual = [];
        projetoAtual = null;
        
        console.log('✅ Modal de projeto fechado');
    }, 300);
}

function addTag(tagText) {
    tagText = tagText.trim();
    if (!tagText) return;
    
    if (tagsProjetoAtual.includes(tagText)) {
        showNotification('Esta tag já foi adicionada', 'warning');
        return;
    }
    
    tagsProjetoAtual.push(tagText);
    updateTagsDisplay();
    
    console.log(`✅ Tag adicionada: ${tagText}`);
}

function removeTag(tagText) {
    tagsProjetoAtual = tagsProjetoAtual.filter(t => t !== tagText);
    updateTagsDisplay();
    
    console.log(`❌ Tag removida: ${tagText}`);
}

function updateTagsDisplay() {
    const container = document.getElementById('tags-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (tagsProjetoAtual.length === 0) {
        const placeholder = document.createElement('span');
        placeholder.className = 'tags-placeholder';
        placeholder.textContent = 'Nenhuma tecnologia adicionada';
        container.appendChild(placeholder);
        return;
    }
    
    tagsProjetoAtual.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <button type="button" class="remove-tag" aria-label="Remover ${tag}">&times;</button>
        `;
        
        tagElement.querySelector('.remove-tag').addEventListener('click', () => {
            removeTag(tag);
        });
        
        container.appendChild(tagElement);
    });
}

async function saveProject() {
    const user = auth.currentUser;
    if (!user) {
        showNotification('Você precisa estar logado', 'error');
        return;
    }
    
    // Obtém valores do formulário
    const titulo = document.getElementById('titulo')?.value.trim() || '';
    const categoria = document.getElementById('categoria')?.value || 'web';
    const status = document.getElementById('status')?.value || 'planning';
    const descricao = document.getElementById('descricao')?.value.trim() || '';
    const link = document.getElementById('link')?.value.trim() || '';
    
    // Validação
    if (!titulo) {
        showNotification('O título é obrigatório', 'error');
        document.getElementById('titulo')?.focus();
        return;
    }
    
    // Cria ID do projeto
    const projetoId = projetoAtual?.id || 'projeto_' + Date.now();
    
    const projeto = {
        id: projetoId,
        titulo: titulo,
        categoria: categoria,
        status: status,
        dificuldade: 'intermediate',
        imagem: null,
        link: link || null,
        descricao: descricao,
        tecnologias: [...tagsProjetoAtual],
        visualizacoes: projetoAtual?.visualizacoes || 0,
        usuarioId: user.uid,
        dataAtualizacao: new Date().toISOString(),
        dataCriacao: projetoAtual?.dataCriacao || new Date().toISOString()
    };
    
    // DESABILITA o botão durante o salvamento
    const submitBtn = document.getElementById('save-project-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    submitBtn.disabled = true;
    
    try {
        showNotification('Salvando experimento...', 'loading');
        
        // Salva no Firebase
        await database.ref('users/' + user.uid + '/projetos/' + projetoId).set(projeto);
        
        // Dispara evento para recarregar criatividade
        document.dispatchEvent(new CustomEvent('project-added'));
        
        showNotification(`Experimento ${projetoAtual ? 'atualizado' : 'salvo'} com sucesso! 🎉`, 'success');
        
        // Fecha o modal
        closeProjectModal();
        
        console.log('✅ Projeto salvo:', projeto.titulo);
        
    } catch (error) {
        console.error('❌ Erro ao salvar projeto:', error);
        showNotification('Erro ao salvar experimento', 'error');
    } finally {
        // HABILITA novamente o botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===========================================
// 📊 RENDERIZAÇÃO DE PROJETOS
// ===========================================
function renderProjects(projetos) {
    const container = document.getElementById('projetos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (projetos.length === 0) {
        showEmptyState();
        return;
    }
    
    projetos.forEach(projeto => {
        const card = createProjectCard(projeto);
        container.appendChild(card);
    });
    
    // Adiciona eventos aos botões
    attachProjectEvents();
}

function createProjectCard(projeto) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = projeto.id;
    card.dataset.category = projeto.categoria || 'web';
    card.dataset.status = projeto.status || 'planning';
    
    // Status labels
    const statusLabels = {
        planning: 'Planejamento',
        development: 'Em Desenvolvimento',
        testing: 'Testes',
        completed: 'Concluído',
        paused: 'Pausado'
    };
    
    const statusColors = {
        planning: '#ffa726',
        development: '#87ceeb',
        testing: '#ffd93d',
        completed: '#90ee90',
        paused: '#ff6b6b'
    };
    
    const statusLabel = statusLabels[projeto.status] || 'Planejamento';
    const statusColor = statusColors[projeto.status] || '#ffa726';
    
    // Tags de filtro
    const filterTags = projeto.tecnologias && projeto.tecnologias.length > 0 ? 
        projeto.tecnologias.map(tag => 
            `<span class="filter-tag" data-filter="${tag.toLowerCase()}">${tag}</span>`
        ).join('') : '<span class="no-filters">Sem filtros</span>';
    
    // Imagem placeholder
    const imgHTML = `
        <div class="project-placeholder">
            <i class="fas fa-flask"></i>
        </div>`;
    
    // Link do projeto
    const linkHTML = projeto.link ? 
        `<a href="${projeto.link}" target="_blank" class="project-link">
            <i class="fas fa-external-link-alt"></i> Ver Projeto
        </a>` : '';
    
    // Tecnologias
    const techHTML = projeto.tecnologias && projeto.tecnologias.length > 0 ? 
        projeto.tecnologias.slice(0, 3).map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('') : '<span class="no-tech">Nenhuma tecnologia</span>';
    
    const moreTechHTML = projeto.tecnologias && projeto.tecnologias.length > 3 ? 
        `<span class="more-tags">+${projeto.tecnologias.length - 3}</span>` : '';
    
    card.innerHTML = `
        ${imgHTML}
        
        <div class="project-content">
            <div class="project-header">
                <h3>${projeto.titulo}</h3>
                <span class="project-status" style="background: ${statusColor}20; color: ${statusColor}" data-status="${projeto.status}">
                    ${statusLabel}
                </span>
            </div>
            
            <div class="project-filters">
                <span class="filter-label"><i class="fas fa-filter"></i> Filtros:</span>
                ${filterTags}
            </div>
            
            <p class="project-desc">${projeto.descricao?.substring(0, 120) || 'Sem descrição'}...</p>
            
            <div class="project-tags">
                ${techHTML}
                ${moreTechHTML}
            </div>
            
            <div class="project-meta">
                ${linkHTML}
                
                <div class="project-stats">
                    <span class="project-stat">
                        <i class="far fa-eye"></i> ${projeto.visualizacoes || 0}
                    </span>
                    <span class="project-stat">
                        <i class="far fa-calendar"></i> ${formatDate(projeto.dataCriacao)}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="project-actions">
            <button class="btn-edit" data-id="${projeto.id}" title="Editar" aria-label="Editar ${projeto.titulo}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" data-id="${projeto.id}" title="Deletar" aria-label="Deletar ${projeto.titulo}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

function attachProjectEvents() {
    // Botão Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = this.dataset.id;
            const projeto = projetosUsuario.find(p => p.id === projectId);
            if (projeto) {
                openProjectModal(projeto);
            }
        });
    });
    
    // Botão Deletar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            const projectId = this.dataset.id;
            const projeto = projetosUsuario.find(p => p.id === projectId);
            
            if (projeto && confirm(`Tem certeza que deseja deletar "${projeto.titulo}"?`)) {
                try {
                    showNotification('Deletando projeto...', 'loading');
                    
                    await database.ref('users/' + auth.currentUser.uid + '/projetos/' + projectId).remove();
                    
                    showNotification('Projeto deletado com sucesso!', 'success');
                    
                } catch (error) {
                    console.error('Erro ao deletar projeto:', error);
                    showNotification('Erro ao deletar projeto', 'error');
                }
            }
        });
    });
    
    // Tags de filtro
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const filter = this.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.filter-btn[data-filter="all"]`)?.classList.add('active');
            searchProjects(filter);
        });
    });
}

// ===========================================
// 🔍 SISTEMA DE BUSCA E FILTROS
// ===========================================
function searchProjects(query) {
    const cards = document.querySelectorAll('.project-card');
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
        cards.forEach(card => card.style.display = 'block');
        return;
    }
    
    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';
        const tags = Array.from(card.querySelectorAll('.tech-tag'))
            .map(tag => tag.textContent.toLowerCase())
            .join(' ');
        const filters = card.querySelector('.project-filters')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(normalizedQuery) || 
                       desc.includes(normalizedQuery) || 
                       tags.includes(normalizedQuery) ||
                       filters.includes(normalizedQuery);
        
        card.style.display = matches ? 'block' : 'none';
    });
}

function filterProjects(filter) {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            const category = card.dataset.category;
            const status = card.dataset.status;
            
            const matches = category === filter || status === filter;
            card.style.display = matches ? 'block' : 'none';
        }
    });
}

// ===========================================
// 📊 ATUALIZA ESTATÍSTICAS - CORRIGIDO
// ===========================================
function updateDashboardStats() {
    // Total de visualizações
    const totalViews = document.getElementById('total-views');
    if (totalViews) {
        const views = projetosUsuario.reduce((sum, p) => sum + (p.visualizacoes || 0), 0);
        totalViews.textContent = views;
        totalViews.classList.add('updated');
        setTimeout(() => totalViews.classList.remove('updated'), 500);
    }
    
    // Projetos concluídos
    const completedProjects = document.getElementById('completed-projects');
    if (completedProjects) {
        const completed = projetosUsuario.filter(p => p.status === 'completed').length;
        completedProjects.textContent = completed;
        completedProjects.classList.add('updated');
        setTimeout(() => completedProjects.classList.remove('updated'), 500);
    }
    
    // Projetos em andamento
    const inProgress = document.getElementById('in-progress');
    if (inProgress) {
        const progress = projetosUsuario.filter(p => 
            p.status === 'planning' || p.status === 'development' || p.status === 'testing'
        ).length;
        inProgress.textContent = progress;
        inProgress.classList.add('updated');
        setTimeout(() => inProgress.classList.remove('updated'), 500);
    }
    
    // Testes
    const collaborations = document.getElementById('collaborations');
    if (collaborations) {
        const tests = projetosUsuario.filter(p => p.status === 'testing').length;
        collaborations.textContent = tests;
        collaborations.classList.add('updated');
        setTimeout(() => collaborations.classList.remove('updated'), 500);
    }
}

// ===========================================
// 🎆 PARTÍCULAS DO DASHBOARD
// ===========================================
function initParticlesDashboard() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 30, density: { enable: true, value_area: 600 } },
            color: { value: ["#90ee90", "#87ceeb", "#ffd93d"] },
            shape: { type: "circle" },
            opacity: { value: 0.2, random: true },
            size: { value: 2, random: true },
            line_linked: {
                enable: true,
                distance: 120,
                color: "#90ee90",
                opacity: 0.1,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out"
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                resize: true
            }
        },
        retina_detect: true
    });
}

// ===========================================
// 📱 SISTEMA DE NOTIFICAÇÕES
// ===========================================
function showNotification(message, type = 'info') {
    // Remove notificações existentes
    hideNotifications();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'loading') icon = 'spinner fa-spin';
    
    notification.innerHTML = `
        <div class="notification-content">
            ${type === 'loading' ? 
                '<div class="spinner"></div>' : 
                `<i class="fas fa-${icon}"></i>`}
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    if (type !== 'loading') {
        setTimeout(() => removeNotification(notification), 3000);
    }
    
    return notification;
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
    const createBtn = document.getElementById('create-first-project');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            openProjectModal();
        });
    }
}

function formatDate(dateString, full = false) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (full) {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        if (diffDays === 0) {
            return 'Hoje';
        } else if (diffDays === 1) {
            return 'Ontem';
        } else if (diffDays < 7) {
            return `${diffDays} dias atrás`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} semanas atrás`;
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
    } catch (e) {
        return 'Data desconhecida';
    }
}

console.log('✅ Dashboard IgnisLab completamente carregado e corrigido!');