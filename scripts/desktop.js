/* TABLE OF CONTENTS
    1. Desktop Manager
    2. Icon Rendering
*/

// 1. Desktop Manager
const desktopManager = {
    icons: [
        { id: 'benji', name: 'BENJI', icon: 'assets/icons/plushbear.ico', row: 0, col: 0, action: () => openWindow('benji') },
        { id: 'poligonal', name: 'Poligonal', icon: 'assets/icons/poligonal.ico', row: 1, col: 0, action: () => console.log('[desktop] Poligonal é um placeholder') },
        { id: 'gaiato', name: 'Gaiato', icon: 'assets/icons/gaiato.ico', row: 2, col: 0, action: () => console.log('[desktop] Gaiato é um placeholder') },
        { id: 'notepad', name: 'Bloquinho', icon: 'assets/icons/notepad.ico', row: 3, col: 0, action: () => openWindow('notepad') }
    ],
    getIconPosition(iconId) {
        const icon = this.icons.find(i => i.id === i.id);
        if (!icon) return null;
        return {
            left: (icon.col * 80 + 10) + 'px',
            top: (icon.row * 80 + 10) + 'px'
        };
    },
    initializeDesktop() {
        console.log('[desktop] Inicializando desktop');
        const desktop = document.getElementById('desktop');
        if (!desktop) {
            console.error('[desktop] Elemento #desktop não encontrado');
            return;
        }
        desktop.innerHTML = '';
        this.icons.forEach(icon => {
            console.log(`[desktop] Renderizando ícone ${icon.id}`);
            const iconElement = document.createElement('div');
            iconElement.className = 'icon';
            iconElement.dataset.id = icon.id;
            iconElement.style.gridRow = icon.row + 1;
            iconElement.style.gridColumn = icon.col + 1;
            const img = document.createElement('img');
            img.src = icon.icon;
            img.alt = icon.name;
            img.onerror = () => console.error(`[desktop] Erro ao carregar ícone ${icon.icon}`);
            const span = document.createElement('span');
            span.textContent = icon.name;
            iconElement.appendChild(img);
            iconElement.appendChild(span);
            iconElement.addEventListener('click', () => {
                console.log(`[desktop] Clicado em ${icon.id}`);
                icon.action();
            });
            desktop.appendChild(iconElement);
    });
},

// 3. Initialization
initializeDesktop() {
        console.log('[desktop] Inicializando desktop');
        const desktop = document.getElementById('desktop');
        if (!desktop) {
            console.error('[desktop] Elemento #desktop não encontrado');
            return;
        }
        desktop.innerHTML = ''; // Limpar desktop existente
        desktopManager.icons.forEach(icon => {
            console.log(`[desktop] Renderizando ícone ${icon.id}`);
            const iconElement = document.createElement('div');
            iconElement.className = 'icon';
            iconElement.dataset.id = icon.id;
            iconElement.style.gridRow = icon.row + 1;
            iconElement.style.gridColumn = icon.col + 1;

            const img = document.createElement('img');
            img.src = icon.icon;
            img.alt = icon.name;
            img.onerror = () => console.error(`[desktop] Erro ao carregar ícone ${icon.icon}`);

            const span = document.createElement('span');
            span.textContent = icon.name;

            iconElement.appendChild(img);
            iconElement.appendChild(span);

            iconElement.addEventListener('click', () => {
                console.log(`[desktop] Clicado em ${icon.id}`);
                icon.action();
            });

            desktop.appendChild(iconElement);
        });
    }
};

// TODO: Implementar transformação negativa (inversão de cores) para ícones selecionados após implementação do grid (arrastar e soltar)