/* TABLE OF CONTENTS
    1. Taskbar Initialization
    2. Clock Management
    3. Start Menu Management
    4. Taskbar Icons
*/

function initializeTaskbar() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const clock = document.getElementById('clock');
    const taskbarIcons = document.createElement('div');
    taskbarIcons.id = 'taskbar-icons';
    taskbarIcons.style.display = 'flex';
    taskbarIcons.style.gap = '4px';
    taskbarIcons.style.marginLeft = '10px';
    taskbarIcons.style.flexGrow = '1';
    taskbarIcons.style.overflowX = 'auto';
    taskbarIcons.style.whiteSpace = 'nowrap';
    taskbarIcons.style.scrollbarWidth = 'none';
    taskbarIcons.style.msOverflowStyle = 'none';
    taskbarIcons.style['-webkit-overflow-scrolling'] = 'touch';
    taskbarIcons.style.scrollBehavior = 'smooth';
    document.getElementById('taskbar').insertBefore(taskbarIcons, clock);

    // 2. Clock Management
    function updateClock() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        console.log('[taskbar] Relógio atualizado');
    }
    updateClock();
    setInterval(updateClock, 1000);

    // 3. Start Menu Management
    let clickTimeout = null;
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        startMenu.style.zIndex = '1002';
        document.querySelectorAll('.submenu').forEach(submenu => submenu.style.display = 'none');
    });

    document.addEventListener('click', (e) => {
        if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.style.display = 'none';
            document.querySelectorAll('.submenu').forEach(submenu => submenu.style.display = 'none');
        }
    });

    startMenu.innerHTML = '';

    // Menu Principal com Faixa Lateral
    const sidebar = document.createElement('div');
    sidebar.className = 'menu-sidebar';
    sidebar.textContent = 'Gaiat.OS 97';
    startMenu.appendChild(sidebar);

    const menuItemsContainer = document.createElement('div');
    menuItemsContainer.className = 'menu-items-container';
    startMenu.appendChild(menuItemsContainer);

    const createMenuItem = (text, iconSrc, submenuItems = null, action = null) => {
        const item = document.createElement('div');
        item.className = 'menu-item';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '5px 10px';

        const icon = document.createElement('img');
        icon.src = iconSrc;
        icon.style.width = '16px';
        icon.style.height = '16px';
        icon.style.marginRight = '5px';
        item.appendChild(icon);

        item.appendChild(document.createTextNode(text));

        if (submenuItems) {
            const submenu = document.createElement('div');
            submenu.className = 'submenu';
            submenu.style.display = 'none';
            submenu.style.position = 'absolute';
            submenu.style.background = '#c0c0c0';
            submenu.style.border = '2px solid #808080';
            submenu.style.borderTopColor = '#ffffff';
            submenu.style.borderLeftColor = '#ffffff';
            submenu.style.zIndex = '1003';

            submenuItems.forEach(app => {
                const appItem = document.createElement('div');
                appItem.className = 'menu-item';
                appItem.style.display = 'flex';
                appItem.style.alignItems = 'center';
                appItem.style.padding = '5px 10px';
                const appIcon = document.createElement('img');
                appIcon.src = app.icon;
                appIcon.style.width = '16px';
                appIcon.style.height = '16px';
                appIcon.style.marginRight = '5px';
                appItem.appendChild(appIcon);
                appItem.appendChild(document.createTextNode(app.title));
                appItem.addEventListener('click', () => {
                    if (clickTimeout) return;
                    clickTimeout = setTimeout(() => {
                        console.log(`[taskbar] Clicado em ${app.id}`);
                        const windowId = app.action();
                        if (windowId) window.addTaskbarIcon(windowId, app.id, window.appConfig[app.id]);
                        startMenu.style.display = 'none';
                        submenu.style.display = 'none';
                        clickTimeout = null;
                    }, 200);
                });
                submenu.appendChild(appItem);
            });

            item.addEventListener('mouseenter', () => {
                document.querySelectorAll('.submenu').forEach(sub => sub.style.display = 'none');
                submenu.style.display = 'block';
                const menuRect = startMenu.getBoundingClientRect();
                const submenuRect = submenu.getBoundingClientRect();
                submenu.style.left = `${menuRect.width}px`;
                if (submenuRect.right > window.innerWidth) {
                    submenu.style.left = `-${submenuRect.width}px`;
                }
                submenu.style.top = `${item.offsetTop}px`;
            });

            item.addEventListener('mouseleave', (e) => {
                if (!submenu.contains(e.relatedTarget)) {
                    submenu.style.display = 'none';
                }
            });

            submenu.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });

            menuItemsContainer.appendChild(submenu);
        } else {
            item.addEventListener('click', () => {
                if (clickTimeout) return;
                clickTimeout = setTimeout(() => {
                    console.log(`[taskbar] Abrindo ${text}`);
                    const windowId = action();
                    if (windowId) window.addTaskbarIcon(windowId, text.toLowerCase().replace(' ', '-'), window.appConfig[text.toLowerCase().replace(' ', '-')]);
                    startMenu.style.display = 'none';
                    clickTimeout = null;
                }, 200);
            });
        }

        menuItemsContainer.appendChild(item);
    };

    createMenuItem('Programas', 'assets/icons/Programs.ico', [
        { id: 'benji', title: 'BENJI', icon: 'assets/icons/plushbear.ico', action: () => openWindow('benji') },
        { id: 'poligonal', title: 'Poligonal', icon: 'assets/icons/poligonal.ico', action: () => console.log('[taskbar] Poligonal é um placeholder') },
        { id: 'gaiato', title: 'Gaiato', icon: 'assets/icons/gaiato.ico', action: () => console.log('[taskbar] Gaiato é um placeholder') }
    ]);

    createMenuItem('Acessórios', 'assets/icons/acessorios.ico', [
        { id: 'notepad', title: 'Bloquinho', icon: 'assets/icons/notepad.ico', action: () => openWindow('notepad') },
        { id: 'pinto', title: 'Pinto', icon: 'assets/icons/paint.ico', action: () => console.log('[taskbar] Pinto é um placeholder') }
    ]);

    createMenuItem('Configurações', 'assets/icons/configs.ico', null, () => openWindow('system-properties'));
    createMenuItem('Ajuda', 'assets/icons/ajuda.ico', null, () => openWindow('help'));
    createMenuItem('Desligar', 'assets/icons/desligar.ico', null, () => openWindow('shutdown'));

    // 4. Taskbar Icons
    window.addTaskbarIcon = function(windowId, appName, appSettings) {
        if (windowManager.windows[windowId]?.taskIcon) {
            console.log(`[taskbar] Ícone para ${appName} já existe`);
            return;
        }
        const taskIcon = document.createElement('div');
        taskIcon.className = 'task-icon';
        taskIcon.style.display = 'inline-flex';
        taskIcon.style.alignItems = 'center';
        taskIcon.style.padding = '2px 8px';
        taskIcon.style.background = '#c0c0c0';
        taskIcon.style.border = '1px solid #808080';
        taskIcon.style.borderTopColor = '#ffffff';
        taskIcon.style.borderLeftColor = '#ffffff';
        taskIcon.style.cursor = 'pointer';

        const iconImg = document.createElement('img');
        iconImg.src = appSettings.icon;
        iconImg.style.width = '16px';
        iconImg.style.height = '16px';
        iconImg.style.marginRight = '5px';
        taskIcon.appendChild(iconImg);

        const iconText = document.createElement('span');
        iconText.textContent = appSettings.title || appName;
        taskIcon.appendChild(iconText);

        taskIcon.addEventListener('click', () => {
            const win = windowManager.windows[windowId];
            if (win) {
                if (win.windowDiv.style.display === 'none') {
                    console.log(`[taskbar] Restaurando ${appName}`);
                    win.windowDiv.style.display = 'block';
                    win.windowDiv.style.zIndex = windowManager.zIndex++;
                    taskIcon.classList.remove('minimized');
                } else {
                    console.log(`[taskbar] Minimizando ${appName}`);
                    win.windowDiv.style.display = 'none';
                    taskIcon.classList.add('minimized');
                }
            } else {
                console.log(`[taskbar] Janela ${windowId} não encontrada, removendo ícone`);
                taskIcon.remove();
            }
        });

        taskbarIcons.appendChild(taskIcon);
        windowManager.windows[windowId].taskIcon = taskIcon;
    };

    // Mobile Scroll
    let isDragging = false;
    let startX, scrollLeft;

    taskbarIcons.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - taskbarIcons.offsetLeft;
        scrollLeft = taskbarIcons.scrollLeft;
    });

    taskbarIcons.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    taskbarIcons.addEventListener('mouseup', () => {
        isDragging = false;
    });

    taskbarIcons.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - taskbarIcons.offsetLeft;
        const walk = (x - startX) * 2;
        taskbarIcons.scrollLeft = scrollLeft - walk;
    });

    taskbarIcons.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - taskbarIcons.offsetLeft;
        scrollLeft = taskbarIcons.scrollLeft;
    });

    taskbarIcons.addEventListener('touchend', () => {
        isDragging = false;
    });

    taskbarIcons.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].pageX - taskbarIcons.offsetLeft;
        const walk = (x - startX) * 2;
        taskbarIcons.scrollLeft = scrollLeft - walk;
    });
}