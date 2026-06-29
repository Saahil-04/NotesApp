const express = require('express');
const fs = require('fs')
const app = express()

app.use(express.json());
app.use(express.static('.'))

app.get('/notes', (req, res) => {
    const notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
    res.json(notes);
});

app.post('/notes', (req, res) => {
    const notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
    const newNote = req.body;
    notes.push(newNote);
    fs.writeFileSync('notes.json', JSON.stringify(notes))
    res.json({ message: 'Note Saved' });
})

app.put('/notes/:index', (req, res) => {
    const notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
    const index = req.params.index;
    const updatedNote = req.body;
    notes[index] = updatedNote;
    fs.writeFileSync('notes.json', JSON.stringify(notes));
    res.json({ message: 'Note Updated' })
})

app.delete('/notes/:index', (req, res) => {
    const notes = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));
    const index = req.params.index;
    notes.splice(index, 1);
    fs.writeFileSync('notes.json', JSON.stringify(notes));
    res.json({ message: 'Note Deleted' });
})



app.listen(3000, () => {
    console.log("Server running on Port 3000")
});