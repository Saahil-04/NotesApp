const titleInput = document.getElementById('title');
const descInput = document.getElementById('desc');
const saveBtn = document.getElementById('save-btn');
const noteContainer = document.getElementById('notes-container');
const note = document.querySelector('.note')

function loadNotes() {
    fetch('/notes')
        .then(res => res.json())
        .then(notes => {
            noteContainer.innerHTML = '';
            notes.forEach((note, index) => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note')
                noteElement.innerHTML = `
                <h2>${note.title}</h2>
                <p>${note.description}</p>
                <button onclick="deleteNote(${index})">Delete</button>
                `
                noteContainer.appendChild(noteElement)
            })
        })
}

function deleteNote(index) {
    fetch(`/notes/${index}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => loadNotes())
}

loadNotes()

saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!title || !description) alert("Fill both the fields!")

    const note = { title, description };

    fetch("/notes",
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
        }
    )
        .then(res => res.json())
        .then(() => loadNotes());
})

    

