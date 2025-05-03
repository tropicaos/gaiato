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
    if (taskbarIconsContainer) {
        setupMobileScroll(taskbarIconsContainer); // Chama a função atualizada
    } else {
        console.error('[taskbar] taskbarIconsContainer não foi inicializado corretamente.');
    }

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

/* 3. Start Menu Management - REFEITO */
function initializeStartMenu() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    let activeSubmenu = null; // Guarda referência ao submenu DOM element ativo
    let menuTimeout = null; // Timeout para hover no desktop

    // --- Event Listeners Principais ---
    // Abrir/Fechar Menu Principal
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = startMenu.style.display === 'block';
        if (isVisible) {
            closeAllMenus();
        } else {
            startMenu.style.display = 'flex'; // Usa flex para layout correto
            startMenu.style.zIndex = '1002';
        }
    });

    // Fechar tudo ao clicar fora
    document.addEventListener('click', (e) => {
        if (startMenu.style.display === 'flex' && !startButton.contains(e.target) && !startMenu.contains(e.target)) {
            closeAllMenus();
        }
    });

    // Função para fechar todos os menus
    function closeAllMenus() {
        startMenu.style.display = 'none';
        if (activeSubmenu) {
            activeSubmenu.style.display = 'none';
            activeSubmenu = null;
        }
    }

    // --- Recriação do Conteúdo do Menu ---
    startMenu.innerHTML = ''; // Limpa

    // Sidebar Vertical (Estilo via CSS)
    const sidebar = document.createElement('div');
    sidebar.className = 'menu-sidebar';
    const sidebarText = document.createElement('span');
    sidebarText.className = 'menu-sidebar-text';
    sidebarText.textContent = 'Gaiat.OS 97';
    sidebar.appendChild(sidebarText);
    startMenu.appendChild(sidebar);

    // Container Principal dos Itens
    const menuItemsContainer = document.createElement('div');
    menuItemsContainer.className = 'menu-items-container';
    startMenu.appendChild(menuItemsContainer);

    // --- Função Auxiliar para Criar Itens ---
    const createMenuItem = (itemData, parentContainer) => {
        // Cria Separador
        if (itemData.separator) {
            const separator = document.createElement('div');
            separator.className = 'menu-separator';
            parentContainer.appendChild(separator);
            return;
        }

        // Cria Item Principal
        const item = document.createElement('div');
        item.className = 'menu-item';

        const icon = document.createElement('img');
        icon.src = itemData.icon || 'assets/icons/Programs.ico'; // Usa default se não houver
        icon.style.width = '20px'; icon.style.height = '20px'; icon.style.marginRight = '8px';
        item.appendChild(icon);

        const textSpan = document.createElement('span');
        textSpan.textContent = itemData.title;
        item.appendChild(textSpan);

        // Se tem Submenu
        if (itemData.submenu) {
            const triangle = document.createElement('span');
            triangle.className = 'submenu-triangle';
            triangle.innerHTML = '▶';
            item.appendChild(triangle);

            const submenu = document.createElement('div');
            submenu.className = 'submenu';
            submenu.style.display = 'none'; // Começa escondido
            submenu.style.position = 'absolute';
            submenu.style.zIndex = '1003'; // Acima do menu pai

            // Adiciona submenu ao container do menu principal para cálculo de pos correto
            startMenu.appendChild(submenu);

            // Cria itens do submenu recursivamente
            itemData.submenu.forEach(subItemData => createMenuItem(subItemData, submenu));

            // --- Lógica de Interação (Desktop: Hover | Mobile: Click) ---
            const showSubmenu = () => {
                clearTimeout(menuTimeout); // Cancela timeout de esconder anterior
                if (activeSubmenu && activeSubmenu !== submenu) activeSubmenu.style.display = 'none';
                if (submenu.style.display === 'block') return; // Já está visível

                submenu.style.display = 'block';
                activeSubmenu = submenu;

                // Calcular Posição (separado para clareza)
                positionSubmenu(submenu, item, startMenu);
            };

            const hideSubmenu = (delay = 150) => { // Esconde com um pequeno delay no desktop
                 clearTimeout(menuTimeout);
                 menuTimeout = setTimeout(() => {
                     if (submenu.style.display === 'block' && !submenu.matches(':hover')) {
                         submenu.style.display = 'none';
                         if (activeSubmenu === submenu) activeSubmenu = null;
                     }
                 }, delay);
            };

            // Eventos Desktop (Hover)
             item.addEventListener('mouseenter', showSubmenu);
             item.addEventListener('mouseleave', () => hideSubmenu());
             submenu.addEventListener('mouseenter', () => clearTimeout(menuTimeout));
             submenu.addEventListener('mouseleave', () => hideSubmenu());

             // Eventos Mobile/Click (Prioridade sobre hover se for touch)
             item.addEventListener('click', (e) => {
                 e.stopPropagation(); // Impede fechar menu principal
                 if (submenu.style.display === 'block') {
                     submenu.style.display = 'none';
                     activeSubmenu = null;
                 } else {
                     showSubmenu();
                 }
             });

        } else { // Item normal sem submenu
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`[taskbar] Clicado em ${itemData.title}`);
                if (itemData.action) itemData.action();
                closeAllMenus(); 
            });
            // Adiciona listener para fechar submenu se mouse sair para item sem submenu
             item.addEventListener('mouseenter', () => {
                 if(activeSubmenu) {
                     hideSubmenu(50);
                 }
             });
        }
        parentContainer.appendChild(item);
    };

     // --- Função para Posicionar Submenu ---
     function positionSubmenu(submenu, parentItem, mainMenu) {
         const menuRect = mainMenu.getBoundingClientRect();
         const itemRect = parentItem.getBoundingClientRect();
         const isMobile = window.innerWidth <= 768;

         // Reseta estilos de posicionamento
         submenu.style.left = ''; submenu.style.top = ''; submenu.style.bottom = '';
         submenu.style.width = ''; submenu.style.height = ''; submenu.style.maxHeight = '';
         submenu.style.overflowY = 'visible';

         const subRect = submenu.getBoundingClientRect();

         if (isMobile) {
             // MOBILE: Overlay no topo do menu principal
             submenu.style.left = '0px';
             submenu.style.top = '0px';
             submenu.style.width = `${menuRect.width}px`;
             submenu.style.height = 'auto';
             submenu.style.maxHeight = `${menuRect.height}px`;
             submenu.style.overflowY = 'auto';
         } else {
             // DESKTOP: Posiciona ao lado
             let targetLeft = menuRect.left + menuRect.width;
             let targetTop = itemRect.top;
             if (targetLeft + subRect.width > window.innerWidth) targetLeft = menuRect.left - subRect.width;
             if (targetLeft < 0) targetLeft = menuRect.left + menuRect.width;
             if (targetTop + subRect.height > window.innerHeight - 32) targetTop = itemRect.bottom - subRect.height;
             if (targetTop < 0) targetTop = 0;
             submenu.style.left = `${targetLeft - menuRect.left}px`;
             submenu.style.top = `${targetTop - menuRect.top}px`;
             submenu.style.width = 'auto';
             submenu.style.height = 'auto';
         }
     }


    // --- Definir Itens do Menu (Estrutura de Dados) ---
    const menuStructure = [
        {
            title: 'Programas', icon: 'assets/icons/Programs.ico', submenu: [
                { id: 'benji' },
                { separator: true },
                { id: 'poligonal' },
                { id: 'gaiato' }
            ]
        },
        {
            title: 'Acessórios', icon: 'assets/icons/acessorios.ico', submenu: [
                { id: 'notepad' },
                { id: 'pinto' }
                // { title: 'Calculadora', icon: '...', action: () => openWindow('calculator') }
            ]
        },
        { separator: true },
        { id: 'system-properties' },
        { id: 'help' },
        { separator: true },
        { id: 'shutdown' }
    ];

    // Função para popular menu a partir da estrutura e appConfig
    function populateMenu(items, container) {
        items.forEach(itemData => {
            if (itemData.separator) {
                createMenuItem({ separator: true }, container);
            } else {
                // Pega dados do appConfig se tiver ID, senão usa dados diretos
                const config = itemData.id ? window.appConfig[itemData.id] : {};
                const title = itemData.title || config.title || itemData.id; // Ordem de prioridade
                const icon = itemData.icon || config.icon || 'assets/icons/Programs.ico';
                const action = itemData.action || (itemData.id ? () => openWindow(itemData.id) : null);
                const subItems = itemData.submenu; // Submenu é definido na estrutura principal

                createMenuItem({ title, icon, submenu: subItems, action }, container);
            }
        });
    }

    populateMenu(menuStructure, menuItemsContainer); // Cria o menu
    console.log('[taskbar] Menu Iniciar recriado.');


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

/* 5. Mobile Scroll Utility */
function setupMobileScroll(scrollContainer) {
     let isDragging = false; let startX, scrollLeft;
     const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

     const startDrag = (e) => {
         isDragging = true;
         startX = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
         scrollLeft = scrollContainer.scrollLeft;
         if (!isTouchDevice) {
            scrollContainer.style.cursor = 'grabbing';
         }
         scrollContainer.style.userSelect = 'none';
     };
     const stopDrag = () => {
         if (!isDragging) return;
         isDragging = false;
         if (!isTouchDevice) {
             scrollContainer.style.cursor = 'grab';
         }
         scrollContainer.style.userSelect = '';
     };
     const doDrag = (e) => {
         if (!isDragging) return;
         e.preventDefault(); 
         const x = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
         const walk = (x - startX) * 1.5;
         scrollContainer.scrollLeft = scrollLeft - walk;
     };

     // Adiciona listeners de mouse
     scrollContainer.addEventListener('mousedown', startDrag);
     scrollContainer.addEventListener('mouseup', stopDrag);
     scrollContainer.addEventListener('mouseleave', stopDrag);
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
}