// home.js - Dashboard IgnisLab COMPLETO E FUNCIONAL
console.log('🏠 Dashboard IgnisLab - Versão 2.1 com Upload e Habilidades Funcionais');

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

let app, auth, database, storage;
try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    database = firebase.database();
    storage = firebase.storage();
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
let projetoAtual = null;
let filesToUpload = [];
let dragCounter = 0;

// ===========================================
// 🚀 INICIALIZAÇÃO
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 DOM carregado');
    initAuthCheck();
    initDashboard();
    initCriatividadeTimer();
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
    animateStatusCards();
    initDragAndDrop();

    // Event delegation universal
    document.addEventListener('click', function(e) {
        // Adicionar projeto
        if (e.target.closest('#add-project') || e.target.id === 'create-first-project') {
            e.preventDefault();
            openProjectModal();
        }
        // Editar habilidades
        if (e.target.closest('#edit-skills-btn')) {
            e.preventDefault();
            e.stopPropagation();
            openHabilidadesModal();
        }
        // Logout
        if (e.target.closest('#logout-btn')) {
            e.preventDefault();
            handleLogout();
        }
        // Importar projetos
        if (e.target.closest('#import-projects')) {
            e.preventDefault();
            openImportModal();
        }
        // Ferramenta de upload rápido
        if (e.target.closest('[data-tool="quick-upload"]')) {
            e.preventDefault();
            openProjectModal();
        }
    });

    // Sistema de tags
    document.addEventListener('keypress', function(e) {
        if (e.target.id === 'tecnologias-input' && e.key === 'Enter') {
            e.preventDefault();
            addTag(e.target.value.trim());
            e.target.value = '';
        }
        if (e.target.id === 'nova-habilidade' && e.key === 'Enter') {
            e.preventDefault();
            addHabilidadeFromInput();
        }
    });

    // Exportações
    document.getElementById('export-json')?.addEventListener('click', exportToJson);
    document.getElementById('export-pdf')?.addEventListener('click', exportToPdf);

    // Busca
    document.getElementById('search-projects')?.addEventListener('input', (e) => {
        searchProjects(e.target.value);
    });

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProjects(btn.dataset.filter);
        });
    });

    console.log('✅ Dashboard inicializado');
}

async function handleLogout() {
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
}

// ===========================================
// 📁 SISTEMA DE PROJETOS
// ===========================================
async function loadUserProjects(userId) {
    const container = document.getElementById('projetos-container');
    if (!container || !database) return;
    try {
        database.ref('users/' + userId + '/projetos').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                projetosUsuario = Object.entries(data).map(([id, projeto]) => ({
                    id,
                    ...projeto
                }));
                projetosUsuario.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
                updateProjectsCount(projetosUsuario.length);
                renderProjects(projetosUsuario);
                updateDashboardStats();
            } else {
                projetosUsuario = [];
                updateProjectsCount(0);
                updateDashboardStats();
                showEmptyState();
            }
        });
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        projetosUsuario = [];
        updateProjectsCount(0);
        showEmptyState();
    }
}

function updateProjectsCount(count) {
    const projectsCount = document.getElementById('projects-count');
    if (projectsCount) {
        projectsCount.textContent = count;
    }
}

// ===========================================
// 📝 MODAL DE PROJETO COM UPLOAD
// ===========================================
function openProjectModal(projeto = null) {
    const existingModal = document.getElementById('modal-add');
    if (existingModal) existingModal.remove();

    projetoAtual = projeto;
    tagsProjetoAtual = projeto?.tecnologias ? [...projeto.tecnologias] : [];
    filesToUpload = [];

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
                            <label for="titulo"><i class="fas fa-heading"></i> Título do Experimento *</label>
                            <input type="text" id="titulo" placeholder="Ex: Ignis Dashboard v2.0" required class="lab-input" value="${projeto?.titulo || ''}">
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="categoria"><i class="fas fa-tag"></i> Categoria</label>
                                <select id="categoria" class="lab-input">
                                    <option value="web" ${projeto?.categoria === 'web' ? 'selected' : ''}>Web</option>
                                    <option value="mobile" ${projeto?.categoria === 'mobile' ? 'selected' : ''}>Mobile</option>
                                    <option value="design" ${projeto?.categoria === 'design' ? 'selected' : ''}>Design</option>
                                    <option value="prototype" ${projeto?.categoria === 'prototype' ? 'selected' : ''}>Protótipo</option>
                                    <option value="experiment" ${projeto?.categoria === 'experiment' ? 'selected' : ''}>Experimento</option>
                                    <option value="cad" ${projeto?.categoria === 'cad' ? 'selected' : ''}>CAD/AutoCAD</option>
                                    <option value="document" ${projeto?.categoria === 'document' ? 'selected' : ''}>Documento</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="status"><i class="fas fa-tasks"></i> Status</label>
                                <select id="status" class="lab-input">
                                    <option value="planning" ${projeto?.status === 'planning' ? 'selected' : ''}>Planejamento</option>
                                    <option value="development" ${projeto?.status === 'development' ? 'selected' : ''}>Em Desenvolvimento</option>
                                    <option value="testing" ${projeto?.status === 'testing' ? 'selected' : ''}>Testes</option>
                                    <option value="completed" ${projeto?.status === 'completed' ? 'selected' : ''}>Concluído</option>
                                    <option value="paused" ${projeto?.status === 'paused' ? 'selected' : ''}>Pausado</option>
                                </select>
                            </div>
                        </div>
                        <!-- ÁREA DE UPLOAD -->
                        <div class="form-group">
                            <label><i class="fas fa-paperclip"></i> Anexar Arquivos (PDF, JSON, ZIP, DWG, etc.)</label>
                            <div class="drop-zone" id="drop-zone">
                                <div class="drop-zone-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                                <p>Arraste e solte arquivos aqui ou clique para selecionar</p>
                                <div class="file-types">
                                    <span class="file-type-badge">PDF</span>
                                    <span class="file-type-badge">JSON</span>
                                    <span class="file-type-badge">ZIP</span>
                                    <span class="file-type-badge">DWG</span>
                                    <span class="file-type-badge">Imagens</span>
                                </div>
                                <label class="custom-file-upload">
                                    <input type="file" id="file-upload" multiple 
                                        accept=".pdf,.json,.zip,.dwg,.dxf,.jpg,.jpeg,.png,.gif,.txt,.md">
                                    <i class="fas fa-folder-open"></i> Selecionar Arquivos
                                </label>
                            </div>
                            <div id="file-preview" class="file-preview">
                                ${projeto?.arquivos ? renderFilePreviews(projeto.arquivos) : 'Nenhum arquivo selecionado'}
                            </div>
                            <div id="upload-progress" class="upload-progress" style="display: none;">
                                <div class="upload-progress-bar" id="upload-progress-bar"></div>
                            </div>
                            <small class="form-hint">Máximo 10MB por arquivo. ZIPs serão extraídos automaticamente.</small>
                        </div>
                        <div class="form-group">
                            <label for="tecnologias"><i class="fas fa-code"></i> Tecnologias Utilizadas</label>
                            <div class="tags-input" id="tags-container">
                                ${tagsProjetoAtual.length > 0 ? 
                                    tagsProjetoAtual.map(tag => `<span class="tag">${tag}<button type="button" class="remove-tag">&times;</button></span>`).join('') :
                                    '<span class="tags-placeholder">Nenhuma tecnologia adicionada</span>'
                                }
                            </div>
                            <input type="text" id="tecnologias-input" placeholder="Digite uma tecnologia e pressione Enter" class="lab-input">
                            <small class="form-hint">Ex: React, Firebase, Figma, Node.js</small>
                        </div>
                        <div class="form-group">
                            <label for="descricao"><i class="fas fa-align-left"></i> Descrição</label>
                            <textarea id="descricao" placeholder="Descreva seu experimento..." rows="3" class="lab-input">${projeto?.descricao || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="link"><i class="fas fa-link"></i> URL do Projeto (opcional)</label>
                            <input type="url" id="link" placeholder="https://exemplo.com/projeto" class="lab-input" value="${projeto?.link || ''}">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="lab-btn lab-btn-outline" id="cancel-project-btn"><i class="fas fa-times"></i> Cancelar</button>
                            <button type="submit" class="lab-btn lab-btn-primary" id="save-project-btn"><i class="fas fa-save"></i> ${projeto ? 'Atualizar' : 'Salvar'} Experimento</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('modal-add');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Inicializar sistema de upload
    initFileUpload();

    // Eventos do modal
    document.getElementById('cancel-project-btn')?.addEventListener('click', closeProjectModal);
    document.getElementById('close-project-modal')?.addEventListener('click', closeProjectModal);
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) closeProjectModal(); 
    });

    // Sistema de tags
    document.getElementById('tecnologias-input')?.addEventListener('blur', (e) => {
        if (e.target.value.trim()) {
            addTag(e.target.value.trim());
            e.target.value = '';
        }
    });

    document.getElementById('tecnologias-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.target.value.trim()) {
                addTag(e.target.value.trim());
                e.target.value = '';
            }
        }
    });

    // Atualizar tags
    updateTagsDisplay();

    // Submit do formulário
    document.getElementById('form-projeto')?.addEventListener('submit', saveProject);

    setTimeout(() => document.getElementById('titulo')?.focus(), 300);
}

function renderFilePreviews(arquivos) {
    if (!arquivos || arquivos.length === 0) return 'Nenhum arquivo selecionado';
    
    return arquivos.map(file => `
        <div class="file-preview-item" data-filename="${file.nome}">
            <div class="file-info">
                <i class="${getFileIcon(file.tipo)}"></i>
                <span>${file.nome}</span>
                <span class="file-size">${formatFileSize(file.tamanho)}</span>
            </div>
            <button type="button" class="remove-file" data-filename="${file.nome}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function getFileIcon(fileType) {
    const icons = {
        'pdf': 'fas fa-file-pdf',
        'json': 'fas fa-file-code',
        'zip': 'fas fa-file-archive',
        'dwg': 'fas fa-drafting-compass',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image'
    };
    
    const ext = fileType?.split('/').pop() || 'file';
    return icons[ext] || 'fas fa-file';
}

function initFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-upload');
    const filePreview = document.getElementById('file-preview');

    if (!dropZone || !fileInput) return;

    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    // Handle drop
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Click na drop zone
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
}

function handleFiles(fileList) {
    const files = Array.from(fileList);
    
    // Validar tamanho máximo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        showNotification(`Alguns arquivos excedem 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`, 'error');
        return;
    }

    // Adicionar aos arquivos para upload
    files.forEach(file => {
        // Evitar duplicados
        if (!filesToUpload.some(f => f.name === file.name && f.size === file.size)) {
            filesToUpload.push(file);
        }
    });

    updateFilePreview();
}

function updateFilePreview() {
    const filePreview = document.getElementById('file-preview');
    if (!filePreview) return;

    if (filesToUpload.length === 0) {
        filePreview.innerHTML = 'Nenhum arquivo selecionado';
        return;
    }

    filePreview.innerHTML = filesToUpload.map(file => `
        <div class="file-preview-item" data-filename="${file.name}">
            <div class="file-info">
                <i class="${getFileIcon(file.type)}"></i>
                <span>${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="remove-file" data-filename="${file.name}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    // Adicionar eventos para remover arquivos
    filePreview.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', () => {
            const filename = btn.dataset.filename;
            filesToUpload = filesToUpload.filter(f => f.name !== filename);
            updateFilePreview();
        });
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFiles(projectId) {
    if (!filesToUpload.length) return [];

    const user = auth.currentUser;
    if (!user) return [];

    const uploadedFiles = [];
    const totalFiles = filesToUpload.length;
    let uploadedCount = 0;

    // Mostrar progresso
    const progressBar = document.getElementById('upload-progress-bar');
    const progressContainer = document.getElementById('upload-progress');
    if (progressContainer) progressContainer.style.display = 'block';

    for (const file of filesToUpload) {
        try {
            // Criar referência no storage
            const filePath = `users/${user.uid}/projects/${projectId}/${Date.now()}_${file.name}`;
            const fileRef = storage.ref(filePath);
            
            // Upload do arquivo
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();

            uploadedFiles.push({
                nome: file.name,
                tipo: file.type,
                tamanho: file.size,
                url: downloadURL,
                path: filePath,
                dataUpload: new Date().toISOString()
            });

            uploadedCount++;
            
            // Atualizar barra de progresso
            if (progressBar) {
                progressBar.style.width = `${(uploadedCount / totalFiles) * 100}%`;
            }

        } catch (error) {
            console.error('Erro ao fazer upload do arquivo:', file.name, error);
            showNotification(`Erro ao fazer upload de ${file.name}`, 'error');
        }
    }

    // Esconder barra de progresso
    if (progressContainer) {
        setTimeout(() => progressContainer.style.display = 'none', 1000);
    }

    return uploadedFiles;
}

function closeProjectModal() {
    const modal = document.getElementById('modal-add');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            tagsProjetoAtual = [];
            projetoAtual = null;
            filesToUpload = [];
        }, 300);
    }
}

function addTag(tagText) {
    tagText = tagText.trim();
    if (!tagText || tagsProjetoAtual.includes(tagText)) return;
    tagsProjetoAtual.push(tagText);
    updateTagsDisplay();
}

function removeTag(tagText) {
    tagsProjetoAtual = tagsProjetoAtual.filter(t => t !== tagText);
    updateTagsDisplay();
}

function updateTagsDisplay() {
    const container = document.getElementById('tags-container');
    if (!container) return;
    container.innerHTML = tagsProjetoAtual.length > 0
        ? tagsProjetoAtual.map(tag => `<span class="tag">${tag}<button type="button" class="remove-tag">&times;</button></span>`).join('')
        : '<span class="tags-placeholder">Nenhuma tecnologia adicionada</span>';
    
    // Adicionar eventos aos botões de remover
    container.querySelectorAll('.remove-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            const tagText = this.parentElement.textContent.replace('×', '').trim();
            removeTag(tagText);
        });
    });
}

async function saveProject(e) {
    e.preventDefault();
    const user = auth?.currentUser || (typeof firebase !== 'undefined' ? firebase.auth().currentUser : null);
    if (!user) return showNotification('Você precisa estar logado', 'error');

    const titulo = document.getElementById('titulo')?.value.trim();
    if (!titulo) return showNotification('O título é obrigatório', 'error');

    const btn = document.getElementById('save-project-btn');
    const originalText = btn?.innerHTML;
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        btn.disabled = true;
    }

    try {
        // Fazer upload dos arquivos primeiro
        let arquivos = [];
        if (filesToUpload.length > 0) {
            showNotification('Fazendo upload dos arquivos...', 'loading');
            arquivos = await uploadFiles(projetoAtual?.id || 'projeto_' + Date.now());
        }

        const projetoId = projetoAtual?.id || 'projeto_' + Date.now();
        const projeto = {
            id: projetoId,
            titulo,
            categoria: document.getElementById('categoria')?.value || 'web',
            status: document.getElementById('status')?.value || 'planning',
            descricao: document.getElementById('descricao')?.value.trim() || '',
            link: document.getElementById('link')?.value.trim() || '',
            tecnologias: [...tagsProjetoAtual],
            visualizacoes: projetoAtual?.visualizacoes || 0,
            usuarioId: user.uid,
            dataCriacao: projetoAtual?.dataCriacao || new Date().toISOString(),
            dataAtualizacao: new Date().toISOString(),
            arquivos: [...(projetoAtual?.arquivos || []), ...arquivos]
        };

        // Salvar no Firebase (com await)
        await database.ref('users/' + user.uid + '/projetos/' + projeto.id).set(projeto);

        // Atualizar lista local e UI imediatamente
        const existingIndex = projetosUsuario.findIndex(p => p.id === projeto.id);
        if (existingIndex > -1) {
            projetosUsuario[existingIndex] = projeto;
        } else {
            projetosUsuario.unshift(projeto);
        }
        updateProjectsCount(projetosUsuario.length);
        renderProjects(projetosUsuario);
        updateDashboardStats();

        document.dispatchEvent(new CustomEvent('project-added'));
        showNotification(`Experimento ${projetoAtual ? 'atualizado' : 'salvo'} com sucesso!`, 'success');
        closeProjectModal();

    } catch (err) {
        console.error('Erro ao salvar projeto:', err);
        showNotification('Erro ao salvar o projeto', 'error');
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// ===========================================
// 🧠 MODAL DE HABILIDADES (CORRIGIDO)
// ===========================================
function openHabilidadesModal() {
    const existing = document.getElementById('habilidades-modal');
    if (existing) existing.remove();

    const skillSuggestions = [
        'HTML5', 'CSS3', 'JavaScript', 'React', 'Vue.js', 'Angular',
        'Node.js', 'Python', 'Figma', 'UI/UX Design', 'Git', 'Firebase',
        'MongoDB', 'REST APIs', 'AutoCAD', 'SolidWorks', 'Photoshop',
        'Illustrator', 'Blender', '3D Modeling', 'TypeScript', 'Next.js',
        'Docker', 'AWS', 'Machine Learning', 'Data Analysis'
    ];

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
                                habilidadesUsuario.map(s => `<span class="skill-tag selected" data-skill="${s}">${s}<button type="button" class="remove-skill">&times;</button></span>`).join('') :
                                '<span class="no-skills-message">Nenhuma habilidade adicionada ainda</span>'
                            }
                        </div>
                        <div class="habilidades-input">
                            <input type="text" id="nova-habilidade" placeholder="Ex: React, Figma, AutoCAD" class="lab-input">
                            <button id="add-habilidade-btn" class="lab-btn lab-btn-outline">
                                <i class="fas fa-plus"></i> Adicionar
                            </button>
                        </div>
                        <div class="habilidades-suggestions">
                            <h4>Sugestões rápidas:</h4>
                            <div class="suggestions-grid" id="suggestions-grid">
                                ${skillSuggestions.map(s => 
                                    `<span class="skill-suggestion ${habilidadesUsuario.includes(s) ? 'selected' : ''}" data-skill="${s}">${s}</span>`
                                ).join('')}
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

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('habilidades-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Eventos
    document.getElementById('add-habilidade-btn').addEventListener('click', addHabilidadeFromInput);
    document.getElementById('save-skills-btn').addEventListener('click', saveHabilidades);
    document.getElementById('close-habilidades-modal').addEventListener('click', () => {
        closeHabilidadesModal();
    });
    
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) closeHabilidadesModal(); 
    });

    // Sugestões
    document.querySelectorAll('.skill-suggestion').forEach(el => {
        el.addEventListener('click', () => toggleHabilidadeFromSuggestion(el.dataset.skill));
    });

    // Remover habilidades
    document.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', function() {
            const skill = this.closest('.skill-tag').dataset.skill;
            removeHabilidade(skill);
        });
    });

    // Enter para adicionar habilidade
    document.getElementById('nova-habilidade')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addHabilidadeFromInput();
        }
    });

    setTimeout(() => document.getElementById('nova-habilidade')?.focus(), 300);
}

function closeHabilidadesModal() {
    const modal = document.getElementById('habilidades-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function addHabilidadeFromInput() {
    const input = document.getElementById('nova-habilidade');
    const skill = input?.value.trim();
    
    if (skill && !habilidadesUsuario.includes(skill)) {
        addHabilidadeToList(skill);
        input.value = '';
        input.focus();
    }
}

function addHabilidadeToList(skill) {
    if (!skill || habilidadesUsuario.includes(skill)) return;
    
    habilidadesUsuario.push(skill);
    
    // Atualizar UI
    const container = document.getElementById('selected-habilidades');
    if (container) {
        // Remover mensagem de "nenhuma habilidade"
        const noSkillsMsg = container.querySelector('.no-skills-message');
        if (noSkillsMsg) noSkillsMsg.remove();
        
        // Adicionar nova tag
        const tag = document.createElement('span');
        tag.className = 'skill-tag selected';
        tag.dataset.skill = skill;
        tag.innerHTML = `${skill}<button type="button" class="remove-skill">&times;</button>`;
        container.appendChild(tag);
        
        // Adicionar evento de remover
        tag.querySelector('.remove-skill').addEventListener('click', () => {
            removeHabilidade(skill);
        });
    }
    
    // Atualizar sugestões
    const suggestion = document.querySelector(`.skill-suggestion[data-skill="${skill}"]`);
    if (suggestion) suggestion.classList.add('selected');
}

function removeHabilidade(skill) {
    habilidadesUsuario = habilidadesUsuario.filter(s => s !== skill);
    
    // Remover da UI
    const tag = document.querySelector(`.skill-tag[data-skill="${skill}"]`);
    if (tag) tag.remove();
    
    // Atualizar sugestões
    const suggestion = document.querySelector(`.skill-suggestion[data-skill="${skill}"]`);
    if (suggestion) suggestion.classList.remove('selected');
    
    // Mostrar mensagem se não houver habilidades
    const container = document.getElementById('selected-habilidades');
    if (container && habilidadesUsuario.length === 0 && !container.querySelector('.no-skills-message')) {
        container.innerHTML = '<span class="no-skills-message">Nenhuma habilidade adicionada ainda</span>';
    }
}

function toggleHabilidadeFromSuggestion(skill) {
    if (habilidadesUsuario.includes(skill)) {
        removeHabilidade(skill);
    } else {
        addHabilidadeToList(skill);
    }
}

async function saveHabilidades() {
    const user = auth?.currentUser || (typeof firebase !== 'undefined' ? firebase.auth().currentUser : null);
    if (!user) return showNotification('Você precisa estar logado', 'error');
    
    try {
        await database.ref('users/' + user.uid + '/habilidades').set(habilidadesUsuario || []);
        
        // Atualizar UI em múltiplos containers para garantir visibilidade
        updateHabilidadesUI();
        updateSkillsDisplaysFallback(habilidadesUsuario || []);
        
        closeHabilidadesModal();
        showNotification('Habilidades salvas com sucesso!', 'success');
    } catch (err) {
        console.error('Erro ao salvar habilidades:', err);
        showNotification('Erro ao salvar habilidades', 'error');
    }
}

// novo: atualiza containers alternativos usados em outros scripts/templates
function updateSkillsDisplaysFallback(skills) {
    // atualiza #skills-tags-container, #skills-list e .skills-display
    skills = Array.isArray(skills) ? skills : [];
    const containers = [
        document.getElementById('skills-tags-container'),
        document.getElementById('skills-list'),
        document.querySelector('.skills-display')
    ].filter(Boolean);

    containers.forEach(container => {
        container.innerHTML = '';
        if (skills.length === 0) {
            container.innerHTML = '<span class="no-skills-placeholder">Nenhuma habilidade</span>';
            return;
        }
        skills.slice(0, 10).forEach(s => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = s;
            container.appendChild(tag);
        });
        if (skills.length > 10) {
            const more = document.createElement('span');
            more.className = 'skill-tag more';
            more.textContent = `+${skills.length - 10}`;
            more.title = skills.slice(10).join(', ');
            container.appendChild(more);
        }
    });
}

// ===========================================
// 📁 SISTEMA DE IMPORT/EXPORT
// ===========================================
function openImportModal() {
    const modalHTML = `
        <div id="import-modal" class="lab-modal">
            <div class="lab-modal-content modal-small">
                <div class="modal-header">
                    <h2><i class="fas fa-file-import"></i> Importar Projetos</h2>
                    <button class="modal-close" id="close-import-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="import-export-section">
                        <h4>Escolha o formato de importação:</h4>
                        <div class="import-export-buttons">
                            <button id="import-json" class="lab-btn lab-btn-outline">
                                <i class="fas fa-file-code"></i> Importar JSON
                            </button>
                            <button id="import-zip" class="lab-btn lab-btn-outline">
                                <i class="fas fa-file-archive"></i> Importar ZIP
                            </button>
                        </div>
                        <div class="drop-zone" id="import-drop-zone">
                            <div class="drop-zone-icon">
                                <i class="fas fa-file-import"></i>
                            </div>
                            <p>Arraste e solte arquivos aqui para importação em lote</p>
                            <small class="form-hint">Suporta: .json, .zip</small>
                        </div>
                        <div id="import-preview"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('import-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Eventos
    document.getElementById('close-import-modal').addEventListener('click', closeImportModal);
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) closeImportModal(); 
    });

    document.getElementById('import-json').addEventListener('click', () => {
        triggerFileInput('.json');
    });

    document.getElementById('import-zip').addEventListener('click', () => {
        triggerFileInput('.zip');
    });

    // Configurar drag and drop para importação
    initImportDropZone();
}

function closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function triggerFileInput(accept) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => handleImportFile(e.target.files[0]);
    input.click();
}

function initImportDropZone() {
    const dropZone = document.getElementById('import-drop-zone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleImportFile(files[0]);
        }
    }, false);

    dropZone.addEventListener('click', () => {
        triggerFileInput('.json,.zip');
    });
}

async function handleImportFile(file) {
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
        showNotification('Você precisa estar logado para importar', 'error');
        return;
    }

    const fileName = file.name.toLowerCase();

    try {
        showNotification(`Processando ${file.name}...`, 'loading');

        if (fileName.endsWith('.json')) {
            await importJsonFile(file);
        } else if (fileName.endsWith('.zip')) {
            await importZipFile(file);
        } else {
            showNotification('Formato de arquivo não suportado', 'error');
        }
    } catch (error) {
        console.error('Erro ao importar arquivo:', error);
        showNotification('Erro ao importar arquivo', 'error');
    }
}

async function importJsonFile(file) {
    const text = await file.text();
    const projetos = JSON.parse(text);
    
    if (!Array.isArray(projetos)) {
        showNotification('Formato JSON inválido', 'error');
        return;
    }

    const user = auth.currentUser;
    let importedCount = 0;

    for (const projeto of projetos) {
        try {
            const projetoId = projeto.id || 'projeto_' + Date.now() + Math.random();
            
            // Adicionar metadados
            const projetoCompleto = {
                ...projeto,
                id: projetoId,
                usuarioId: user.uid,
                dataCriacao: projeto.dataCriacao || new Date().toISOString(),
                dataAtualizacao: new Date().toISOString(),
                visualizacoes: projeto.visualizacoes || 0
            };

            await database.ref('users/' + user.uid + '/projetos/' + projetoId).set(projetoCompleto);
            importedCount++;
        } catch (error) {
            console.error('Erro ao importar projeto:', projeto.titulo, error);
        }
    }

    closeImportModal();
    showNotification(`${importedCount} projetos importados com sucesso!`, 'success');
}

async function importZipFile(file) {
    if (typeof JSZip === 'undefined') {
        showNotification('Biblioteca ZIP não carregada', 'error');
        return;
    }

    const zip = await JSZip.loadAsync(file);
    const user = auth.currentUser;
    let importedCount = 0;

    // Procurar por arquivos JSON no ZIP
    for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (filename.toLowerCase().endsWith('.json') && !zipEntry.dir) {
            try {
                const content = await zipEntry.async('text');
                const projeto = JSON.parse(content);
                
                const projetoId = projeto.id || 'projeto_' + Date.now() + Math.random();
                
                const projetoCompleto = {
                    ...projeto,
                    id: projetoId,
                    usuarioId: user.uid,
                    dataCriacao: projeto.dataCriacao || new Date().toISOString(),
                    dataAtualizacao: new Date().toISOString(),
                    visualizacoes: projeto.visualizacoes || 0
                };

                await database.ref('users/' + user.uid + '/projetos/' + projetoId).set(projetoCompleto);
                importedCount++;
            } catch (error) {
                console.error('Erro ao importar projeto do ZIP:', filename, error);
            }
        }
    }

    closeImportModal();
    showNotification(`${importedCount} projetos importados do ZIP!`, 'success');
}

function exportToJson() {
    if (projetosUsuario.length === 0) {
        showNotification('Nenhum projeto para exportar', 'warning');
        return;
    }

    const data = JSON.stringify(projetosUsuario, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ignislab-projetos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Projetos exportados para JSON!', 'success');
}

async function exportToPdf() {
    if (projetosUsuario.length === 0) {
        showNotification('Nenhum projeto para exportar', 'warning');
        return;
    }

    showNotification('Gerando PDF...', 'loading');

    try {
        // Carregar bibliotecas necessárias
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        if (typeof jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        const printArea = document.createElement('div');
        printArea.style.cssText = `
            position: fixed;
            left: -9999px;
            top: -9999px;
            width: 800px;
            padding: 40px;
            background: white;
            color: black;
            font-family: 'Roboto Mono', monospace;
        `;

        printArea.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0a0a0f; margin-bottom: 10px;">Meus Experimentos - IgnisLab</h1>
                <p style="color: #666;">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
                <hr style="border: 1px solid #90ee90; margin: 20px 0;">
            </div>
            ${projetosUsuario.map((projeto, index) => `
                <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid;">
                    <h2 style="color: #0a0a0f; margin-bottom: 10px;">${index + 1}. ${projeto.titulo}</h2>
                    <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                        <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 0.9em;">
                            Categoria: ${projeto.categoria}
                        </span>
                        <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 0.9em;">
                            Status: ${projeto.status}
                        </span>
                    </div>
                    <p style="line-height: 1.6; margin-bottom: 15px;">${projeto.descricao || 'Sem descrição'}</p>
                    ${projeto.tecnologias?.length ? `
                        <div style="margin-bottom: 15px;">
                            <strong>Tecnologias:</strong> ${projeto.tecnologias.join(', ')}
                        </div>
                    ` : ''}
                    ${projeto.link ? `
                        <div style="margin-bottom: 15px;">
                            <strong>Link:</strong> <a href="${projeto.link}" style="color: #90ee90;">${projeto.link}</a>
                        </div>
                    ` : ''}
                    <div style="font-size: 0.9em; color: #666;">
                        Criado em: ${formatDate(projeto.dataCriacao, true)}
                    </div>
                </div>
            `).join('')}
        `;

        document.body.appendChild(printArea);

        const canvas = await html2canvas(printArea, { 
            scale: 2,
            useCORS: true,
            logging: false
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png', 1.0);

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`ignislab-projetos-${new Date().toISOString().split('T')[0]}.pdf`);

        printArea.remove();
        showNotification('PDF gerado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showNotification('Erro ao gerar PDF', 'error');
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ===========================================
// 📊 ANIMAÇÕES E STATUS
// ===========================================
function animateStatusCards() {
    const creativeMeter = document.getElementById('creative-meter');
    const creativeValue = document.getElementById('creative-value');
    if (creativeMeter && creativeValue) {
        const update = () => {
            creativeMeter.style.width = criatividadeLevel + '%';
            creativeValue.textContent = Math.round(criatividadeLevel) + '%';
            if (criatividadeLevel > 70) creativeMeter.style.background = 'linear-gradient(90deg, #90ee90, #87ceeb)';
            else if (criatividadeLevel > 40) creativeMeter.style.background = 'linear-gradient(90deg, #ffd93d, #ffa726)';
            else creativeMeter.style.background = 'linear-gradient(90deg, #ff6b6b, #ffa726)';
        };
        update();
        setInterval(update, 1000);
    }

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
    updateProjectsCount(0);
}

function initCriatividadeTimer() {
    const saved = localStorage.getItem('ignislab-criatividade');
    if (saved) criatividadeLevel = parseFloat(saved);
    timerCriatividade = setInterval(() => {
        if (criatividadeLevel > 0) {
            criatividadeLevel -= 0.5;
            if (criatividadeLevel < 0) criatividadeLevel = 0;
            localStorage.setItem('ignislab-criatividade', criatividadeLevel);
        }
    }, 600000);
    document.addEventListener('project-added', () => {
        if (criatividadeLevel < 95) {
            criatividadeLevel = Math.min(100, criatividadeLevel + 15);
            localStorage.setItem('ignislab-criatividade', criatividadeLevel);
            showNotification('✨ Criatividade recarregada!', 'success');
        }
    });
}

// ===========================================
// 🖱️ DRAG & DROP PARA PROJETOS
// ===========================================
function initDragAndDrop() {
    let dragged = null;
    
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('project-card')) {
            dragged = e.target;
            e.target.classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('project-card')) {
            e.target.classList.remove('dragging');
            dragged = null;
        }
    });
    
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        const after = getDragAfterElement(document.querySelector('#projetos-container'), e.clientY);
        const dragging = document.querySelector('.dragging');
        if (after == null) {
            document.querySelector('#projetos-container').appendChild(dragging);
        } else {
            document.querySelector('#projetos-container').insertBefore(dragging, after);
        }
    });
}

function getDragAfterElement(container, y) {
    const notDragging = [...container.querySelectorAll('.project-card:not(.dragging)')];
    return notDragging.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ===========================================
// 📊 RENDERIZAÇÃO DE PROJETOS
// ===========================================
function renderProjects(projetos) {
    const container = document.getElementById('projetos-container');
    if (!container) return;
    
    container.innerHTML = projetos.length === 0 ? '' : projetos.map(createProjectCard).join('');
    
    if (projetos.length === 0) {
        showEmptyState();
    } else {
        attachProjectEvents();
    }
}

function createProjectCard(projeto) {
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
    const hasFiles = projeto.arquivos && projeto.arquivos.length > 0;

    return `
        <div class="project-card ${hasFiles ? 'has-file' : ''}" draggable="true" 
             data-id="${projeto.id}" data-category="${projeto.categoria}" data-status="${projeto.status}">
            
            ${hasFiles ? `<div class="file-indicator"><i class="fas fa-paperclip"></i> ${projeto.arquivos.length}</div>` : ''}
            
            <div class="project-placeholder">
                <i class="fas fa-flask"></i>
            </div>
            
            <div class="project-content">
                <div class="project-header">
                    <h3>${projeto.titulo}</h3>
                    <span class="project-status" style="background:${statusColor}20;color:${statusColor}">
                        ${statusLabel}
                    </span>
                </div>
                
                <p class="project-desc">${(projeto.descricao || '').substring(0, 120)}${projeto.descricao?.length > 120 ? '...' : ''}</p>
                
                <div class="project-tags">
                    ${(projeto.tecnologias || []).slice(0, 3).map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    ${(projeto.tecnologias || []).length > 3 ? `<span class="more-tags">+${projeto.tecnologias.length - 3}</span>` : ''}
                </div>
                
                <div class="project-meta">
                    ${projeto.link ? `
                        <a href="${projeto.link}" target="_blank" class="project-link">
                            <i class="fas fa-external-link-alt"></i> Ver Projeto
                        </a>
                    ` : ''}
                    
                    <div class="project-stats">
                        <span class="project-stat">
                            <i class="far fa-eye"></i> ${projeto.visualizacoes || 0}
                        </span>
                        <span class="project-stat">
                            <i class="far fa-calendar"></i> ${formatDate(projeto.dataCriacao)}
                        </span>
                        ${hasFiles ? `
                            <span class="project-stat">
                                <i class="fas fa-paperclip"></i> ${projeto.arquivos.length}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="project-actions">
                <button class="btn-edit" data-id="${projeto.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${projeto.id}" title="Deletar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function attachProjectEvents() {
    // Editar projeto
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const projeto = projetosUsuario.find(p => p.id === btn.dataset.id);
            if (projeto) openProjectModal(projeto);
        });
    });
    
    // Deletar projeto
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const projeto = projetosUsuario.find(p => p.id === btn.dataset.id);
            if (projeto && confirm(`Tem certeza que deseja deletar "${projeto.titulo}"?`)) {
                try {
                    const user = auth.currentUser;
                    await database.ref('users/' + user.uid + '/projetos/' + projeto.id).remove();
                    showNotification('Projeto deletado com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao deletar projeto:', error);
                    showNotification('Erro ao deletar projeto', 'error');
                }
            }
        });
    });
    
    // Visualizar arquivos
    document.querySelectorAll('.file-indicator').forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectCard = indicator.closest('.project-card');
            const projeto = projetosUsuario.find(p => p.id === projectCard.dataset.id);
            if (projeto?.arquivos) {
                showFilesModal(projeto.arquivos, projeto.titulo);
            }
        });
    });
}

function showFilesModal(files, title) {
    const modalHTML = `
        <div class="lab-modal active">
            <div class="lab-modal-content modal-small">
                <div class="modal-header">
                    <h2><i class="fas fa-paperclip"></i> Arquivos - ${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="files-list">
                        ${files.map(file => `
                            <div class="file-item">
                                <div class="file-icon">
                                    <i class="${getFileIcon(file.tipo)}"></i>
                                </div>
                                <div class="file-info">
                                    <h4>${file.nome}</h4>
                                    <p>${formatFileSize(file.tamanho)} • ${new Date(file.dataUpload).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div class="file-actions">
                                    <a href="${file.url}" target="_blank" class="lab-btn lab-btn-outline">
                                        <i class="fas fa-download"></i>
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
    
    // Fechar modal
    modalDiv.querySelector('.modal-close').addEventListener('click', () => {
        modalDiv.remove();
    });
    
    modalDiv.querySelector('.lab-modal').addEventListener('click', (e) => {
        if (e.target === modalDiv.querySelector('.lab-modal')) {
            modalDiv.remove();
        }
    });
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
}

// ===========================================
// 🔍 BUSCA E FILTROS
// ===========================================
function searchProjects(query) {
    const cards = document.querySelectorAll('.project-card');
    const normalizedQuery = query.toLowerCase().trim();
    
    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';
        const tags = Array.from(card.querySelectorAll('.tech-tag'))
            .map(tag => tag.textContent.toLowerCase())
            .join(' ');
        
        const matches = title.includes(normalizedQuery) || 
                       desc.includes(normalizedQuery) || 
                       tags.includes(normalizedQuery);
        
        card.style.display = matches || normalizedQuery === '' ? 'block' : 'none';
    });
}

function filterProjects(filter) {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        const category = card.dataset.category;
        const status = card.dataset.status;
        const hasFiles = card.classList.contains('has-file');
        
        let shouldShow = false;
        
        switch(filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'file':
                shouldShow = hasFiles;
                break;
            default:
                shouldShow = category === filter;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

// ===========================================
// 📊 ATUALIZAR ESTATÍSTICAS
// ===========================================
function updateDashboardStats() {
    const totalViews = projetosUsuario.reduce((sum, p) => sum + (p.visualizacoes || 0), 0);
    const completed = projetosUsuario.filter(p => p.status === 'completed').length;
    const inProgress = projetosUsuario.filter(p => ['planning','development','testing'].includes(p.status)).length;
    const totalFiles = projetosUsuario.reduce((sum, p) => sum + (p.arquivos?.length || 0), 0);
    
    document.getElementById('total-views').textContent = totalViews;
    document.getElementById('completed-projects').textContent = completed;
    document.getElementById('in-progress').textContent = inProgress;
    document.getElementById('files-count').textContent = totalFiles;
}

// ===========================================
// 📱 NOTIFICAÇÕES
// ===========================================
function showNotification(message, type = 'info') {
    hideNotifications();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        loading: 'fas fa-spinner fa-spin',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icons[type] || 'fas fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Estilos dinâmicos
    const colors = {
        success: '#90ee90',
        error: '#ff6b6b',
        warning: '#ffd93d',
        loading: '#87ceeb',
        info: '#87ceeb'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(10, 10, 15, 0.98);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        border-left: 5px solid ${colors[type] || '#87ceeb'};
        z-index: 10000;
        animation: slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        backdrop-filter: blur(20px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        max-width: 350px;
        min-width: 300px;
        transform-origin: top right;
        border: 1px solid rgba(144, 238, 144, 0.1);
        display: flex;
        align-items: center;
    `;
    
    if (type === 'loading') {
        notification.querySelector('.fa-spinner').style.animation = 'spin 1s linear infinite';
    }
    
    // Remover automaticamente (exceto loading)
    if (type !== 'loading') {
        setTimeout(() => {
            hideNotification(notification);
        }, 3000);
    }
    
    return notification;
}

function hideNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

function hideNotifications() {
    document.querySelectorAll('.notification').forEach(hideNotification);
}

// ===========================================
// 🛠️ UTILITÁRIOS
// ===========================================
function formatDate(dateString, full = false) {
    try {
        const date = new Date(dateString);
        if (full) return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const diff = (new Date() - date) / (1000 * 60 * 60 * 24);
        if (diff < 1) return 'Hoje';
        if (diff < 2) return 'Ontem';
        if (diff < 7) return `${Math.floor(diff)} dias atrás`;
        if (diff < 30) return `${Math.floor(diff / 7)} semanas atrás`;
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch (e) {
        return 'Data desconhecida';
    }
}

function initParticlesDashboard() {
    if (typeof particlesJS === 'undefined') return;
    
    particlesJS('particles-js', {
        particles: {
            number: { 
                value: 40, 
                density: { 
                    enable: true, 
                    value_area: 800 
                } 
            },
            color: { 
                value: ["#90ee90", "#87ceeb", "#ffd93d"] 
            },
            shape: { 
                type: "circle" 
            },
            opacity: { 
                value: 0.2, 
                random: true 
            },
            size: { 
                value: 3, 
                random: true 
            },
            line_linked: { 
                enable: true, 
                distance: 150, 
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
                onhover: { 
                    enable: true, 
                    mode: "grab" 
                }, 
                resize: true 
            } 
        },
        retina_detect: true
    });
}

// ===========================================
// 🎨 ANIMAÇÕES CSS DINÂMICAS
// ===========================================
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
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
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    .project-card.dragging {
        opacity: 0.5;
        transform: rotate(2deg);
    }

    /* Responsividade para modal small */
    .lab-modal .lab-modal-content.modal-small {
        width: min(900px, 95vw);
        max-width: 95vw;
        padding: 16px;
        box-sizing: border-box;
    }
    .lab-modal .lab-modal-content .modal-body {
        max-height: calc(100vh - 180px);
        overflow: auto;
    }
    .project-embed iframe {
        width: 100%;
        height: 360px;
        border: none;
        border-radius: 8px;
    }
    @media (max-width: 600px) {
        .project-embed iframe { height: 260px; }
        .lab-modal .lab-modal-content.modal-small { padding: 12px; }
    }
`;
document.head.appendChild(dynamicStyles);

console.log('✅ Dashboard IgnisLab 2.1 completamente carregado!');