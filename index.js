const token = localStorage.getItem('token');

function isTokenExpired(token) {

    const payloadParts = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadParts));
    const currentTime = new Date().getTime() / 1000;
    return decoded.exp < currentTime;
}

if (!token || isTokenExpired(token)) {

    window.location.href = '/login.html';

} else {

    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('desc');
    const saveBtn = document.getElementById('save-btn');
    const noteContainer = document.getElementById('notes-container');
    const logoutBtn = document.getElementById('logout-btn');

    let editingNoteId = null;
    let currentNotes = []

    async function authFetch(url, options = {}) {
        const currentToken = localStorage.getItem('token')
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${currentToken}`
            },
        }).then(res => {
            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return Promise.reject('Unauthorized')
            }
            else {
                return res;
            }
        });
    }

    function loadNotes() {
        authFetch('/notes')
            .then(res => res.json())
            .then(({ data: notes }) => {
                currentNotes = notes
                noteContainer.innerHTML = '';
                titleInput.value = '';
                descInput.value = '';
                if (notes.length === 0) {
                    noteContainer.innerHTML = `<div id="note-msg">Your notes will appear here.</div>`
                }
                notes.forEach((note) => {
                    const noteElement = document.createElement('div');
                    noteElement.classList.add('note')
                    const titleElement = document.createElement('h2');
                    const descElement = document.createElement('p');
                    const deleteBtn = document.createElement('button');
                    const editBtn = document.createElement('button');
                    titleElement.textContent = note.title;
                    descElement.textContent = note.description;
                    deleteBtn.textContent = 'Delete';
                    editBtn.textContent = 'Edit';
                    deleteBtn.addEventListener('click', () => deleteNote(note._id));
                    editBtn.addEventListener('click', () => editNote(note._id))
                    noteElement.appendChild(titleElement)
                    noteElement.appendChild(descElement)
                    noteElement.appendChild(deleteBtn)
                    noteElement.appendChild(editBtn)
                    noteContainer.appendChild(noteElement)
                })
            })
            .catch(err => {
                console.error(err)
                alert("Something went wrong loading the notes. Please try again.")
            });
    }

    loadNotes()

    function deleteNote(id) {
        authFetch(`/notes/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(() => loadNotes())
            .catch(err => {
                console.error(err)
                alert("Something went wrong deleting the note. Please try again.")
            });
    }

    function editNote(id) {
        const note = currentNotes.find(note => note._id === id);
        titleInput.value = note.title;
        descInput.value = note.description;
        editingNoteId = id;
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

        if (editingNoteId !== null && editingNoteId !== undefined) {
            authFetch(`/notes/${editingNoteId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(note),
                }
            )
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Failed to Update Note!');
                    }
                    return res.json();
                })
                .then(() => {
                    loadNotes();
                    saveBtn.textContent = "Save Note";
                    editingNoteId = null;
                }).catch(err => {
                    console.error(err)
                    alert("Something went wrong updating the note. Please try again.")
                })
        } else {
            authFetch("/notes",
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(note),
                }
            )
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Failed to Save Note!');
                    }
                    return res.json();
                })
                .then(() => loadNotes())
                .catch(err => {
                    console.error(err)
                    alert("Something went wrong saving the note. Please try again.")
                });
        }
    }

    saveBtn.addEventListener('click', () => saveNote())
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            const currentToken = localStorage.getItem('token');
            if (!currentToken || isTokenExpired(currentToken)) {
                window.location.href = '/login.html';
            }
        }
    });
}
