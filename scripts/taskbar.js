function initializeTaskbar() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const clock = document.getElementById('clock');

    function updateClock() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);

    startButton.addEventListener('click', () => {
        startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        startMenu.style.position = 'absolute';
        startMenu.style.bottom = '40px';
        startMenu.style.left = '0';
    });

    document.addEventListener('click', (e) => {
        if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.style.display = 'none';
        }
    });

    // Limpar menu existente
    startMenu.innerHTML = '';

    // Criar item Programas
    const programsItem = document.createElement('div');
    programsItem.className = 'menu-item';
    programsItem.textContent = 'Programas';
    programsItem.style.padding = '5px 10px';
    programsItem.style.cursor = 'default';

    const programsSubmenu = document.createElement('div');
    programsSubmenu.className = 'submenu';
    programsSubmenu.style.display = 'none';
    programsSubmenu.style.position = 'absolute';
    programsSubmenu.style.bottom = '100%';
    programsSubmenu.style.left = '0';
    programsSubmenu.style.background = '#c0c0c0';
    programsSubmenu.style.border = '2px solid #808080';
    programsSubmenu.style.borderTop = '2px solid #ffffff';
    programsSubmenu.style.borderLeft = '2px solid #ffffff';
    programsSubmenu.style.boxShadow = '5px 5px 10px rgba(0, 0, 0, 0.2)';
    programsSubmenu.style.zIndex = '1002';

    const apps = ['text-engine', 'poligonal', 'gaiato'];
    apps.forEach(appName => {
        const appSettings = window.appConfig[appName] || { title: appName, icon: 'assets/icons/plushbear.ico' };
        const appItem = document.createElement('div');
        appItem.className = 'menu-item';
        appItem.style.display = 'flex';
        appItem.style.alignItems = 'center';
        appItem.style.padding = '5px 10px';

        const appIcon = document.createElement('img');
        appIcon.src = appSettings.icon;
        appIcon.style.width = '16px';
        appIcon.style.height = '16px';
        appIcon.style.marginRight = '5px';
        appItem.appendChild(appIcon);

        const appText = document.createElement('span');
        appText.textContent = appSettings.title || appName;
        appItem.appendChild(appText);

        appItem.addEventListener('click', () => {
            openWindow(appName);
            startMenu.style.display = 'none';
            programsSubmenu.style.display = 'none';
        });

        programsSubmenu.appendChild(appItem);
    });

    programsItem.addEventListener('click', () => {
        programsSubmenu.style.display = programsSubmenu.style.display === 'block' ? 'none' : 'block';
    });

    startMenu.appendChild(programsItem);
    startMenu.appendChild(programsSubmenu);

    // Criar item Acessórios
    const accessoriesItem = document.createElement('div');
    accessoriesItem.className = 'menu-item';
    accessoriesItem.textContent = 'Acessórios';
    accessoriesItem.style.padding = '5px 10px';
    accessoriesItem.style.cursor = 'default';

    const accessoriesSubmenu = document.createElement('div');
    accessoriesSubmenu.className = 'submenu';
    accessoriesSubmenu.style.display = 'none';
    accessoriesSubmenu.style.position = 'absolute';
    accessoriesSubmenu.style.bottom = '100%';
    accessoriesSubmenu.style.left = '0';
    accessoriesSubmenu.style.background = '#c0c0c0';
    accessoriesSubmenu.style.border = '2px solid #808080';
    accessoriesSubmenu.style.borderTop = '2px solid #ffffff';
    accessoriesSubmenu.style.borderLeft = '2px solid #ffffff';
    accessoriesSubmenu.style.boxShadow = '5px 5px 10px rgba(0, 0, 0, 0.2)';
    accessoriesSubmenu.style.zIndex = '1002';

    const notepadItem = document.createElement('div');
    notepadItem.className = 'menu-item';
    notepadItem.style.display = 'flex';
    notepadItem.style.alignItems = 'center';
    notepadItem.style.padding = '5px 10px';

    const notepadIcon = document.createElement('img');
    notepadIcon.src = 'assets/icons/notepad.ico';
    notepadIcon.style.width = '16px';
    notepadIcon.style.height = '16px';
    notepadIcon.style.marginRight = '5px';
    notepadItem.appendChild(notepadIcon);

    const notepadText = document.createElement('span');
    notepadText.textContent = 'Notepad';
    notepadItem.appendChild(notepadText);

    notepadItem.addEventListener('click', () => {
        openWindow('notepad');
        startMenu.style.display = 'none';
        accessoriesSubmenu.style.display = 'none';
    });

    accessoriesSubmenu.appendChild(notepadItem);

    accessoriesItem.addEventListener('click', () => {
        accessoriesSubmenu.style.display = accessoriesSubmenu.style.display === 'block' ? 'none' : 'block';
    });

    startMenu.appendChild(accessoriesItem);
    startMenu.appendChild(accessoriesSubmenu);

    // Fechar submenus ao clicar fora
    document.addEventListener('click', (e) => {
        if (!programsItem.contains(e.target) && !programsSubmenu.contains(e.target)) {
            programsSubmenu.style.display = 'none';
        }
        if (!accessoriesItem.contains(e.target) && !accessoriesSubmenu.contains(e.target)) {
            accessoriesSubmenu.style.display = 'none';
        }
    });
}