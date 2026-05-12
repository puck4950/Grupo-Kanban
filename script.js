import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// CONFIG FIREBASE
// =====================================

const firebaseConfig = {

    apiKey: "AIzaSyCMSdGbn6RAPmqq5npbUf4l40oeI-YrTUw",

    authDomain: "grupo-kanban.firebaseapp.com",

    projectId: "grupo-kanban",

    storageBucket: "grupo-kanban.appspot.com",

    messagingSenderId: "71394193509",

    appId: "1:71394193509:web:363853c27fc64dfe3e968c"

};


// =====================================
// INICIAR FIREBASE
// =====================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// =====================================
// CARREGAR EM TEMPO REAL
// =====================================

document.addEventListener('DOMContentLoaded', () => {

    loadRealtimeCards();

});


// =====================================
// MODAL
// =====================================

window.openModal = function () {

    document.getElementById('taskModal').style.display = 'block';

}

window.closeModal = function () {

    document.getElementById('taskModal').style.display = 'none';

}


// =====================================
// ADICIONAR / EDITAR CARD (SEM IMAGEM)
// =====================================

window.addTask = async function () {

    const editId =
        document.getElementById('editCardId').value;

    const title =
        document.getElementById('taskTitle').value;

    const desc =
        document.getElementById('taskDesc').value;

    const priority =
        document.getElementById('taskPriority').value;

    const label =
        document.getElementById('taskLabel').value;

    if (!title) {
        alert("Título obrigatório!");
        return;
    }

    const cardData = {

        title,
        desc,
        priority,
        label,
        column: document.getElementById('taskColumn').value

    };

    if (editId) {

        await updateDoc(
            doc(db, "cards", editId),
            cardData
        );

    } else {

        await addDoc(
            collection(db, "cards"),
            cardData
        );

    }

    resetModal();

    closeModal();

};


// =====================================
// RESET MODAL
// =====================================

function resetModal() {

    document.getElementById('editCardId').value = "";

    document.getElementById('taskTitle').value = "";

    document.getElementById('taskDesc').value = "";

    document.getElementById('taskColumn').value = "col-equipe1";

}


// =====================================
// CARREGAR REALTIME
// =====================================

function loadRealtimeCards() {

    onSnapshot(collection(db, "cards"), (snapshot) => {

        document.querySelectorAll('.cards-container')
            .forEach(container => {

                container.innerHTML = "";

            });

        snapshot.forEach((docItem) => {

            const item = docItem.data();

            createCard(

                docItem.id,
                item.title,
                item.desc,
                item.column,
                item.priority,
                item.label

            );

        });

    });

}


// =====================================
// CRIAR CARD (SEM IMAGEM)
// =====================================

function createCard(

    id,
    title,
    desc,
    columnId,
    priority,
    label

) {

    const targetColumn =
        document.getElementById(columnId)
        || document.getElementById('col-equipe1');

    const container =
        targetColumn.querySelector('.cards-container');

    const card = document.createElement('div');

    card.className = 'card';

    card.draggable = true;

    card.id = id;

    card.ondragstart = drag;

    const labelClass =
        "tag-" + label.toLowerCase().replace(/\s+/g, '-');

    card.innerHTML = `

        <div class="card-content">

            <span class="tag ${labelClass}">
                ${label.toUpperCase()}
            </span>

            <p><strong>${title}</strong></p>

            <p class="desc">${desc}</p>

            <span class="priority-text">
                ⚠️ Prioridade: ${priority}
            </span>

            <div style="margin-top:10px; display:flex; gap:10px;">

                <button
                    onclick="editCard('${id}')"
                    style="font-size:10px;color:blue;border:none;background:none;cursor:pointer;"
                >
                    [Editar]
                </button>

                <button
                    onclick="deleteCard('${id}')"
                    style="font-size:10px;color:red;border:none;background:none;cursor:pointer;"
                >
                    [Excluir]
                </button>

            </div>

        </div>

    `;

    container.appendChild(card);

}


// =====================================
// EXCLUIR CARD
// =====================================

window.deleteCard = async function (id) {

    await deleteDoc(doc(db, "cards", id));

}


// =====================================
// EDITAR CARD
// =====================================

window.editCard = function (id) {

    const card = document.getElementById(id);

    const title = card.querySelector('strong').innerText;

    const desc = card.querySelector('.desc').innerText;

    const priority = card.querySelector('.priority-text')
        .innerText
        .replace('⚠️ Prioridade: ', '');

    const label = card.querySelector('.tag').innerText;

    document.getElementById('taskTitle').value = title;

    document.getElementById('taskDesc').value = desc;

    document.getElementById('taskPriority').value = priority;

    document.getElementById('taskLabel').value =
        label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

    document.getElementById('taskColumn').value = card.closest('.column').id;

    document.getElementById('editCardId').value = id;

    openModal();

}


// =====================================
// DRAG AND DROP
// =====================================

window.allowDrop = function (ev) {
    ev.preventDefault();
}

window.drag = function (ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

window.drop = async function (ev) {

    ev.preventDefault();

    const data = ev.dataTransfer.getData("text");

    const draggedElement = document.getElementById(data);

    let target = ev.target;

    while (target && !target.classList.contains('column')) {
        target = target.parentElement;
    }

    if (target) {

        target.querySelector('.cards-container')
            .appendChild(draggedElement);

        await updateDoc(
            doc(db, "cards", data),
            {
                column: target.id
            }
        );

    }

};