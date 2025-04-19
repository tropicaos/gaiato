const desktopManager = {
    icons: [
        { id: 'text-engine', name: 'BENJI', icon: 'assets/icons/plushbear.ico', row: 0, col: 0, action: () => openWindow('text-engine') },
        { id: 'poligonal', name: 'Poligonal', icon: 'assets/icons/poligonal.ico', row: 1, col: 0, action: () => openWindow('poligonal') },
        { id: 'gaiato', name: 'Gaiato', icon: 'assets/icons/gaiato.ico', row: 2, col: 0, action: () => openWindow('gaiato') },
        { id: 'notepad', name: 'Notepad', icon: 'assets/icons/notepad.ico', row: 3, col: 0, action: () => openWindow('notepad') }
    ],

    getIconPosition(iconId) {
        const icon = this.icons.find(i => i.id === iconId);
        if (!icon) return null;
        return {
            left: (icon.col * 80 + 10) + 'px',
            top: (icon.row * 80 + 10) + 'px'
        };
    },

    initializeDesktop() {
        const desktop = document.getElementById('desktop');
        desktop.innerHTML = ''; // Limpar desktop existente
        this.icons.forEach(icon => {
            const iconElement = document.createElement('div');
            iconElement.className = 'icon';
            iconElement.dataset.id = icon.id;
            iconElement.style.gridRow = icon.row + 1;
            iconElement.style.gridColumn = icon.col + 1;

            const img = document.createElement('img');
            img.src = icon.icon;
            img.alt = icon.name;

            const span = document.createElement('span');
            span.textContent = icon.name;

            iconElement.appendChild(img);
            iconElement.appendChild(span);

            iconElement.addEventListener('click', icon.action);

            desktop.appendChild(iconElement);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    desktopManager.initializeDesktop();
});