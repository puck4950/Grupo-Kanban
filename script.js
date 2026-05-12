// 1. Carrega os cards assim que a página abre
document.addEventListener('DOMContentLoaded', loadCards);

// Funções do Modal (Pop-up)
function openModal() { document.getElementById('taskModal').style.display = 'block'; }
function closeModal() { document.getElementById('taskModal').style.display = 'none'; }

// 2. Adiciona uma nova tarefa
function addTask() {
    const editId = document.getElementById('editCardId').value;
    const title = document.getElementById('taskTitle').value;
    const desc = document.getElementById('taskDesc').value;
    const priority = document.getElementById('taskPriority').value;
    const label = document.getElementById('taskLabel').value;
    const imageFile = document.getElementById('taskImage').files[0];

    if (!title) return alert("Título é obrigatório!");

    if (editId) {
        // MODO EDIÇÃO: Atualiza o card existente
        const card = document.getElementById(editId);
        card.querySelector('strong').innerText = title;
        card.querySelector('.desc').innerText = desc;
        card.querySelector('.priority-text').innerText = `⚠️ Prioridade: ${priority}`;
        
        const tag = card.querySelector('.tag');
        tag.innerText = label.toUpperCase();
        tag.className = `tag tag-${label.toLowerCase().replace(/\s+/g, '-')}`;

        // Se houver nova imagem, atualiza
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                let img = card.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    card.prepend(img);
                }
                img.src = e.target.result;
                saveState();
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveState();
        }
    } else {
        // MODO CRIAÇÃO: (Lógica que você já tinha)
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                createCard(title, desc, e.target.result, 'col-entrada', priority, label);
                saveState();
            };
            reader.readAsDataURL(imageFile);
        } else {
            createCard(title, desc, null, 'col-entrada', priority, label);
            saveState();
        }
    }

    closeModal();
    resetModal(); // Função para limpar tudo
}

function resetModal() {
    document.getElementById('editCardId').value = "";
    document.getElementById('taskTitle').value = "";
    document.getElementById('taskDesc').value = "";
    document.getElementById('btnMainAction').innerText = "Salvar Tarefa";
}

// 3. Cria visualmente o card no HTML
function createCard(title, desc, imgSrc, columnId, priority, label) {
    const targetColumn = document.getElementById(columnId) || document.getElementById('col-entrada');
    const container = targetColumn.querySelector('.cards-container');
    
    const cardId = "card-" + Date.now() + Math.random().toString(36).substr(2, 5);

    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.id = cardId;
    card.ondragstart = drag;

    const labelClass = "tag-" + label.toLowerCase().replace(/\s+/g, '-');
    const imgHtml = imgSrc ? `<img src="${imgSrc}">` : '';

    card.innerHTML = `
        ${imgHtml}
        <div class="card-content">
            <span class="tag ${labelClass}">${label.toUpperCase()}</span>
            <p><strong>${title}</strong></p>
            <p class="desc">${desc}</p>
            <span class="priority-text">⚠️ Prioridade: ${priority}</span>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button onclick="editCard('${cardId}')" style="font-size: 10px; color: blue; border:none; background:none; cursor:pointer;">[Editar]</button>
                <button onclick="this.closest('.card').remove(); saveState();" style="font-size: 10px; color: red; border:none; background:none; cursor:pointer;">[Excluir]</button>
            </div>
        </div>
    `;

    container.appendChild(card);
}

// 4. Drag and Drop
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    let target = ev.target;
    while (target && !target.classList.contains('column')) {
        target = target.parentElement;
    }
    if (target) {
        target.querySelector('.cards-container').appendChild(draggedElement);
        saveState(); // Salva a nova posição depois de mover o quadrado
    }
}

// 5. SALVAR NO NAVEGADOR (LocalStorage) - usei mt em jogos
function saveState() {
    const boardData = [];
    const columns = document.querySelectorAll('.column');

    columns.forEach(col => {
        const cards = col.querySelectorAll('.card');
        cards.forEach(card => {
            boardData.push({
                title: card.querySelector('strong').innerText,
                desc: card.querySelector('.desc').innerText,
                label: card.querySelector('.tag').innerText,
                priority: card.querySelector('.priority-text').innerText.replace('⚠️ Prioridade: ', ''),
                img: card.querySelector('img') ? card.querySelector('img').src : null,
                column: col.id
            });
        });
    });

    try {
        localStorage.setItem('meuPlannerData', JSON.stringify(boardData));
    } catch (e) {
        console.error("Erro ao salvar: LocalStorage cheio (provavelmente imagem muito grande).", e);
    }
}

// 6. CARREGAR DO NAVEGADOR
function loadCards() {
    const savedData = localStorage.getItem('meuPlannerData');
    if (!savedData) return;

    const boardData = JSON.parse(savedData);
    boardData.forEach(item => {
        // Recria o card com todos os dados salvos
        createCard(item.title, item.desc, item.img, item.column, item.priority, item.label);
    });
}

// Abre o modal para edição
function editCard(cardId) {
    const card = document.getElementById(cardId);
    
    // Captura os dados atuais do card
    const title = card.querySelector('strong').innerText;
    const desc = card.querySelector('.desc').innerText;
    const label = card.querySelector('.tag').innerText;
    const priority = card.querySelector('.priority-text').innerText.replace('⚠️ Prioridade: ', '');

    // Preenche o modal
    document.getElementById('taskTitle').value = title;
    document.getElementById('taskDesc').value = desc;
    document.getElementById('taskPriority').value = priority;
    
    // Ajusta o select do rótulo (precisa bater com o texto ou value)
    document.getElementById('taskLabel').value = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    
    // Guarda o ID que estamos editando
    document.getElementById('editCardId').value = cardId;
    document.getElementById('btnMainAction').innerText = "Atualizar Card";
    
    openModal();
}