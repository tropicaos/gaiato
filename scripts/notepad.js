/* TABLE OF CONTENTS
    1. Editor Logic
*/

// 1. Editor Logic
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    editor.value = localStorage.getItem('bloquinho-content') || '';
    editor.addEventListener('input', () => {
        localStorage.setItem('bloquinho-content', editor.value);
    });
});