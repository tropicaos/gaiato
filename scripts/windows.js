/* TABLE OF CONTENTS
    1. Window Manager
    2. Window Creation
    3. Event Handlers
*/

// 1. Window Manager
const windowManager = {
    windows: {},
    zIndex: 1000,
    windowTypes: {
        standard: {
            createContent: (appName, contentDiv) => {
                const appSettings = window.appConfig[appName] || {};
                if (appName === 'notepad') {
                    const iframe = document.createElement('iframe');
                    iframe.src = 'notepad/index.html';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    contentDiv.appendChild(iframe);
                } else if (appName === 'benji') {
                    const iframe = document.createElement('iframe');
                    iframe.src = 'text-engine/index.html';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    contentDiv.appendChild(iframe);
                } else if (appName === 'shutdown') {
                    const div = document.createElement('div');
                    div.style.padding = '20px';
                    div.textContent = 'Desligando o sistema...';
                    contentDiv.appendChild(div);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.textContent = `Aplicativo ${appName} não configurado`;
                    placeholder.style.padding = '10px';
                    contentDiv.appendChild(placeholder);
                }
            }
        },
        settings: {
            createContent: (appName, contentDiv) => {
                const div = document.createElement('div');
                div.style.padding = '20px';
                div.innerHTML = `
                    <h1>Configurações do Sistema</h1>
                    <p>Sistema Operacional: Gaiat.OS</p>
                    <p>Versão: 1.0.0</p>
                    <p>Desenvolvido por: [Seu Nome]</p>
                `;
                contentDiv.appendChild(div);
            }
        },
        help: {
            createContent: (appName, contentDiv) => {
                const div = document.createElement('div');
                div.style.padding = '20px';
                div.innerHTML = `
                    <h1>Ajuda do Gaiat.OS</h1>
                    <p>Bem-vindo à ajuda do Gaiat.OS. Em desenvolvimento.</p>
                `;
                contentDiv.appendChild(div);
            }
        }
    }
};

// 2. Window Creation
function openWindow(appName) {
    console.log(`[openWindow] Tentando abrir ${appName}`);
    const appSettings = window.appConfig[appName] || { title: appName, icon: 'assets/icons/notepad.ico' };

    if (['poligonal', 'gaiato', 'pinto'].includes(appName)) {
        console.log(`[openWindow] ${appName} é um placeholder`);
        return null;
    }

    if (!appSettings.allowMultipleInstances && Object.values(windowManager.windows).some(w => w.appName === appName)) {
        console.log(`[openWindow] Instância única de ${appName} já aberta`);
        return null;
    }

    const windowId = `window-${Math.random().toString(36).substr(2, 9)}`;
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.id = windowId;
    windowDiv.style.position = 'absolute';
    windowDiv.style.left = '100px';
    windowDiv.style.top = '100px';
    windowDiv.style.width = '600px';
    windowDiv.style.height = '450px';
    windowDiv.style.zIndex = windowManager.zIndex++;
    windowDiv.style.background = '#c0c0c0';
    windowDiv.style.border = '2px solid #808080';
    windowDiv.style.borderTopColor = '#ffffff';
    windowDiv.style.borderLeftColor = '#ffffff';

    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.style.background = '#000080';
    titleBar.style.color = '#ffffff';
    titleBar.style.padding = '2px';
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.cursor = 'move';

    const titleIcon = document.createElement('img');
    titleIcon.src = appSettings.icon;
    titleIcon.style.width = '16px';
    titleIcon.style.height = '16px';
    titleIcon.style.marginRight = '5px';

    const titleText = document.createElement('span');
    titleText.textContent = appSettings.title || appName;
    titleText.style.flexGrow = 1;

    const titleButtons = document.createElement('div');
    titleButtons.id = 'title-buttons';

    const minimize = document.createElement('span');
    minimize.className = 'minimize';
    minimize.textContent = '-';

    const maximizeRestore = document.createElement('span');
    maximizeRestore.className = 'maximize-restore';
    maximizeRestore.textContent = '□';

    const close = document.createElement('span');
    close.className = 'close';
    close.textContent = 'x';

    titleButtons.appendChild(minimize);
    titleButtons.appendChild(maximizeRestore);
    titleButtons.appendChild(close);

    titleBar.appendChild(titleIcon);
    titleBar.appendChild(titleText);
    titleBar.appendChild(titleButtons);
    windowDiv.appendChild(titleBar);

    const content = document.createElement('div');
    content.className = 'content';
    content.style.width = '100%';
    content.style.height = 'calc(100% - 24px)';
    content.style.background = '#ffffff';
    windowDiv.appendChild(content);

    const windowType = appName === 'system-properties' ? 'settings' : 
                      appName === 'help' ? 'help' : 'standard';
    windowManager.windowTypes[windowType].createContent(appName, content);

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    if (appSettings.resizable) {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.style.width = '10px';
        resizer.style.height = '10px';
        resizer.style.position = 'absolute';
        resizer.style.right = '0';
        resizer.style.bottom = '0';
        resizer.style.cursor = 'se-resize';
        windowDiv.appendChild(resizer);

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(windowDiv.style.width, 10);
            startHeight = parseInt(windowDiv.style.height, 10);
        });

        document.addEventListener('mousemove', (e) => {
            if (isResizing) {
                const width = startWidth + (e.clientX - startX);
                const height = startHeight + (e.clientY - startY);
                windowDiv.style.width = `${width}px`;
                windowDiv.style.height = `${height}px`;
                windowManager.windows[windowId].originalDimensions = { width: `${width}px`, height: `${height}px` };
                const iframe = content.querySelector('iframe');
                if (iframe) {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    window.dispatchEvent(new Event('resize'));
                }
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    document.getElementById('desktop').appendChild(windowDiv);

    windowManager.windows[windowId] = {
        windowDiv,
        appName,
        isMaximized: false,
        originalPosition: { left: '100px', top: '100px' },
        originalDimensions: { width: '600px', height: '450px' },
        taskIcon: null
    };

    // 3. Event Handlers
    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - parseInt(windowDiv.style.left, 10);
        offsetY = e.clientY - parseInt(windowDiv.style.top, 10);
        windowDiv.style.zIndex = windowManager.zIndex++;
    });

    titleBar.addEventListener('dblclick', () => {
        console.log(`[window] Duplo clique em ${windowId}`);
        maximizeRestore.click();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            windowDiv.style.left = `${e.clientX - offsetX}px`;
            windowDiv.style.top = `${e.clientY - offsetY}px`;
            windowManager.windows[windowId].originalPosition = { left: windowDiv.style.left, top: windowDiv.style.top };
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    minimize.addEventListener('click', () => {
        console.log(`[window] Minimizando ${windowId}`);
        windowDiv.style.display = 'none';
        if (windowManager.windows[windowId].taskIcon) {
            windowManager.windows[windowId].taskIcon.classList.add('minimized');
        }
    });

    maximizeRestore.addEventListener('click', () => {
        console.log(`[window] Maximizando/Restaurando ${windowId}`);
        if (windowManager.windows[windowId].isMaximized) {
            windowDiv.style.left = windowManager.windows[windowId].originalPosition.left;
            windowDiv.style.top = windowManager.windows[windowId].originalPosition.top;
            windowDiv.style.width = windowManager.windows[windowId].originalDimensions.width;
            windowDiv.style.height = windowManager.windows[windowId].originalDimensions.height;
            windowManager.windows[windowId].isMaximized = false;
            maximizeRestore.textContent = '□';
        } else {
            windowManager.windows[windowId].originalPosition = { left: windowDiv.style.left, top: windowDiv.style.top };
            windowManager.windows[windowId].originalDimensions = { width: windowDiv.style.width, height: windowDiv.style.height };
            windowDiv.style.left = '0';
            windowDiv.style.top = '0';
            windowDiv.style.width = '100%';
            windowDiv.style.height = `calc(100% - 32px)`;
            windowManager.windows[windowId].isMaximized = true;
            maximizeRestore.textContent = '↔';
        }
        const iframe = content.querySelector('iframe');
        if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            window.dispatchEvent(new Event('resize'));
        }
    });

    close.addEventListener('click', () => {
        console.log(`[window] Fechando ${windowId}`);
        document.getElementById('desktop').removeChild(windowDiv);
        if (windowManager.windows[windowId]?.taskIcon) {
            windowManager.windows[windowId].taskIcon.remove();
        }
        delete windowManager.windows[windowId];
    });

    const windowIdReturned = windowId;
    addTaskbarIcon(windowId, appName, appSettings);
    return windowIdReturned;
}