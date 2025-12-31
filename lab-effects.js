// lab-effects.js
// Sistema de efeitos visuais e interatividade para o laboratório
// VERSÃO COMPLETA E FUNCIONAL - Todos os botões funcionando

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 IgnisLab Effects Iniciado');
    
    // 🌟 INICIALIZAÇÃO
    initParticles();
    initExperimentTubes();
    initGaugeSystem();
    initDoorInteraction();
    initSoundSystem();
    initTerminalAnimation();
    initModalEffects(); // ← CORRIGIDO: Todos os botões funcionam
    initSocialTubes();
    initStepAnimations();
    initScrollEffects();
});

// ===========================================
// 🎆 SISTEMA DE PARTÍCULAS
// ===========================================
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: ["#90ee90", "#87ceeb", "#ffd93d", "#ffa726"] },
                shape: { type: ["circle", "triangle"], stroke: { width: 0, color: "#000000" } },
                opacity: { value: 0.3, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.5, sync: false } },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#90ee90",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: { enable: false, rotateX: 600, rotateY: 1200 }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 200, line_linked: { opacity: 0.5 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
        
        console.log('✅ Partículas inicializadas');
    } else {
        console.warn('⚠️ Biblioteca particles.js não encontrada');
        createFallbackStars();
    }
}

function createFallbackStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    document.body.appendChild(starsContainer);
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.opacity = Math.random() * 0.5 + 0.1;
        star.style.animationDelay = Math.random() * 5 + 's';
        starsContainer.appendChild(star);
    }
}

// ===========================================
// 🧪 TUBOS DE ENSAIO INTERATIVOS
// ===========================================
function initExperimentTubes() {
    const tubes = document.querySelectorAll('.experiment-tube');
    
    tubes.forEach(tube => {
        tube.addEventListener('mouseenter', function(e) {
            this.style.transform = 'translateY(-15px) scale(1.08)';
            this.style.boxShadow = '0 0 40px rgba(144, 238, 144, 0.4)';
            
            const bubbles = this.querySelector('.bubbles');
            if (bubbles) {
                bubbles.style.transform = 'scale(1.2)';
            }
            
            playBubbleSound();
        });
        
        tube.addEventListener('mouseleave', function(e) {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 0 30px rgba(144, 238, 144, 0.3)';
            
            const bubbles = this.querySelector('.bubbles');
            if (bubbles) {
                bubbles.style.transform = 'scale(1)';
            }
        });
        
        tube.addEventListener('click', function(e) {
            if (!e.target.closest('.tube-label')) {
                const experimentId = this.dataset.experiment;
                showExperimentInfo(experimentId);
            }
        });
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                const liquid = tube.querySelector('.tube-liquid');
                if (liquid) {
                    liquid.style.transform = `scale(${1 + Math.random() * 0.1})`;
                    setTimeout(() => {
                        liquid.style.transform = 'scale(1)';
                    }, 300);
                }
            }
        }, 2000 + Math.random() * 3000);
    });
}

function showExperimentInfo(id) {
    const info = {
        '1': 'UI/UX Design: Criação de interfaces intuitivas e experiências de usuário memoráveis.',
        '2': 'Desenvolvimento Web: Aplicações modernas com React, Vue e tecnologias de ponta.',
        '3': 'Animações: Micro-interações e animações fluidas que encantam usuários.',
        '4': 'Firebase: Backend-as-a-Service para aplicações escaláveis e em tempo real.'
    };
    
    const modal = document.createElement('div');
    modal.className = 'experiment-modal';
    modal.innerHTML = `
        <div class="experiment-modal-content">
            <button class="close-experiment-modal">&times;</button>
            <h3>Experimento ${id}</h3>
            <p>${info[id] || 'Informações detalhadas sobre esta área de expertise.'}</p>
            <div class="chemical-formula">
                <span>H₂O + Creativity = 🚀</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(5, 5, 8, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: modalFadeIn 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.experiment-modal-content');
    modalContent.style.cssText = `
        background: rgba(26, 26, 46, 0.95);
        padding: 40px;
        border-radius: 20px;
        max-width: 500px;
        border: 2px solid #90ee90;
        position: relative;
        animation: modalSlideIn 0.3s ease;
    `;
    
    modal.querySelector('.close-experiment-modal').onclick = () => {
        modal.style.animation = 'modalFadeOut 0.3s ease forwards';
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.animation = 'modalFadeOut 0.3s ease forwards';
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes modalSlideIn { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .chemical-formula {
            margin-top: 20px;
            padding: 15px;
            background: rgba(144, 238, 144, 0.1);
            border-radius: 10px;
            font-family: monospace;
            font-size: 1.2rem;
            text-align: center;
            border-left: 4px solid #87ceeb;
        }
        .close-experiment-modal {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: #90ee90;
            font-size: 2rem;
            cursor: pointer;
            transition: transform 0.3s;
        }
        .close-experiment-modal:hover { transform: rotate(90deg); }
    `;
    document.head.appendChild(style);
}

// ===========================================
// 📊 SISTEMA DO MEDIDOR DE CRIATIVIDADE
// ===========================================
function initGaugeSystem() {
    const gaugeFill = document.getElementById('creativity-gauge');
    const gaugeValue = document.getElementById('gauge-value');
    
    if (!gaugeFill || !gaugeValue) return;
    
    let creativityLevel = 87;
    
    function animateGauge() {
        const fluctuation = Math.sin(Date.now() / 5000) * 3;
        const currentValue = Math.max(70, Math.min(98, creativityLevel + fluctuation));
        
        gaugeFill.style.width = currentValue + '%';
        gaugeValue.textContent = Math.round(currentValue) + '%';
        
        if (currentValue > 90) {
            gaugeFill.style.background = 'linear-gradient(90deg, #90ee90, #87ceeb)';
        } else if (currentValue > 80) {
            gaugeFill.style.background = 'linear-gradient(90deg, #87ceeb, #90ee90)';
        } else {
            gaugeFill.style.background = 'linear-gradient(90deg, #ffd93d, #90ee90)';
        }
        
        requestAnimationFrame(animateGauge);
    }
    
    animateGauge();
    
    document.addEventListener('click', () => {
        if (creativityLevel < 95) {
            creativityLevel += 0.1;
            gaugeFill.style.transform = 'scale(1.02, 1.1)';
            setTimeout(() => {
                gaugeFill.style.transform = 'scale(1, 1)';
            }, 150);
        }
    });
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (creativityLevel < 92) {
            creativityLevel += 0.05;
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const decayInterval = setInterval(() => {
                if (creativityLevel > 87) {
                    creativityLevel -= 0.02;
                } else {
                    clearInterval(decayInterval);
                }
            }, 1000);
        }, 1000);
    });
}

// ===========================================
// 🚪 INTERAÇÃO COM A PORTA DO LABORATÓRIO
// ===========================================
function initDoorInteraction() {
    const doorSection = document.querySelector('.lab-door');
    
    if (!doorSection) return;
    
    doorSection.addEventListener('mouseenter', () => {
        doorSection.style.transform = 'translateY(-5px)';
        doorSection.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
    
    doorSection.addEventListener('mouseleave', () => {
        doorSection.style.transform = 'translateY(0)';
    });
    
    const burningText = document.querySelector('.text-burning');
    if (burningText) {
        const originalText = burningText.textContent;
        burningText.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                burningText.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                setInterval(() => {
                    burningText.style.opacity = burningText.style.opacity === '0.9' ? '1' : '0.9';
                }, 1500);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
}

// ===========================================
// 🔊 SISTEMA DE SOM
// ===========================================
function initSoundSystem() {
    const soundToggle = document.getElementById('sound-toggle');
    const ambientAudio = document.getElementById('lab-ambient');
    
    if (!soundToggle || !ambientAudio) return;
    
    let soundEnabled = false;
    
    soundToggle.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        
        if (soundEnabled) {
            ambientAudio.volume = 0.3;
            ambientAudio.play().catch(e => {
                console.log('🔇 Autoplay bloqueado');
                soundEnabled = false;
            });
            this.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.style.color = '#90ee90';
        } else {
            ambientAudio.pause();
            this.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.style.color = '#87ceeb';
        }
    });
    
    window.playBubbleSound = function() {
        if (!soundEnabled) return;
        
        try {
            const bubbleSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bubble-pop-up-3001.mp3');
            bubbleSound.volume = 0.2;
            bubbleSound.play();
        } catch (e) {}
    };
    
    window.playDoorSound = function() {
        if (!soundEnabled) return;
        
        try {
            const doorSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-door-opens-3005.mp3');
            doorSound.volume = 0.3;
            doorSound.play();
        } catch (e) {}
    };
}

// ===========================================
// 💻 ANIMAÇÃO DO TERMINAL
// ===========================================
function initTerminalAnimation() {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;
    
    const lines = [
        { cmd: 'cat projetos_ativos.txt', output: '>> [Web Apps: 12] [Mobile: 8] [UI Designs: 24]' },
        { cmd: 'cat tecnologias.txt', output: '>> React, Vue, Firebase, Node.js, Three.js' },
        { cmd: 'ls -la skills/', output: '>> Frontend: ⭐⭐⭐⭐⭐ Backend: ⭐⭐⭐⭐ DevOps: ⭐⭐⭐' },
        { cmd: 'cat status.txt', output: '>> Criatividade: Alta | Disponibilidade: Aberto a projetos' }
    ];
    
    let currentLine = 0;
    let isDeleting = false;
    let currentText = '';
    
    function typeTerminal() {
        const current = lines[currentLine % lines.length];
        const target = isDeleting ? '' : (current.cmd + '\n' + current.output);
        
        if (!isDeleting && currentText === target) {
            isDeleting = true;
            setTimeout(typeTerminal, 2000);
            return;
        }
        
        if (isDeleting && currentText === '') {
            isDeleting = false;
            currentLine++;
            setTimeout(typeTerminal, 500);
            return;
        }
        
        currentText = isDeleting 
            ? target.substring(0, currentText.length - 1)
            : target.substring(0, currentText.length + 1);
        
        const linesHtml = currentText.split('\n').map((line, i) => {
            if (i % 2 === 0) {
                return `<div class="terminal-line"><span class="prompt">$</span> ${line}</div>`;
            } else {
                return `<div class="terminal-line"><span class="output">${line}</span></div>`;
            }
        }).join('');
        
        terminalBody.innerHTML = linesHtml + `<div class="terminal-line"><span class="cursor">█</span></div>`;
        
        const speed = isDeleting ? 50 : 100;
        setTimeout(typeTerminal, speed + Math.random() * 50);
    }
    
    setTimeout(typeTerminal, 2000);
}

// ===========================================
// 🔐 EFEITOS DO MODAL - VERSÃO CORRIGIDA
// ===========================================
function initModalEffects() {
    console.log('🔄 Inicializando efeitos do modal...');
    
    // Aguarda um pouco para garantir DOM carregado
    setTimeout(() => {
        // Configura event delegation para capturar todos os cliques
        document.addEventListener('click', function(event) {
            const target = event.target;
            
            // Verifica se o clique foi em algum botão que deve abrir o modal
            if (target.matches('#enter-lab-btn, #lab-login-btn, #cta-login') || 
                target.closest('#enter-lab-btn, #lab-login-btn, #cta-login')) {
                
                console.log('🎯 Botão clicado para abrir modal:', target.id || target.className);
                openLoginModal();
                
                // Efeito sonoro para o botão da porta
                if (target.id === 'enter-lab-btn' || target.closest('#enter-lab-btn')) {
                    if (window.playDoorSound) {
                        window.playDoorSound();
                    }
                }
                
                event.preventDefault();
                event.stopPropagation();
            }
        });
        
        // Configura fechamento do modal
        const modal = document.getElementById('lab-login-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.modal-close');
            
            // Fechar com botão X
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    closeLoginModal();
                });
            }
            
            // Fechar ao clicar fora
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeLoginModal();
                }
            });
            
            // Fechar com ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    closeLoginModal();
                }
            });
        }
        
        console.log('✅ Efeitos do modal inicializados');
    }, 200);
}

// Funções globais para abrir/fechar modal
window.openLoginModal = function() {
    const modal = document.getElementById('lab-login-modal');
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    console.log('🚪 Abrindo modal de login...');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Adiciona animação de entrada
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
    
    // Foca no primeiro campo
    setTimeout(() => {
        const firstInput = modal.querySelector('input[type="email"], input[type="text"]');
        if (firstInput) {
            firstInput.focus();
        }
    }, 300);
};

window.closeLoginModal = function() {
    const modal = document.getElementById('lab-login-modal');
    if (!modal) return;
    
    console.log('🚪 Fechando modal de login...');
    
    // Animação de saída
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
        document.body.style.overflow = '';
    }, 300);
};

// ===========================================
// 👥 TUBOS SOCIAIS
// ===========================================
function initSocialTubes() {
    const socialTubes = document.querySelectorAll('.social-tube');
    
    socialTubes.forEach(tube => {
        tube.addEventListener('mouseenter', function() {
            const liquid = this.querySelector('.social-liquid');
            if (liquid) {
                liquid.style.opacity = '0.3';
                liquid.style.transform = 'scale(1.2)';
            }
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(15deg) scale(1.2)';
            }
        });
        
        tube.addEventListener('mouseleave', function() {
            const liquid = this.querySelector('.social-liquid');
            if (liquid) {
                liquid.style.opacity = '0';
                liquid.style.transform = 'scale(1)';
            }
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(0) scale(1)';
            }
        });
        
        tube.addEventListener('click', function() {
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1.1)';
            }, 100);
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
            
            createClickParticles(this);
        });
    });
}

function createClickParticles(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #90ee90;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${x}px;
            top: ${y}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const duration = 500 + Math.random() * 500;
        const startTime = Date.now();
        
        function animateParticle() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                particle.remove();
                return;
            }
            
            const currentX = x + Math.cos(angle) * speed * elapsed / 10;
            const currentY = y + Math.sin(angle) * speed * elapsed / 10;
            
            particle.style.left = currentX + 'px';
            particle.style.top = currentY + 'px';
            particle.style.opacity = 1 - progress;
            
            requestAnimationFrame(animateParticle);
        }
        
        animateParticle();
    }
}

// ===========================================
// 🔥 ANIMAÇÕES DOS PASSOS
// ===========================================
function initStepAnimations() {
    const steps = document.querySelectorAll('.process-step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('step-visible');
                
                const elements = entry.target.querySelectorAll('h3, p, .step-number');
                elements.forEach((el, index) => {
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, index * 200);
                });
            }
        });
    }, { threshold: 0.3 });
    
    steps.forEach(step => {
        const elements = step.querySelectorAll('h3, p, .step-number');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        
        observer.observe(step);
        
        step.addEventListener('mouseenter', function() {
            const spark = this.querySelector('.step-spark, .step-bubble, .step-melt, .step-crystal');
            if (spark) {
                spark.style.opacity = '0.6';
                spark.style.transform = 'scale(1.5)';
            }
        });
        
        step.addEventListener('mouseleave', function() {
            const spark = this.querySelector('.step-spark, .step-bubble, .step-melt, .step-crystal');
            if (spark) {
                spark.style.opacity = '0.2';
                spark.style.transform = 'scale(1)';
            }
        });
    });
}

// ===========================================
// 📜 EFEITOS DE SCROLL
// ===========================================
function initScrollEffects() {
    let lastScrollTop = 0;
    const nav = document.querySelector('.lab-nav');
    
    if (!nav) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            nav.style.background = 'rgba(10, 10, 15, 0.95)';
            nav.style.backdropFilter = 'blur(15px)';
        } else {
            nav.style.background = 'rgba(10, 10, 15, 0.8)';
            nav.style.backdropFilter = 'blur(10px)';
        }
        
        const doorSection = document.querySelector('.lab-door');
        if (doorSection) {
            const scrolled = scrollTop * 0.1;
            doorSection.style.backgroundPosition = `center ${scrolled}px`;
        }
        
        lastScrollTop = scrollTop;
    });
}

// ===========================================
// 🏁 FINALIZAÇÃO
// ===========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('loaded');
        
        // Verifica se os botões estão funcionando
        console.log('🔍 Verificando elementos da landing page:');
        console.log('- enter-lab-btn:', document.getElementById('enter-lab-btn'));
        console.log('- lab-login-btn:', document.getElementById('lab-login-btn'));
        console.log('- cta-login:', document.getElementById('cta-login'));
        console.log('- lab-login-modal:', document.getElementById('lab-login-modal'));
        
        console.log('✅ IgnisLab completamente carregado!');
    }, 1000);
});

// Adiciona estilos CSS dinâmicos
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    /* Animações para o modal */
    @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes modalFadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    
    /* Melhorias para botões */
    #enter-lab-btn, #lab-login-btn, #cta-login {
        cursor: pointer !important;
        position: relative;
        z-index: 10;
    }
    
    #enter-lab-btn:hover, #lab-login-btn:hover, #cta-login:hover {
        transform: translateY(-2px) !important;
        transition: transform 0.3s ease !important;
    }
    
    /* Garante que o modal esteja acima de tudo */
    #lab-login-modal {
        z-index: 9999 !important;
    }
    
    /* Responsividade */
    @media (max-width: 768px) {
        .lab-modal-content {
            width: 95% !important;
            max-width: 95% !important;
            margin: 10px !important;
        }
    }
`;
document.head.appendChild(dynamicStyles);

console.log('🎉 lab-effects.js carregado com sucesso!');