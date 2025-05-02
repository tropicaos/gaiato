/* TABLE OF CONTENTS
    1. Taskbar Initialization (initializeTaskbar)
    2. Clock Management (updateClock)
    3. Start Menu Management (initializeStartMenu, createMenuItem)
       - Mantém estrutura/estilo do main.css por enquanto
       - Removido sublinhado automático da primeira letra
    4. Taskbar Icons Management (addTaskbarIcon)
    5. Mobile Scroll Utility (setupMobileScroll)
*/

/* 1. Taskbar Initialization */
function initializeTaskbar() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const clockContainer = document.getElementById('clock');
    const taskbar = document.getElementById('taskbar');

    const taskbarIconsContainer = document.createElement('div');
    taskbarIconsContainer.id = 'taskbar-icons';
    taskbarIconsContainer.style.display = 'flex';
    taskbarIconsContainer.style.gap = '2px';
    taskbarIconsContainer.style.marginLeft = '4px';
    taskbarIconsContainer.style.flexGrow = '1';
    taskbarIconsContainer.style.overflowX = 'auto';
    taskbarIconsContainer.style.overflowY = 'hidden';
    taskbarIconsContainer.style.whiteSpace = 'nowrap';
    taskbarIconsContainer.style.scrollbarWidth = 'none';
    taskbarIconsContainer.style.msOverflowStyle = 'none';
    taskbarIconsContainer.style['-webkit-overflow-scrolling'] = 'touch';
    taskbarIconsContainer.style.scrollBehavior = 'smooth';
    taskbarIconsContainer.style.height = '100%';
    taskbarIconsContainer.style.alignItems = 'center';

    const style = document.createElement('style');
    style.textContent = '#taskbar-icons::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);

    const trayContainer = document.createElement('div');
    trayContainer.id = 'tray-icons';
    trayContainer.style.display = 'flex';
    trayContainer.style.alignItems = 'center';
    trayContainer.style.marginLeft = 'auto';
    trayContainer.style.marginRight = '4px';
    trayContainer.style.height = '100%';

    const displayIcon = document.createElement('img');
    displayIcon.src = 'assets/icons/tela.ico';
    displayIcon.style.width = '16px'; displayIcon.style.height = '16px';
    displayIcon.title = 'Tela';
    trayContainer.appendChild(displayIcon);

    const volumeIcon = document.createElement('img');
    volumeIcon.src = 'assets/icons/volume.ico';
    volumeIcon.style.width = '16px'; volumeIcon.style.height = '16px';
    volumeIcon.style.marginLeft = '3px';
    volumeIcon.title = 'Volume';
    trayContainer.appendChild(volumeIcon);

    taskbar.insertBefore(taskbarIconsContainer, clockContainer);
    taskbar.insertBefore(trayContainer, clockContainer);

    updateClock();
    initializeStartMenu();
    setupMobileScroll(taskbarIconsContainer);

    console.log('[taskbar] Taskbar inicializada');
}

/* 2. Clock Management */
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;
    const setTime = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let timeSpan = clockElement.querySelector('.time-display');
        if (!timeSpan) {
            timeSpan = document.createElement('span');
            timeSpan.className = 'time-display';
            clockElement.insertBefore(timeSpan, clockElement.firstChild);
            timeSpan.style.marginRight = '5px';
        }
        timeSpan.textContent = timeString;
    };
    setTime();
    setInterval(setTime, 1000 * 60); // Atualiza a cada minuto
    console.log('[taskbar] Relógio inicializado');
}

/* 3. Start Menu Management */
function initializeStartMenu() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    let clickTimeout = null;

    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = startMenu.style.display === 'block';
        startMenu.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) document.querySelectorAll('.submenu').forEach(submenu => submenu.style.display = 'none');
        startMenu.style.zIndex = '1002';
    });

    document.addEventListener('click', (e) => {
        if (startMenu.style.display === 'block' && !startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.style.display = 'none';
        }
    });

    startMenu.innerHTML = '';

    const sidebar = document.createElement('div');
    sidebar.className = 'menu-sidebar';
    sidebar.textContent = 'Gaiat.OS 97';
    startMenu.appendChild(sidebar);

    const menuItemsContainer = document.createElement('div');
    menuItemsContainer.className = 'menu-items-container';
    startMenu.appendChild(menuItemsContainer);

    const createMenuItem = (text, iconSrc, submenuItems = null, action = null, isSeparator = false) => {
        if (isSeparator) { /* ... código do separador ... */
            const separator = document.createElement('div');
            separator.style.height = '2px'; separator.style.borderTop = '1px solid var(--button-shadow, #808080)';
            separator.style.borderBottom = '1px solid var(--button-highlight, #ffffff)'; separator.style.margin = '4px 0';
            menuItemsContainer.appendChild(separator); return;
        }

        const item = document.createElement('div');
        item.className = 'menu-item'; item.style.position = 'relative';

        const icon = document.createElement('img');
        icon.src = iconSrc; icon.style.width = '16px'; icon.style.height = '16px'; icon.style.marginRight = '5px';
        item.appendChild(icon);

        const textSpan = document.createElement('span');
        // !!! REMOVIDO O SUBLINHADO AUTOMÁTICO !!!
        textSpan.textContent = text; // Apenas o texto normal
        textSpan.style.flexGrow = 1;
        item.appendChild(textSpan);

        if (submenuItems) { /* ... lógica de criar submenu (sem o sublinhado nos itens) ... */
            const triangle = document.createElement('span'); triangle.innerHTML = '▶';
            triangle.style.marginLeft = 'auto'; triangle.style.fontSize = '8px'; item.appendChild(triangle);

            const submenu = document.createElement('div'); submenu.className = 'submenu';
            submenu.style.display = 'none'; submenu.style.position = 'absolute'; submenu.style.zIndex = '1003';

            submenuItems.forEach(app => {
                if (app.separator) { /* ... separador no submenu ... */
                     const sep = document.createElement('div'); sep.style.height = '2px'; sep.style.borderTop = '1px solid var(--button-shadow, #808080)';
                     sep.style.borderBottom = '1px solid var(--button-highlight, #ffffff)'; sep.style.margin = '4px 0'; submenu.appendChild(sep); return;
                 }
                const appItem = document.createElement('div'); appItem.className = 'menu-item'; appItem.style.padding = '5px 10px';
                const appIcon = document.createElement('img'); appIcon.src = app.icon; appIcon.style.width = '16px'; appIcon.style.height = '16px'; appIcon.style.marginRight = '5px'; appItem.appendChild(appIcon);
                const appText = document.createElement('span');
                // !!! REMOVIDO O SUBLINHADO AUTOMÁTICO !!!
                appText.textContent = app.title; // Apenas o texto normal
                appItem.appendChild(appText);
                appItem.addEventListener('click', (e) => { /* ... lógica de clique no item do submenu ... */
                     e.stopPropagation(); if (clickTimeout) return;
                     clickTimeout = setTimeout(() => {
                         console.log(`[taskbar] Clicado em ${app.id || app.title}`);
                         if (app.action) app.action(); else console.log(`[taskbar] Ação não definida para ${app.title}`);
                         startMenu.style.display = 'none'; submenu.style.display = 'none'; clickTimeout = null;
                     }, 150);
                 });
                submenu.appendChild(appItem);
            });

            // Lógica de Hover (mantida)
            item.addEventListener('mouseenter', () => { /* ... mostra/posiciona submenu ... */
                 item.parentNode.querySelectorAll('.submenu').forEach(sub => { if(sub !== submenu) sub.style.display = 'none'});
                 submenu.style.display = 'block'; const itemRect = item.getBoundingClientRect();
                 submenu.style.left = `${itemRect.width -4}px`; submenu.style.top = `${item.offsetTop -2}px`;
                 const submenuRect = submenu.getBoundingClientRect();
                 if (submenuRect.right > window.innerWidth) submenu.style.left = `-${submenuRect.width -4}px`;
                 if (submenuRect.bottom > (window.innerHeight - 32)) submenu.style.top = `${item.offsetTop - submenuRect.height + itemRect.height + 2}px`;
             });
             item.addEventListener('mouseleave', (e) => { if (!submenu.contains(e.relatedTarget)) submenu.style.display = 'none'; });
             submenu.addEventListener('mouseleave', (e) => { if (!item.contains(e.relatedTarget)) submenu.style.display = 'none'; });

            menuItemsContainer.appendChild(submenu);
        } else { // Item sem submenu
            item.addEventListener('click', (e) => { /* ... lógica de clique no item principal ... */
                 e.stopPropagation(); if (clickTimeout) return;
                 clickTimeout = setTimeout(() => {
                     console.log(`[taskbar] Clicado em ${text}`);
                     if (action) action(); else console.log(`[taskbar] Ação não definida para ${text}`);
                     startMenu.style.display = 'none'; clickTimeout = null;
                 }, 150);
             });
        }
        menuItemsContainer.appendChild(item);
    };

    // --- Define a Estrutura do Menu (sem sublinhados automáticos) ---
    createMenuItem('Programas', 'assets/icons/Programs.ico', [
        { ...window.appConfig['benji'], action: () => openWindow('benji') }, { separator: true },
        { ...window.appConfig['poligonal'], action: () => openWindow('poligonal') },
        { ...window.appConfig['gaiato'], action: () => openWindow('gaiato') }
    ]);
    createMenuItem('Acessórios', 'assets/icons/acessorios.ico', [
        { ...window.appConfig['notepad'], action: () => openWindow('notepad') },
        { ...window.appConfig['pinto'], action: () => openWindow('pinto') }
    ]);
    createMenuItem('', '', null, null, true);
    createMenuItem('Configurações', 'assets/icons/configs.ico', null, () => openWindow('system-properties'));
    createMenuItem('Ajuda', 'assets/icons/ajuda.ico', null, () => openWindow('help'));
    createMenuItem('', '', null, null, true);
    createMenuItem('Desligar...', 'assets/icons/desligar.ico', null, () => openWindow('shutdown'));
}

/* 4. Taskbar Icons Management */
window.addTaskbarIcon = function(windowId, appName, appSettings) {
    if (!windowManager.windows[windowId]) { // Checa se a janela ainda existe antes de adicionar ícone
        console.warn(`[taskbar] Janela ${windowId} não encontrada ao tentar adicionar ícone para ${appName}.`);
        return;
    }
     if (windowManager.windows[windowId].taskIcon) return; // Já tem ícone

    const taskbarIconsContainer = document.getElementById('taskbar-icons');
    if (!taskbarIconsContainer) return;

    const taskIcon = document.createElement('button');
    taskIcon.className = 'button task-icon'; // Classes base + customizada
    taskIcon.dataset.windowId = windowId;

    const iconImg = document.createElement('img');
    iconImg.src = appSettings.icon; icon.style.width = '16px'; icon.style.height = '16px'; icon.style.marginRight = '5px';
    taskIcon.appendChild(iconImg);

    const iconText = document.createElement('span');
    iconText.textContent = appSettings.title || appName;
    taskIcon.appendChild(iconText);

    taskIcon.addEventListener('click', () => { /* ... lógica de clique no ícone (mantida da versão anterior) ... */
        const win = windowManager.windows[windowId];
         if (!win) { taskIcon.remove(); return; }
         const winDiv = win.windowDiv; const isMinimized = winDiv.style.display === 'none';
         const isActive = taskIcon.classList.contains('active');
         if (isMinimized) { // Restaura e ativa
             winDiv.style.display = 'block'; winDiv.style.zIndex = windowManager.zIndex++;
             taskIcon.classList.remove('minimized'); taskIcon.classList.add('active');
             winDiv.querySelector('.title-bar')?.classList.remove('inactive');
             Object.keys(windowManager.windows).forEach(id => { if (id !== windowId) { windowManager.windows[id].taskIcon?.classList.remove('active'); windowManager.windows[id].windowDiv.querySelector('.title-bar')?.classList.add('inactive'); } });
         } else { // Visível
             if (isActive) { // Minimiza
                 winDiv.style.display = 'none'; taskIcon.classList.add('minimized'); taskIcon.classList.remove('active'); winDiv.querySelector('.title-bar')?.classList.add('inactive');
             } else { // Ativa
                 winDiv.style.zIndex = windowManager.zIndex++; taskIcon.classList.add('active'); winDiv.querySelector('.title-bar')?.classList.remove('inactive');
                 Object.keys(windowManager.windows).forEach(id => { if (id !== windowId) { windowManager.windows[id].taskIcon?.classList.remove('active'); windowManager.windows[id].windowDiv.querySelector('.title-bar')?.classList.add('inactive'); } });
             }
         }
     });

    taskbarIconsContainer.appendChild(taskIcon);
    windowManager.windows[windowId].taskIcon = taskIcon; // Associa ao estado da janela
};

/* 5. Mobile Scroll Utility */
function setupMobileScroll(scrollContainer) { /* ... lógica de scroll (mantida da versão anterior) ... */
     let isDragging = false; let startX, scrollLeft;
     const startDrag = (e) => { isDragging = true; startX = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft; scrollLeft = scrollContainer.scrollLeft; scrollContainer.style.cursor = 'grabbing'; scrollContainer.style.userSelect = 'none'; };
     const stopDrag = () => { if (!isDragging) return; isDragging = false; scrollContainer.style.cursor = 'grab'; scrollContainer.style.userSelect = ''; };
     const doDrag = (e) => { if (!isDragging) return; e.preventDefault(); const x = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft; const walk = (x - startX) * 1.5; scrollContainer.scrollLeft = scrollLeft - walk; };
     scrollContainer.addEventListener('mousedown', startDrag); scrollContainer.addEventListener('touchstart', startDrag, { passive: false });
     scrollContainer.addEventListener('mouseup', stopDrag); scrollContainer.addEventListener('mouseleave', stopDrag); scrollContainer.addEventListener('touchend', stopDrag); scrollContainer.addEventListener('touchcancel', stopDrag);
     scrollContainer.addEventListener('mousemove', doDrag); scrollContainer.addEventListener('touchmove', doDrag, { passive: false });
     scrollContainer.style.cursor = 'grab';
 }