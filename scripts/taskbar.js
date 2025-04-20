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
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        startMenu.style.zIndex = '1002';
    });

    document.addEventListener('click', (e) => {
        if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.style.display = 'none';
            document.querySelectorAll('.submenu').forEach(submenu => submenu.style.display = 'none');
        }
    });

    startMenu.innerHTML = '';

    // Menu Principal
    const programsItem = document.createElement('div');
    programsItem.className = 'menu-item';
    programsItem.textContent = 'Programas';
    programsItem.style.padding = '5px 10px';

    const programsSubmenu = document.createElement('div');
    programsSubmenu.className = 'submenu';
    programsSubmenu.style.display = 'none';
    programsSubmenu.style.position = 'absolute';
    programsSubmenu.style.left = '200px';
    programsSubmenu.style.top = '0';
    programsSubmenu.style.background = '#c0c0c0';
    programsSubmenu.style.border = '2px solid #808080';
    programsSubmenu.style.borderTopColor = '#ffffff';
    programsSubmenu.style.borderLeftColor = '#ffffff';

    const apps = [
        { id: 'benji', title: 'BENJI', icon: 'assets/icons/plushbear.ico', action: () => openWindow('benji') },
        { id: 'poligonal', title: 'Poligonal', icon: 'assets/icons/poligonal.ico', action: () => console.log('[taskbar] Poligonal é um placeholder') },
        { id: 'gaiato', title: 'Gaiato', icon: 'assets/icons/gaiato.ico', action: () => console.log('[taskbar] Gaiato é um placeholder') }
    ];

    apps.forEach(app => {
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
            console.log(`[taskbar] Clicado em ${app.id}`);
            const windowId = app.action();
            if (windowId) addTaskbarIcon(windowId, app.id, window.appConfig[app.id]);
            startMenu.style.display = 'none';
            programsSubmenu.style.display = 'none';
        });
        programsSubmenu.appendChild(appItem);
    });

    programsItem.addEventListener('mouseenter', () => {
        programsSubmenu.style.display = 'block';
    });

    programsSubmenu.addEventListener('mouseleave', () => {
        programsSubmenu.style.display = 'none';
    });

    const accessoriesItem = document.createElement('div');
    accessoriesItem.className = 'menu-item';
    accessoriesItem.textContent = 'Acessórios';
    accessoriesItem.style.padding = '5px 10px';

    const accessoriesSubmenu = document.createElement('div');
    accessoriesSubmenu.className = 'submenu';
    accessoriesSubmenu.style.display = 'none';
    accessoriesSubmenu.style.position = 'absolute';
    accessoriesSubmenu.style.left = '200px';
    accessoriesSubmenu.style.top = '40px';
    accessoriesSubmenu.style.background = '#c0c0c0';
    accessoriesSubmenu.style.border = '2px solid #808080';
    accessoriesSubmenu.style.borderTopColor = '#ffffff';
    accessoriesSubmenu.style.borderLeftColor = '#ffffff';

    const accessoriesApps = [
        { id: 'notepad', title: 'Bloquinho', icon: 'assets/icons/notepad.ico', action: () => openWindow('notepad') },
        { id: 'pinto', title: 'Pinto', icon: 'assets/icons/paint.ico', action: () => console.log('[taskbar] Pinto é um placeholder') }
    ];

    accessoriesApps.forEach(app => {
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
            console.log(`[taskbar] Clicado em ${app.id}`);
            const windowId = app.action();
            if (windowId) addTaskbarIcon(windowId, app.id, window.appConfig[app.id]);
            startMenu.style.display = 'none';
            accessoriesSubmenu.style.display = 'none';
        });
        accessoriesSubmenu.appendChild(appItem);
    });

    accessoriesItem.addEventListener('mouseenter', () => {
        accessoriesSubmenu.style.display = 'block';
    });

    accessoriesSubmenu.addEventListener('mouseleave', () => {
        accessoriesSubmenu.style.display = 'none';
    });

    const settingsItem = document.createElement('div');
    settingsItem.className = 'menu-item';
    settingsItem.textContent = 'Configurações';
    settingsItem.style.padding = '5px 10px';
    settingsItem.addEventListener('click', () => {
        console.log('[taskbar] Abrindo Configurações');
        const windowId = openWindow('system-properties');
        if (windowId) addTaskbarIcon(windowId, 'system-properties', window.appConfig['system-properties']);
        startMenu.style.display = 'none';
    });

    const helpItem = document.createElement('div');
    helpItem.className = 'menu-item';
    helpItem.textContent = 'Ajuda';
    helpItem.style.padding = '5px 10px';
    helpItem.addEventListener('click', () => {
        console.log('[taskbar] Abrindo Ajuda');
        const windowId = openWindow('help');
        if (windowId) addTaskbarIcon(windowId, 'help', window.appConfig['help']);
        startMenu.style.display = 'none';
    });

    const shutdownItem = document.createElement('div');
    shutdownItem.className = 'menu-item';
    shutdownItem.textContent = 'Desligar';
    shutdownItem.style.padding = '5px 10px';
    shutdownItem.addEventListener('click', () => {
        console.log('[taskbar] Abrindo Desligar');
        const windowId = openWindow('shutdown');
        if (windowId) addTaskbarIcon(windowId, 'shutdown', window.appConfig['shutdown']);
        startMenu.style.display = 'none';
    });

    startMenu.appendChild(programsItem);
    startMenu.appendChild(programsSubmenu);
    startMenu.appendChild(accessoriesItem);
    startMenu.appendChild(accessoriesSubmenu);
    startMenu.appendChild(settingsItem);
    startMenu.appendChild(helpItem);
    startMenu.appendChild(shutdownItem);

    // 4. Taskbar Icons
    window.addTaskbarIcon = function(windowId, appName, appSettings) {
        const taskIcon = document.createElement('div');
        taskIcon.className = 'task-icon';
        taskIcon.style.display = 'flex';
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
            }
        });

        taskbarIcons.appendChild(taskIcon);
        windowManager.windows[windowId].taskIcon = taskIcon;
    };
}