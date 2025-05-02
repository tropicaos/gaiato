/* TABLE OF CONTENTS
    1. Taskbar Initialization (initializeTaskbar)
    2. Clock Management (updateClock)
    3. Start Menu Management (initializeStartMenu, createMenuItem) - CORRIGIDO MOBILE/HOVER
    4. Taskbar Icons Management (addTaskbarIcon)
    5. Mobile Scroll Utility (setupMobileScroll) - CORRIGIDO CURSOR
*/

/* 1. Taskbar Initialization */
function initializeTaskbar() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const clockContainer = document.getElementById('clock');
    const taskbar = document.getElementById('taskbar');

    const taskbarIconsContainer = document.createElement('div');
    taskbarIconsContainer.id = 'taskbar-icons';
    // Estilos taskbarIconsContainer (mantidos)
    taskbarIconsContainer.style.display = 'flex'; taskbarIconsContainer.style.gap = '2px'; taskbarIconsContainer.style.marginLeft = '4px';
    taskbarIconsContainer.style.flexGrow = '1'; taskbarIconsContainer.style.overflowX = 'auto'; taskbarIconsContainer.style.overflowY = 'hidden';
    taskbarIconsContainer.style.whiteSpace = 'nowrap'; taskbarIconsContainer.style.scrollbarWidth = 'none'; taskbarIconsContainer.style.msOverflowStyle = 'none';
    taskbarIconsContainer.style['-webkit-overflow-scrolling'] = 'touch'; taskbarIconsContainer.style.scrollBehavior = 'smooth';
    taskbarIconsContainer.style.height = '100%'; taskbarIconsContainer.style.alignItems = 'center';

    const style = document.createElement('style'); style.textContent = '#taskbar-icons::-webkit-scrollbar { display: none; }'; document.head.appendChild(style);

    // Tray Container (mantido)
    const trayContainer = document.createElement('div'); trayContainer.id = 'tray-icons';
    trayContainer.style.display = 'flex'; trayContainer.style.alignItems = 'center'; trayContainer.style.marginLeft = 'auto'; trayContainer.style.marginRight = '4px'; trayContainer.style.height = '100%';
    const displayIcon = document.createElement('img'); displayIcon.src = 'assets/icons/tela.ico'; displayIcon.style.width = '16px'; displayIcon.style.height = '16px'; displayIcon.title = 'Tela'; trayContainer.appendChild(displayIcon);
    const volumeIcon = document.createElement('img'); volumeIcon.src = 'assets/icons/volume.ico'; volumeIcon.style.width = '16px'; volumeIcon.style.height = '16px'; volumeIcon.style.marginLeft = '3px'; volumeIcon.title = 'Volume'; trayContainer.appendChild(volumeIcon);

    taskbar.insertBefore(taskbarIconsContainer, clockContainer);
    taskbar.insertBefore(trayContainer, clockContainer);

    updateClock();
    initializeStartMenu(); // Chama a função atualizada
    setupMobileScroll(taskbarIconsContainer); // Chama a função atualizada

    console.log('[taskbar] Taskbar inicializada');
}

/* 2. Clock Management */
function updateClock() { // Mantido igual
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;
    const setTime = () => { const now = new Date(); const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); let timeSpan = clockElement.querySelector('.time-display'); if (!timeSpan) { timeSpan = document.createElement('span'); timeSpan.className = 'time-display'; clockElement.insertBefore(timeSpan, clockElement.firstChild); timeSpan.style.marginRight = '5px'; } timeSpan.textContent = timeString; };
    setTime(); setInterval(setTime, 1000 * 60);
    console.log('[taskbar] Relógio inicializado');
}

/* 3. Start Menu Management - CORRIGIDO MOBILE/HOVER */
function initializeStartMenu() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    let activeSubmenu = null; // Guarda referência ao submenu ativo

    // Abre/Fecha Menu Principal
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = startMenu.style.display === 'block';
        startMenu.style.display = isVisible ? 'none' : 'block';
        // Se fechar o menu principal, esconde qualquer submenu ativo
        if (isVisible && activeSubmenu) {
            activeSubmenu.style.display = 'none';
            activeSubmenu = null;
        }
        startMenu.style.zIndex = '1002';
    });

    // Fecha tudo ao clicar fora
    document.addEventListener('click', (e) => {
        if (startMenu.style.display === 'block' && !startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.style.display = 'none';
            if (activeSubmenu) {
                activeSubmenu.style.display = 'none';
                activeSubmenu = null;
            }
        }
    });

    startMenu.innerHTML = ''; // Limpa

    // Sidebar (será ajustada pelo CSS)
    const sidebar = document.createElement('div');
    sidebar.className = 'menu-sidebar';
    sidebar.textContent = 'Gaiat.OS 97';
    startMenu.appendChild(sidebar);

    const menuItemsContainer = document.createElement('div');
    menuItemsContainer.className = 'menu-items-container';
    startMenu.appendChild(menuItemsContainer);

    // Função para criar itens e submenus
    const createMenuItem = (text, iconSrc, submenuItems = null, action = null, isSeparator = false) => {
        if (isSeparator) { /* ... cria separador ... */
            const separator = document.createElement('div'); separator.className = 'menu-separator'; menuItemsContainer.appendChild(separator); return;
        }

        const item = document.createElement('div'); item.className = 'menu-item'; item.style.position = 'relative';
        const icon = document.createElement('img'); icon.src = iconSrc; icon.style.width = '16px'; icon.style.height = '16px'; icon.style.marginRight = '8px'; item.appendChild(icon);
        const textSpan = document.createElement('span'); textSpan.textContent = text; textSpan.style.flexGrow = 1; item.appendChild(textSpan);

        if (submenuItems) { // Se tem submenu
            const triangle = document.createElement('span'); triangle.className = 'submenu-triangle'; triangle.innerHTML = '▶'; item.appendChild(triangle);

            const submenu = document.createElement('div'); submenu.className = 'submenu'; submenu.style.display = 'none'; submenu.style.position = 'absolute'; submenu.style.zIndex = '1003';
            // Adiciona o submenu ao container principal ANTES de popular, para cálculo de posição
            menuItemsContainer.appendChild(submenu);

            submenuItems.forEach(app => { // Popula o submenu
                if (app.separator) { const sep = document.createElement('div'); sep.className = 'menu-separator'; submenu.appendChild(sep); return; }
                const appItem = document.createElement('div'); appItem.className = 'menu-item';
                const appIcon = document.createElement('img'); appIcon.src = app.icon; appIcon.style.width = '16px'; appIcon.style.height = '16px'; appIcon.style.marginRight = '8px'; appItem.appendChild(appIcon);
                const appText = document.createElement('span'); appText.textContent = app.title; appItem.appendChild(appText);
                appItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`[taskbar] Clicado em ${app.id || app.title}`);
                    if (app.action) app.action();
                    startMenu.style.display = 'none'; submenu.style.display = 'none'; activeSubmenu = null; // Fecha tudo
                });
                submenu.appendChild(appItem);
            });

            // --- LÓGICA DE CLIQUE PARA SUBMENU (Substitui Hover) ---
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const isSubmenuVisible = submenu.style.display === 'block';

                // Esconde o submenu ativo anteriormente (se for diferente deste)
                if (activeSubmenu && activeSubmenu !== submenu) {
                    activeSubmenu.style.display = 'none';
                }

                // Mostra ou esconde o submenu atual
                submenu.style.display = isSubmenuVisible ? 'none' : 'block';
                activeSubmenu = isSubmenuVisible ? null : submenu; // Atualiza referência ativa

                if (!isSubmenuVisible) { // Se acabou de mostrar, calcula posição
                    const itemRect = item.getBoundingClientRect();
                    const menuRect = startMenu.getBoundingClientRect();
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    const taskbarHeight = 32;

                    // Posição padrão: à direita do item
                    let targetLeft = menuRect.left + itemRect.width;
                    let targetTop = itemRect.top;

                    // Precisa calcular dimensões DEPOIS de tornar visível
                    const subRect = submenu.getBoundingClientRect();

                    // Verifica se cabe na direita, senão tenta esquerda
                    if (targetLeft + subRect.width > screenWidth) {
                        targetLeft = menuRect.left - subRect.width;
                    }
                    // Garante que não vá para fora à esquerda
                     if (targetLeft < 0) targetLeft = 0;

                    // Verifica se cabe embaixo, senão tenta alinhar acima
                    if (targetTop + subRect.height > screenHeight - taskbarHeight) {
                        targetTop = itemRect.bottom - subRect.height;
                    }
                    // Garante que não vá para fora acima
                     if (targetTop < 0) targetTop = 0;

                    submenu.style.left = `${targetLeft - menuRect.left}px`; // Relativo ao startMenu
                    submenu.style.top = `${targetTop - menuRect.top}px`;   // Relativo ao startMenu
                }
            });

        } else { // Item normal (sem submenu)
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`[taskbar] Clicado em ${text}`);
                if (action) action();
                startMenu.style.display = 'none'; // Fecha menu principal
                if (activeSubmenu) { activeSubmenu.style.display = 'none'; activeSubmenu = null; } // Fecha submenu se houver
            });
        }
        menuItemsContainer.appendChild(item); // Adiciona item principal
    };

    // --- Define a Estrutura do Menu ---
    createMenuItem('Programas', 'assets/icons/Programs.ico', [
        { ...window.appConfig['benji'], action: () => openWindow('benji') }, { separator: true },
        { ...window.appConfig['poligonal'], action: () => openWindow('poligonal') }, // Placeholders agora abrem alerta via openWindow
        { ...window.appConfig['gaiato'], action: () => openWindow('gaiato') }
    ]);
    createMenuItem('Acessórios', 'assets/icons/acessorios.ico', [
        { ...window.appConfig['notepad'], action: () => openWindow('notepad') },
        { ...window.appConfig['pinto'], action: () => openWindow('pinto') }
    ]);
    createMenuItem('', '', null, null, true); // Separador
    createMenuItem('Configurações', 'assets/icons/configs.ico', null, () => openWindow('system-properties'));
    createMenuItem('Ajuda', 'assets/icons/ajuda.ico', null, () => openWindow('help'));
    createMenuItem('', '', null, null, true); // Separador
    createMenuItem('Desligar...', 'assets/icons/desligar.ico', null, () => openWindow('shutdown'));
}


/* 4. Taskbar Icons Management */
window.addTaskbarIcon = function(windowId, appName, appSettings) { // Mantido igual (usa button)
    if (!windowManager.windows[windowId]) { console.warn(`[taskbar] Janela ${windowId} não encontrada ao adicionar ícone.`); return; }
    if (windowManager.windows[windowId].taskIcon) return;
    const taskbarIconsContainer = document.getElementById('taskbar-icons'); if (!taskbarIconsContainer) return;
    const taskIcon = document.createElement('button'); taskIcon.className = 'button task-icon'; taskIcon.dataset.windowId = windowId;
    const iconImg = document.createElement('img'); iconImg.src = appSettings.icon; iconImg.style.width = '16px'; iconImg.style.height = '16px'; taskIcon.appendChild(iconImg);
    const iconText = document.createElement('span'); iconText.textContent = appSettings.title || appName; taskIcon.appendChild(iconText);
    taskIcon.addEventListener('click', () => { const win = windowManager.windows[windowId]; if (!win) { taskIcon.remove(); return; } const winDiv = win.windowDiv; const isMinimized = winDiv.style.display === 'none'; const isActive = taskIcon.classList.contains('active'); if (isMinimized) { winDiv.style.display = 'block'; winDiv.style.zIndex = windowManager.zIndex++; taskIcon.classList.remove('minimized'); taskIcon.classList.add('active'); winDiv.querySelector('.title-bar')?.classList.remove('inactive'); Object.keys(windowManager.windows).forEach(id => { if (id !== windowId) { windowManager.windows[id].taskIcon?.classList.remove('active'); windowManager.windows[id].windowDiv.querySelector('.title-bar')?.classList.add('inactive'); } }); } else { if (isActive) { winDiv.style.display = 'none'; taskIcon.classList.add('minimized'); taskIcon.classList.remove('active'); winDiv.querySelector('.title-bar')?.classList.add('inactive'); } else { winDiv.style.zIndex = windowManager.zIndex++; taskIcon.classList.add('active'); winDiv.querySelector('.title-bar')?.classList.remove('inactive'); Object.keys(windowManager.windows).forEach(id => { if (id !== windowId) { windowManager.windows[id].taskIcon?.classList.remove('active'); windowManager.windows[id].windowDiv.querySelector('.title-bar')?.classList.add('inactive'); } }); } } });
    taskbarIconsContainer.appendChild(taskIcon); windowManager.windows[windowId].taskIcon = taskIcon;
};

/* 5. Mobile Scroll Utility - CORRIGIDO CURSOR */
function setupMobileScroll(scrollContainer) {
     let isDragging = false; let startX, scrollLeft;
     const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

     const startDrag = (e) => {
         isDragging = true;
         startX = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
         scrollLeft = scrollContainer.scrollLeft;
         // Aplica cursor grabbing APENAS se NÃO for touch (ou seja, mouse drag)
         if (!isTouchDevice) {
            scrollContainer.style.cursor = 'grabbing';
         }
         scrollContainer.style.userSelect = 'none';
     };
     const stopDrag = () => {
         if (!isDragging) return;
         isDragging = false;
          // Restaura cursor padrão APENAS se NÃO for touch
         if (!isTouchDevice) {
             scrollContainer.style.cursor = 'grab';
         }
         scrollContainer.style.userSelect = '';
     };
     const doDrag = (e) => {
         if (!isDragging) return;
         e.preventDefault(); // Previne scroll da página se estiver arrastando a taskbar
         const x = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
         const walk = (x - startX) * 1.5; // Sensibilidade
         scrollContainer.scrollLeft = scrollLeft - walk;
     };

     // Adiciona listeners de mouse
     scrollContainer.addEventListener('mousedown', startDrag);
     scrollContainer.addEventListener('mouseup', stopDrag);
     scrollContainer.addEventListener('mouseleave', stopDrag); // Para drag do mouse sair
     scrollContainer.addEventListener('mousemove', doDrag);

     // Adiciona listeners de toque SE for dispositivo touch
     if (isTouchDevice) {
        scrollContainer.addEventListener('touchstart', startDrag, { passive: false });
        scrollContainer.addEventListener('touchend', stopDrag);
        scrollContainer.addEventListener('touchcancel', stopDrag);
        scrollContainer.addEventListener('touchmove', doDrag, { passive: false });
     }

     // Define cursor inicial (APENAS se não for touch)
      if (!isTouchDevice) {
          scrollContainer.style.cursor = 'grab';
      }
 }