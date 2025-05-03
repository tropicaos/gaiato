/* TABLE OF CONTENTS
    1. Desktop Manager Object (desktopManager)
       - icons array
       - getIconPosition method (currently unused)
       - initializeDesktop method
    2. Icon Rendering Function (renderIcon)
*/

/* 1. Desktop Manager Object (desktopManager) */
const desktopManager = {
    icons: [
        // Define os ícones padrão do desktop e suas ações
        { id: 'benji', name: 'BENJI', icon: 'assets/icons/plushbear.ico', row: 0, col: 0, action: () => openWindow('benji') },
        { id: 'poligonal', name: 'Poligonal', icon: 'assets/icons/poligonal.ico', row: 1, col: 0, action: () => openWindow('poligonal') }, // Placeholder
        { id: 'gaiato', name: 'Gaiato', icon: 'assets/icons/gaiato.ico', row: 2, col: 0, action: () => openWindow('gaiato') },       // Placeholder
        { id: 'notepad', name: 'Bloquinho', icon: 'assets/icons/Notepad.ico', row: 3, col: 0, action: () => openWindow('notepad') }
        // { id: 'pinto', name: 'Pinto', icon: 'assets/icons/paint.ico', row: 0, col: 1, action: () => openWindow('pinto') } // Exemplo de outro ícone
    ],

    // Função para obter posição (útil se implementar drag-and-drop no futuro)
    getIconPosition(iconId) {
        const icon = this.icons.find(i => i.id === iconId);
        if (!icon) return null;
        // Calcula posição baseada na linha/coluna do grid
        return {
            left: (icon.col * 80 + 10) + 'px', // 80 = grid column width, 10 = padding/gap
            top: (icon.row * 80 + 10) + 'px'   // 80 = grid row height, 10 = padding/gap
        };
    },

    // Inicializa o desktop, renderizando os ícones
    initializeDesktop() {
        console.log('[desktop] Inicializando desktop');
        const desktop = document.getElementById('desktop');
        if (!desktop) {
            console.error('[desktop] Elemento #desktop não encontrado');
            return;
        }
        desktop.innerHTML = ''; // Limpa ícones antigos se houver
        this.icons.forEach(icon => renderIcon(icon));
    }
};

/* 2. Icon Rendering Function (renderIcon) */
function renderIcon(icon) {
    // console.log(`[desktop] Renderizando ícone ${icon.id}`); // Log menos verboso
    const desktop = document.getElementById('desktop');
    const iconElement = document.createElement('div');
    iconElement.className = 'icon'; // Classe definida em main.css para estilo/layout
    iconElement.dataset.id = icon.id; // Guarda ID para referência futura
    // Define posição no grid CSS
    iconElement.style.gridRow = icon.row + 1; // CSS grid é 1-based
    iconElement.style.gridColumn = icon.col + 1;

    const img = document.createElement('img');
    img.src = icon.icon;
    img.alt = icon.name;
    img.style.width = '32px'; // Tamanho padrão do ícone
    img.style.height = '32px';
    img.ondragstart = () => false; // Previne arrastar nativo da imagem
    img.onerror = () => console.error(`[desktop] Erro ao carregar ícone ${icon.icon}`);

    const span = document.createElement('span');
    span.textContent = icon.name;
    // Estilos do span vêm do main.css

    iconElement.appendChild(img);
    iconElement.appendChild(span);

    // Adiciona evento de clique para executar a ação definida
    iconElement.addEventListener('click', () => {
        console.log(`[desktop] Clicado em ${icon.id}`);
        if (typeof icon.action === 'function') {
            icon.action(); // Chama a função (ex: openWindow)
        }
    });

    // Adiciona evento de duplo clique (pode ter a mesma ação do clique simples)
    iconElement.addEventListener('dblclick', () => {
         console.log(`[desktop] Duplo clique em ${icon.id}`);
         if (typeof icon.action === 'function') {
             icon.action();
         }
     });


    desktop.appendChild(iconElement);
}

/* Futuro: Implementar seleção de ícones (inversão de cores/outline)
   e drag-and-drop para reorganizar ícones, atualizando desktopManager.icons */