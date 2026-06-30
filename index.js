const titleInput = document.getElementById('title');
const descInput = document.getElementById('desc');
const saveBtn = document.getElementById('save-btn');
const noteContainer = document.getElementById('notes-container');
const note = document.querySelector('.note')
const noteMsg = document.getElementById('note-msg')

let editIndex = null;

function loadNotes() {
    fetch('/notes')
        .then(res => res.json())
        .then(notes => {
            noteContainer.innerHTML = '';
            titleInput.value = '';
            descInput.value = '';
            if (notes.length === 0) {
                noteContainer.innerHTML = ` <div id="note-msg">Your notes will appear here.</div>`
            }
            notes.forEach((note, index) => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note')
                noteElement.innerHTML = `
                <h2>${note.title}</h2>
                <p>${note.description}</p>
                <button onclick="deleteNote(${index})">Delete</button>
                <button onclick="editNote(${index})">Edit</button>
                `
                noteContainer.appendChild(noteElement)
            })
        })
}

loadNotes()

function deleteNote(index) {
    fetch(`/notes/${index}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => loadNotes())
}

function editNote(index) {
    fetch('/notes')
        .then(res => res.json())
        .then(notes => {
            titleInput.value = notes[index].title;
            descInput.value = notes[index].description;
            editIndex = index;
        })
    saveBtn.textContent = "Update Note"
}

function saveNote() {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (title === "" || description === "") {
        alert("Fill both the fields!");
        return;
    }
    const note = { title, description };

    if (editIndex !== null && editIndex !== undefined) {
        fetch(`/notes/${editIndex}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note),
            }
        )
            .then(res => res.json())
            .then(() => loadNotes())

        saveBtn.textContent = "Save Note";
        editIndex = null;
    } else {
        fetch("/notes",
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(note),
            }
        )
            .then(res => res.json())
            .then(() => loadNotes());

    }

}

saveBtn.addEventListener('click', () => saveNote())





