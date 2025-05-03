/* TABLE OF CONTENTS
    1. Window Manager Object (windowManager)
    2. Window Creation Function (openWindow)
    3. Event Handlers & Logic (dentro de openWindow) - RESIZE COMENTADO
    4. Cleanup Logic (dentro do 'close' handler)
    5. Global Helper/Integration (Chamada para addTaskbarIcon)
*/

/* 1. Window Manager Object */
const windowManager = {
    windows: {},
    zIndex: 1000,
    windowTypes: {
        standard: {
            createContent: (appName, contentDiv, windowId) => {
                const appSettings = window.appConfig[appName] || {}; let iframeSrc = null;
                if (appName === 'notepad') iframeSrc = './notepad/index.html';
                else if (appName === 'benji') iframeSrc = './text-engine/index.html';
                if (iframeSrc) {
                    const iframe = document.createElement('iframe'); iframe.src = iframeSrc;
                    iframe.style.width = '100%'; iframe.style.height = '100%'; iframe.style.border = 'none';
                    iframe.setAttribute('frameborder', '0'); contentDiv.appendChild(iframe);
                } else { contentDiv.innerHTML = `<p style="padding: 10px;">Conteúdo para '${appName}'.</p>`; }
            }
        },
        settings: { createContent: (appName, contentDiv) => {
                 contentDiv.innerHTML = `<h3 style="margin-top: 0;">Propriedades do Sistema</h3><p>Sistema Operacional: Gaiat.OS</p><p>Versão: 0.1 Alpha</p><p>Baseado em: 98.css</p><p style="margin-top: 15px;">Desenvolvido por: Poligonal</p>`;
             }},
        help: { createContent: (appName, contentDiv) => {
                 contentDiv.innerHTML = `<h3 style="margin-top: 0;">Ajuda do Gaiat.OS</h3><p>Bem-vindo ao sistema de ajuda.</p><p>Use o menu 'Agilizar' para acessar programas e acessórios.</p><p>Clique e arraste a barra de título para mover janelas.</p><p>Use os botões no canto superior direito para controlar as janelas.</p><p><i>(Esta seção está em desenvolvimento)</i></p>`;
             }},
        message: { createContent: (appName, contentDiv, windowId) => {
                 contentDiv.innerHTML = `<p style="margin-bottom: 20px; text-align: center;">Tem certeza que deseja desligar o sistema?</p><div style="display: flex; justify-content: center; gap: 10px;"><button id="shutdown-yes-${windowId}" class="button">Sim</button><button id="shutdown-no-${windowId}" class="button">Não</button></div>`;
                 setTimeout(() => {
                     const yesButton = contentDiv.querySelector(`#shutdown-yes-${windowId}`); const noButton = contentDiv.querySelector(`#shutdown-no-${windowId}`); const windowData = windowManager.windows[windowId];
                     if (yesButton) { yesButton.addEventListener('click', () => { console.log('[window] Desligando...'); document.body.innerHTML = '<div style="color: white; background: black; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: monospace;">É seguro desligar o computador.</div>'; }); }
                     if (noButton && windowData) { noButton.addEventListener('click', () => { windowData.windowDiv?.querySelector('.title-bar-controls button[aria-label="Close"]')?.click(); }); }
                 }, 0);
             }}
    }
};

/* 2. Window Creation Function */
function openWindow(appName) {
    if (!appName) { console.error("[window] Tentativa de abrir janela sem appName."); return null; }
    console.log(`[window] Abrindo ${appName}`);
    const appSettings = window.appConfig[appName] || { title: appName, icon: 'assets/icons/Programs.ico', allowMultipleInstances: true, resizable: true };

    if (['poligonal', 'gaiato', 'pinto'].includes(appName)) { alert(`O aplicativo '${appSettings.title}' ainda é um placeholder.`); console.log(`[window] Bloqueado placeholder: ${appName}`); return null; }

    const existingWindowId = Object.keys(windowManager.windows).find(id => windowManager.windows[id].appName === appName);
    if (!appSettings.allowMultipleInstances && existingWindowId) { console.log(`[window] Focando instância única existente de ${appName}`); const eW = windowManager.windows[existingWindowId]; if (eW?.windowDiv) { eW.taskIcon?.click(); if (eW.windowDiv.style.display !== 'none') eW.windowDiv.style.zIndex = windowManager.zIndex++; } return existingWindowId; }

    // --- Criação DOM ---
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const windowDiv = document.createElement('div'); windowDiv.className = 'window'; windowDiv.id = windowId; windowDiv.style.position = 'absolute'; windowDiv.style.zIndex = windowManager.zIndex++;
    const openWindowsCount = Object.keys(windowManager.windows).length; windowDiv.style.left = `${50 + (openWindowsCount % 10) * 20}px`; windowDiv.style.top = `${50 + (openWindowsCount % 10) * 20}px`;
    windowDiv.style.width = appSettings.width || (appName === 'shutdown' ? '300px' : '600px'); windowDiv.style.height = appSettings.height || (appName === 'shutdown' ? '150px' : '450px');
    windowDiv.style.minWidth = '150px'; windowDiv.style.minHeight = '100px';

    // Title Bar
    const titleBar = document.createElement('div'); titleBar.className = 'title-bar'; titleBar.style.cursor = 'move';
    const titleIcon = document.createElement('img'); titleIcon.src = appSettings.icon; titleIcon.style.width = '16px'; titleIcon.style.height = '16px'; titleIcon.style.marginRight = '3px'; titleIcon.ondragstart = () => false;
    const titleTextDiv = document.createElement('div'); titleTextDiv.className = 'title-bar-text'; titleTextDiv.textContent = appSettings.title || appName;
    const titleButtons = document.createElement('div'); titleButtons.className = 'title-bar-controls';
    const minimize = document.createElement('button'); minimize.className = 'button'; minimize.setAttribute('aria-label', 'Minimize');
    const maximizeRestore = document.createElement('button'); maximizeRestore.className = 'button'; maximizeRestore.setAttribute('aria-label', 'Maximize');
    const canResize = appSettings.resizable !== false && appName !== 'shutdown'; if (!canResize) maximizeRestore.disabled = true;
    const close = document.createElement('button'); close.className = 'button'; close.setAttribute('aria-label', 'Close');
    titleButtons.appendChild(minimize); if (canResize) titleButtons.appendChild(maximizeRestore); titleButtons.appendChild(close);
    titleBar.appendChild(titleIcon); titleBar.appendChild(titleTextDiv); titleBar.appendChild(titleButtons);

    // Content Area
    const content = document.createElement('div'); content.className = 'window-body';
    const updateContentHeight = () => { const tbH = titleBar.offsetHeight || 24; const wP = 6; content.style.height = `calc(100% - ${tbH}px - ${wP}px)`; };
    updateContentHeight(); content.style.boxSizing = 'border-box'; content.style.overflow = 'auto';

    windowDiv.appendChild(titleBar); windowDiv.appendChild(content);
    const windowType = appName === 'system-properties' ? 'settings' : appName === 'help' ? 'help' : appName === 'shutdown' ? 'message' : 'standard';
    windowManager.windowTypes[windowType].createContent(appName, content, windowId);
    document.getElementById('desktop').appendChild(windowDiv);

    // Armazena Estado Inicial
    const windowState = {
        windowDiv, appName, isMaximized: false, taskIcon: null,
        originalPosition: { left: windowDiv.style.left, top: windowDiv.style.top },
        originalDimensions: { width: windowDiv.style.width, height: windowDiv.style.height },
        dragMoveHandler: null, dragUpHandler: null, resizeMoveHandler: null, resizeUpHandler: null
    };
    windowManager.windows[windowId] = windowState;

    // --- 3. Event Handlers & Logic ---
    let isDragging = false; let dragOffsetX, dragOffsetY;
    //let isResizing = false; let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight; // Comentado com o bloco abaixo

    // Dragging
    const handleMouseMoveDrag = (e) => {
         if (!isDragging) return; let newLeft = e.clientX - dragOffsetX; let newTop = e.clientY - dragOffsetY;
         const titleBarHeight = titleBar.offsetHeight || 24; if (newTop < 0) newTop = 0; if (newTop > window.innerHeight - titleBarHeight) newTop = window.innerHeight - titleBarHeight;
         if (newLeft < -(parseInt(windowDiv.style.width, 10) - 40)) newLeft = -(parseInt(windowDiv.style.width, 10) - 40); if (newLeft > window.innerWidth - 40) newLeft = window.innerWidth - 40;
         windowDiv.style.left = `${newLeft}px`; windowDiv.style.top = `${newTop}px`;
    };
    const handleMouseUpDrag = () => {
         if (!isDragging) return; isDragging = false; windowDiv.style.userSelect = ''; windowDiv.style.cursor = '';
         if (!windowState.isMaximized) { windowState.originalPosition = { left: windowDiv.style.left, top: windowDiv.style.top }; }
         document.removeEventListener('mousemove', handleMouseMoveDrag); document.removeEventListener('mouseup', handleMouseUpDrag);
    };
    titleBar.addEventListener('mousedown', (e) => {
         if (e.target.closest('.title-bar-controls') || windowState.isMaximized) return;
         isDragging = true; dragOffsetX = e.clientX - parseInt(windowDiv.style.left, 10); dragOffsetY = e.clientY - parseInt(windowDiv.style.top, 10);
         windowDiv.style.zIndex = windowManager.zIndex++; windowDiv.style.userSelect = 'none'; windowDiv.style.cursor = 'move';
         windowState.taskIcon?.click(); document.addEventListener('mousemove', handleMouseMoveDrag); document.addEventListener('mouseup', handleMouseUpDrag);
     });
    titleBar.addEventListener('dblclick', (e) => { if (e.target.closest('.title-bar-controls')) return; if (canResize) maximizeRestore.click(); });
     // --- Touch Dragging Logic ---
     let touchStartX, touchStartY; // Variáveis específicas para touch

     const handleTouchMoveDrag = (e) => {
         if (!isDragging) return;
         // Previne scroll da página enquanto arrasta
         e.preventDefault();
         const touch = e.touches[0]; // Pega o primeiro toque
         let newLeft = touch.clientX - dragOffsetX; // Reutiliza dragOffset calculado no touchstart
         let newTop = touch.clientY - dragOffsetY;
 
         // Lógica de limites (igual ao mousemove)
         const titleBarHeight = titleBar.offsetHeight || 24;
         if (newTop < 0) newTop = 0;
         if (newTop > window.innerHeight - titleBarHeight) newTop = window.innerHeight - titleBarHeight;
         if (newLeft < -(parseInt(windowDiv.style.width, 10) - 40)) newLeft = -(parseInt(windowDiv.style.width, 10) - 40);
         if (newLeft > window.innerWidth - 40) newLeft = window.innerWidth - 40;
 
         windowDiv.style.left = `${newLeft}px`;
         windowDiv.style.top = `${newTop}px`;
     };
 
     const handleTouchEndDrag = () => {
         if (!isDragging) return;
         isDragging = false;
         // Salva posição final se não estiver maximizado
         if (!windowState.isMaximized) {
             windowState.originalPosition = { left: windowDiv.style.left, top: windowDiv.style.top };
         }
         // Remove listeners globais de toque
         document.removeEventListener('touchmove', handleTouchMoveDrag);
         document.removeEventListener('touchend', handleTouchEndDrag);
         document.removeEventListener('touchcancel', handleTouchEndDrag); // Importante para cancelamentos
     };
 
     titleBar.addEventListener('touchstart', (e) => {
         // Ignora se for nos botões ou maximizado
         if (e.target.closest('.title-bar-controls') || windowState.isMaximized) {
             return;
         }
         // Previne scroll padrão
         e.preventDefault();
         isDragging = true; // Reutiliza a flag
         const touch = e.touches[0];
         touchStartX = touch.clientX; // Guarda posição inicial do toque
         touchStartY = touch.clientY;
         // Calcula offset inicial
         dragOffsetX = touchStartX - parseInt(windowDiv.style.left, 10);
         dragOffsetY = touchStartY - parseInt(windowDiv.style.top, 10);
         // Traz para frente e foca
         windowDiv.style.zIndex = windowManager.zIndex++;
         windowState.taskIcon?.click();
         // Adiciona listeners globais para move e end/cancel
         document.addEventListener('touchmove', handleTouchMoveDrag, { passive: false });
         document.addEventListener('touchend', handleTouchEndDrag);
         document.addEventListener('touchcancel', handleTouchEndDrag);
 
     }, { passive: false }); // passive: false no start para permitir preventDefault
 
     // Guarda referência aos handlers de mouse (como antes)
     windowState.dragMoveHandler = handleMouseMoveDrag;
     windowState.dragUpHandler = handleMouseUpDrag;
 
    windowState.dragMoveHandler = handleMouseMoveDrag; windowState.dragUpHandler = handleMouseUpDrag;


    // ==================================================
    // == INÍCIO DO BLOCO DE RESIZE TEMPORARIAMENTE COMENTADO ==
    // ==================================================
    /*
    // Resizing (Se aplicável)
    if (canResize) {
        const resizer = document.createElement('div'); resizer.className = 'resizer'; windowDiv.appendChild(resizer);
        let isResizing = false; // Define isResizing localmente para este bloco
        let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight;

        // Handler de movimento durante resize (revisado para clareza)
        const handleMouseMoveResize = (e) => {
            if (!isResizing) { return; }
            let newWidth = resizeStartWidth + (e.clientX - resizeStartX);
            let newHeight = resizeStartHeight + (e.clientY - resizeStartY);

            // Obtém e valida o minWidth do estilo
            const currentMinWidthStyle = windowDiv.style.minWidth;
            const parsedMinWidth = parseInt(currentMinWidthStyle, 10);
            const minWidth = (!isNaN(parsedMinWidth) && parsedMinWidth > 0) ? parsedMinWidth : 150;

            // Obtém e valida o minHeight do estilo
            const currentMinHeightStyle = windowDiv.style.minHeight;
            const parsedMinHeight = parseInt(currentMinHeightStyle, 10);
            const minHeight = (!isNaN(parsedMinHeight) && parsedMinHeight > 0) ? parsedMinHeight : 100;

            // Aplica Mínimos
            if (newWidth < minWidth) { newWidth = minWidth; }
            if (newHeight < minHeight) { newHeight = minHeight; }

            // Aplica Novas Dimensões
            windowDiv.style.width = `${newWidth}px`;
            windowDiv.style.height = `${newHeight}px`;

            // Atualiza altura do conteúdo e estado
            updateContentHeight();
            if (!windowState.isMaximized) { windowState.originalDimensions = { width: `${newWidth}px`, height: `${newHeight}px` }; }

            // Notifica iframe
            const iframe = content.querySelector('iframe');
            if (iframe) { try { iframe.contentWindow.dispatchEvent(new Event('resize')); } catch (err) { } }
        };

        const handleMouseUpResize = () => {
             if (!isResizing) return; isResizing = false; windowDiv.style.userSelect = '';
             document.removeEventListener('mousemove', handleMouseMoveResize); document.removeEventListener('mouseup', handleMouseUpResize);
        };
        resizer.addEventListener('mousedown', (e) => {
            if (windowState.isMaximized) return; isResizing = true; resizeStartX = e.clientX; resizeStartY = e.clientY;
            resizeStartWidth = parseInt(windowDiv.style.width, 10); resizeStartHeight = parseInt(windowDiv.style.height, 10);
            windowDiv.style.userSelect = 'none'; document.addEventListener('mousemove', handleMouseMoveResize); document.addEventListener('mouseup', handleMouseUpResize);
        });
        windowState.resizeMoveHandler = handleMouseMoveResize; windowState.resizeUpHandler = handleMouseUpResize;
    }
    */
    // ================================================
    // == FIM DO BLOCO DE RESIZE TEMPORARIAMENTE COMENTADO ==
    // ================================================


    // Window Focusing
     windowDiv.addEventListener('mousedown', () => {
          if (parseInt(windowDiv.style.zIndex) < windowManager.zIndex - 1) { windowDiv.style.zIndex = windowManager.zIndex++; }
          windowState.taskIcon?.click();
      }, true);

    // Control Button Actions
    minimize.addEventListener('click', (e) => { e.stopPropagation(); windowDiv.style.display = 'none'; windowState.taskIcon?.classList.add('minimized'); windowState.taskIcon?.classList.remove('active'); titleBar.classList.add('inactive'); });
    maximizeRestore.addEventListener('click', (e) => { e.stopPropagation(); if (!canResize) return;
        if (windowState.isMaximized) { // Restore
             windowDiv.style.left = windowState.originalPosition.left; windowDiv.style.top = windowState.originalPosition.top; windowDiv.style.width = windowState.originalDimensions.width; windowDiv.style.height = windowState.originalDimensions.height;
             windowState.isMaximized = false; maximizeRestore.setAttribute('aria-label', 'Maximize');
             // windowDiv.querySelector('.resizer')?.style.display = ''; // Resizer está comentado
             titleBar.style.cursor = 'move';
         } else { // Maximize
             windowState.originalPosition = { left: windowDiv.style.left, top: windowDiv.style.top }; windowState.originalDimensions = { width: windowDiv.style.width, height: windowDiv.style.height };
             windowDiv.style.left = '0'; windowDiv.style.top = '0'; windowDiv.style.width = '100%'; windowDiv.style.height = `calc(100% - 32px)`;
             windowState.isMaximized = true; maximizeRestore.setAttribute('aria-label', 'Restore');
             // windowDiv.querySelector('.resizer')?.style.display = 'none'; // Resizer está comentado
             titleBar.style.cursor = 'default';
         }
         updateContentHeight(); const iframe = content.querySelector('iframe'); if (iframe) try { iframe.contentWindow.dispatchEvent(new Event('resize')); } catch (err) {} windowState.taskIcon?.click();
    });

    // --- 4. Cleanup Logic (Revisada) ---
    close.addEventListener('click', (e) => {
        e.stopPropagation(); console.log(`[window] Close ${windowId}`);
        const stateToClean = windowManager.windows[windowId]; if (!stateToClean) { console.warn(`[window] Tentativa de fechar ${windowId} que já foi removida.`); return; }
        try {
            // Remove listeners globais associados a esta janela
            if (stateToClean.dragMoveHandler) document.removeEventListener('mousemove', stateToClean.dragMoveHandler);
            if (stateToClean.dragUpHandler) document.removeEventListener('mouseup', stateToClean.dragUpHandler);
            // Não precisa remover listeners de resize, pois o bloco está comentado
            // if (stateToClean.resizeMoveHandler) document.removeEventListener('mousemove', stateToClean.resizeMoveHandler);
            // if (stateToClean.resizeUpHandler) document.removeEventListener('mouseup', stateToClean.resizeUpHandler);

            // Remove elementos associados
            stateToClean.taskIcon?.remove();
            stateToClean.windowDiv?.remove();
            // Remove referência do gerenciador
            if (windowManager.windows[windowId]) {
                delete windowManager.windows[windowId];
                console.log(`[window] Janela ${windowId} removida do gerenciador.`);
            }
        } catch (error) {
            console.error(`[window] Erro durante cleanup de ${windowId}:`, error);
            document.getElementById(windowId)?.remove(); // Fallback
            if (windowManager.windows[windowId]) delete windowManager.windows[windowId];
        }
    });

    // --- 5. Global Helper/Integration ---
    // Adiciona o ícone mesmo com a janela simplificada, mas ele não terá todos os listeners
    if (typeof window.addTaskbarIcon === 'function') {
        window.addTaskbarIcon(windowId, appName, appSettings);
         // Foca a janela (mesmo simplificada)
        setTimeout(() => { windowState.taskIcon?.click(); }, 0);
    } else { console.error("[window] Função addTaskbarIcon não encontrada."); }

    return windowId; // Sucesso
} // Fim da função openWindow