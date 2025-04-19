const windowManager = {
    windows: {},
    nextId: 1,
};

const generateWindowId = () => {
    return `window-${windowManager.nextId++}`;
};

// Funções de apoio
const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

const drawDashedRect = (ctx, x, y, width, height, dashSize = 4) => {
    const colors = ['#000000', '#ffffff'];
    let colorIndex = 0;

    // Topo
    for (let i = x; i < x + width; i += dashSize) {
        ctx.fillStyle = colors[colorIndex % 2];
        ctx.fillRect(i, y, Math.min(dashSize, x + width - i), 1);
        colorIndex++;
    }
    // Direita
    for (let i = y; i < y + height; i += dashSize) {
        ctx.fillStyle = colors[colorIndex % 2];
        ctx.fillRect(x + width - 1, i, 1, Math.min(dashSize, y + height - i));
        colorIndex++;
    }
    // Base
    for (let i = x + width - dashSize; i >= x; i -= dashSize) {
        ctx.fillStyle = colors[colorIndex % 2];
        ctx.fillRect(i, y + height - 1, Math.min(dashSize, x + width - i), 1);
        colorIndex++;
    }
    // Esquerda
    for (let i = y + height - dashSize; i >= y; i -= dashSize) {
        ctx.fillStyle = colors[colorIndex % 2];
        ctx.fillRect(x, i, 1, Math.min(dashSize, y + height - i));
        colorIndex++;
    }
};

const estimateTaskIconPosition = () => {
    const taskbar = document.getElementById('taskbar');
    const startButton = document.getElementById('start-button');
    const startButtonRect = startButton.getBoundingClientRect();

    const existingTaskIcons = taskbar.querySelectorAll('.task-icon');
    const taskIconCount = existingTaskIcons.length;

    const estimatedTaskIconWidth = 100;
    const marginBetweenIcons = 10;

    let nextX = startButtonRect.left + startButtonRect.width + marginBetweenIcons;
    nextX += taskIconCount * (estimatedTaskIconWidth + marginBetweenIcons);

    const taskbarRect = taskbar.getBoundingClientRect();
    const nextY = taskbarRect.top + (taskbarRect.height - startButtonRect.height) / 2;

    return {
        position: { left: nextX + 'px', top: nextY + 'px' },
        dimensions: { width: startButtonRect.width + 'px', height: startButtonRect.height + 'px' }
    };
};

const getTargetPositionAndDimensions = (windowId) => {
    const windowData = windowManager.windows[windowId];
    if (!windowData) {
        console.warn(`[getTargetPositionAndDimensions] Window ${windowId} not found`);
        return { position: { left: '100px', top: '100px' }, dimensions: { width: '600px', height: '450px' } };
    }
    if (windowData.isMaximized) {
        return {
            position: { left: '0', top: '0' },
            dimensions: { width: window.innerWidth + 'px', height: (window.innerHeight - 40) + 'px' }
        };
    } else {
        return {
            position: windowData.originalPosition,
            dimensions: windowData.originalDimensions
        };
    }
};

const getCurrentPositionAndDimensions = (windowId) => {
    const windowData = windowManager.windows[windowId];
    const windowDiv = windowData.windowDiv;
    if (windowDiv.style.left === '-9999px') {
        return {
            position: { left: '-9999px', top: '-9999px' },
            dimensions: { width: '0px', height: '0px' }
        };
    }
    const rect = windowDiv.getBoundingClientRect();
    return {
        position: { left: rect.left + 'px', top: rect.top + 'px' },
        dimensions: { width: rect.width + 'px', height: rect.height + 'px' }
    };
};

const applyPositionAndDimensions = (windowId, windowDiv) => {
    const { position, dimensions } = getTargetPositionAndDimensions(windowId);
    windowDiv.style.left = position.left;
    windowDiv.style.top = position.top;
    windowDiv.style.width = dimensions.width;
    windowDiv.style.height = dimensions.height;
};

const createTrailAnimation = (startElementOrPosition, endPosition, endDimensions, isOpening, windowDiv, callback) => {
    let startX, startY, startWidth, startHeight;
    let endX, endY, endWidth, endHeight;

    if (startElementOrPosition instanceof HTMLElement) {
        const startRect = startElementOrPosition.getBoundingClientRect();
        startX = startRect.left;
        startY = startRect.top;
        startWidth = startRect.width;
        startHeight = startRect.height;
    } else {
        startX = parseFloat(startElementOrPosition.position.left) || 0;
        startY = parseFloat(startElementOrPosition.position.top) || 0;
        startWidth = parseFloat(startElementOrPosition.dimensions.width) || 48;
        startHeight = parseFloat(startElementOrPosition.dimensions.height) || 48;
    }

    endX = parseFloat(endPosition.left) || 100;
    endY = parseFloat(endPosition.top) || 100;
    endWidth = parseFloat(endDimensions.width) || 600;
    endHeight = parseFloat(endDimensions.height) || 450;

    if (!isOpening) {
        [startX, endX] = [endX, startX];
        [startY, endY] = [endY, startY];
        [startWidth, endWidth] = [endWidth, startWidth];
        [startHeight, endHeight] = [endHeight, startHeight];
    }

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1000';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const duration = 400;
    let startTime = null;

    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const fraction = Math.min(elapsed / duration, 1);
        const easedFraction = easeInOutQuad(fraction);

        const currentX = startX + (endX - startX) * easedFraction;
        const currentY = startY + (endY - startY) * easedFraction;
        const currentWidth = startWidth + (endWidth - startWidth) * easedFraction;
        const currentHeight = startHeight + (endHeight - startHeight) * easedFraction;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDashedRect(ctx, currentX, currentY, currentWidth, currentHeight);

        if (fraction < 1) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
            if (isOpening) {
                windowDiv.style.display = 'flex';
                applyPositionAndDimensions(windowDiv.dataset.windowId, windowDiv);
                const iframe = windowDiv.querySelector('.content iframe');
                if (iframe) {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    window.dispatchEvent(new Event('resize'));
                }
            } else {
                windowDiv.style.position = 'absolute';
                windowDiv.style.left = '-9999px';
                windowDiv.style.top = '-9999px';
            }
            if (callback) callback();
        }
    };

    requestAnimationFrame(animate);
};

function openWindow(appName) {
    const appSettings = window.appConfig[appName] || { allowMultipleInstances: true, title: appName };
    if (!appSettings.allowMultipleInstances) {
        const existingWindowEntry = Object.entries(windowManager.windows).find(
            ([_, windowData]) => windowData.appName === appName
        );

        if (existingWindowEntry) {
            const [windowId, windowData] = existingWindowEntry;
            const windowDiv = windowData.windowDiv;
            const taskIcon = windowData.taskIcon;

            console.log(`[openWindow] App: ${appName}, Window ID: ${windowId}, Task Icon: ${taskIcon ? 'exists' : 'null'}`);

            if (taskIcon && taskIcon.parentNode) {
                const taskbar = document.getElementById('taskbar');
                const { position, dimensions } = getTargetPositionAndDimensions(windowId);
                windowDiv.style.display = 'none';
                createTrailAnimation(taskIcon, position, dimensions, true, windowDiv, () => {
                    windowDiv.style.display = 'flex';
                    applyPositionAndDimensions(windowId, windowDiv);
                    if (taskIcon.parentNode === taskbar) {
                        taskbar.removeChild(taskIcon);
                    }
                    windowData.taskIcon = null;
                    console.log(`[openWindow] Restored window ${windowId}`);
                });
                return;
            } else if (windowDiv.style.display !== 'flex') {
                windowDiv.style.display = 'flex';
                applyPositionAndDimensions(windowId, windowDiv);
                console.log(`[openWindow] Restored hidden window ${windowId}`);
                return;
            } else {
                windowDiv.style.zIndex = Math.max(
                    ...Array.from(document.querySelectorAll('.window'))
                        .map(w => parseInt(w.style.zIndex) || 0)
                ) + 1;
                console.log(`[openWindow] Focused window ${windowId}`);
                return;
            }
        }
    }

    const windowId = generateWindowId();

    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.setAttribute('data-app', appName);
    windowDiv.setAttribute('data-window-id', windowId);
    windowDiv.style.width = '600px';
    windowDiv.style.height = '450px';
    windowDiv.style.position = 'absolute';
    windowDiv.style.left = '100px';
    windowDiv.style.top = '100px';
    windowDiv.style.display = 'none';

    const titleBar = document.createElement('div');
    titleBar.id = 'title-bar';
    titleBar.style.cursor = 'move';
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';
    windowDiv.appendChild(titleBar);

    const titleText = document.createElement('span');
    titleText.textContent = appSettings.title || appName;
    titleBar.appendChild(titleText);

    // Limpar qualquer controlButtons existente
    const existingControlButtons = titleBar.querySelector('#title-buttons');
    if (existingControlButtons) {
        existingControlButtons.remove();
    }

    const controlButtons = document.createElement('div');
    controlButtons.id = 'title-buttons';
    titleBar.appendChild(controlButtons);

    const minimizeButton = document.createElement('span');
    minimizeButton.textContent = '_';
    minimizeButton.className = 'minimize';
    minimizeButton.setAttribute('title', 'Minimizar');
    controlButtons.appendChild(minimizeButton);

    const maximizeRestoreButton = document.createElement('span');
    maximizeRestoreButton.textContent = '□';
    maximizeRestoreButton.className = 'maximize-restore';
    maximizeRestoreButton.setAttribute('title', 'Maximizar');
    controlButtons.appendChild(maximizeRestoreButton);

    const closeButton = document.createElement('span');
    closeButton.textContent = 'X';
    closeButton.className = 'close';
    closeButton.setAttribute('title', 'Fechar');
    controlButtons.appendChild(closeButton);

    const content = document.createElement('div');
    content.className = 'content';
    windowDiv.appendChild(content);

    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.width = '10px';
    resizer.style.height = '10px';
    resizer.style.position = 'absolute';
    resizer.style.right = '0';
    resizer.style.bottom = '0';
    resizer.style.cursor = 'se-resize';
    windowDiv.appendChild(resizer);

    document.getElementById('desktop').appendChild(windowDiv);

    windowManager.windows[windowId] = {
        windowDiv,
        appName,
        isMaximized: false,
        originalPosition: { left: '100px', top: '100px' },
        originalDimensions: { width: '600px', height: '450px' },
        taskIcon: null,
    };

    const iconElement = document.querySelector(`.icon[onclick="openWindow('${appName}')"]`);
    const iconPosition = desktopManager.getIconPosition(iconElement ? iconElement.dataset.id : '');
    if (iconPosition) {
        createTrailAnimation(
            iconElement,
            { left: '100px', top: '100px' },
            { width: '600px', height: '450px' },
            true,
            windowDiv,
            () => {
                console.log(`[openWindow] Animation completed for new window ${windowId}`);
            }
        );
    } else {
        console.warn(`[openWindow] Icon position not found for app: ${appName}`);
        windowDiv.style.display = 'flex';
        applyPositionAndDimensions(windowId, windowDiv);
    }

    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        if (e.target === titleBar || e.target === titleText) {
            isDragging = true;
            offsetX = e.clientX - windowDiv.offsetLeft;
            offsetY = e.clientY - windowDiv.offsetTop;
        }
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

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

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

    const toggleMaximizeRestore = () => {
        const windowData = windowManager.windows[windowId];
        if (!windowData.isMaximized) {
            windowData.originalPosition = { left: windowDiv.style.left, top: windowDiv.style.top };
            windowData.originalDimensions = { width: windowDiv.style.width, height: windowDiv.style.height };
            windowDiv.style.width = '100%';
            windowDiv.style.height = 'calc(100% - 40px)';
            windowDiv.style.left = '0';
            windowDiv.style.top = '0';
            maximizeRestoreButton.textContent = '🗗';
            maximizeRestoreButton.setAttribute('title', 'Restaurar');
            windowData.isMaximized = true;
        } else {
            windowDiv.style.width = windowData.originalDimensions.width;
            windowDiv.style.height = windowData.originalDimensions.height;
            windowDiv.style.left = windowData.originalPosition.left;
            windowDiv.style.top = windowData.originalPosition.top;
            maximizeRestoreButton.textContent = '□';
            maximizeRestoreButton.setAttribute('title', 'Maximizar');
            windowData.isMaximized = false;
        }
        const iframe = content.querySelector('iframe');
        if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            window.dispatchEvent(new Event('resize'));
        }
    };

    maximizeRestoreButton.addEventListener('click', toggleMaximizeRestore);

    titleBar.addEventListener('dblclick', (e) => {
        if (e.target === titleBar || e.target === titleText) {
            toggleMaximizeRestore();
        }
    });

    closeButton.addEventListener('click', () => {
        const windowData = windowManager.windows[windowId];
        windowDiv.remove();
        if (windowData.taskIcon && windowData.taskIcon.parentNode) {
            windowData.taskIcon.remove();
        }
        delete windowManager.windows[windowId];
        console.log(`[closeButton] Closed window ${windowId}`);
    });

    minimizeButton.addEventListener('click', () => {
        const windowData = windowManager.windows[windowId];
        const currentPosAndDims = getCurrentPositionAndDimensions(windowId);
        const taskIconPosAndDims = estimateTaskIconPosition();

        const taskbar = document.getElementById('taskbar');
        const newTaskIcon = document.createElement('div');
        newTaskIcon.className = 'task-icon';
        newTaskIcon.dataset.app = appName;
        newTaskIcon.dataset.windowId = windowId;
        newTaskIcon.style.display = 'flex';
        newTaskIcon.style.alignItems = 'center';
        newTaskIcon.style.padding = '2px 8px';
        newTaskIcon.style.cursor = 'pointer';
        newTaskIcon.style.zIndex = '1002';

        const iconImg = document.createElement('img');
        iconImg.src = appSettings.icon || 'assets/icons/plushbear.ico';
        iconImg.style.width = '16px';
        iconImg.style.height = '16px';
        iconImg.style.marginRight = '5px';
        newTaskIcon.appendChild(iconImg);

        const iconText = document.createElement('span');
        iconText.textContent = appSettings.title || appName;
        newTaskIcon.appendChild(iconText);

        newTaskIcon.addEventListener('click', () => {
            const { position, dimensions } = getTargetPositionAndDimensions(windowId);
            windowDiv.style.display = 'none';
            createTrailAnimation(newTaskIcon, position, dimensions, true, windowDiv, () => {
                windowDiv.style.display = 'flex';
                applyPositionAndDimensions(windowId, windowDiv);
                if (newTaskIcon.parentNode === taskbar) {
                    taskbar.removeChild(newTaskIcon);
                }
                windowData.taskIcon = null;
                console.log(`[taskIcon] Restored window ${windowId}`);
            });
        });

        createTrailAnimation(taskIconPosAndDims, currentPosAndDims.position, currentPosAndDims.dimensions, false, windowDiv, () => {
            taskbar.insertBefore(newTaskIcon, document.getElementById('clock'));
            windowData.taskIcon = newTaskIcon;
            console.log(`[minimizeButton] Created task icon for window ${windowId}`);
        });
    });

    if (appName === 'text-engine') {
        const iframe = document.createElement('iframe');
        iframe.src = 'text-engine/index.html';
        content.appendChild(iframe);
    }
    if (appName === 'poligonal' || appName === 'gaiato' || appName === 'notepad') {
        const placeholder = document.createElement('div');
        placeholder.textContent = `${appSettings.title || appName} - Em desenvolvimento`;
        placeholder.style.padding = '20px';
        placeholder.style.textAlign = 'center';
        content.appendChild(placeholder);
    }
}