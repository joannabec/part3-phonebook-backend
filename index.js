const express = require('express');
const app = express();

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

app.use(express.json())

app.get('/api/persons', (req, res) => {
  res.json(persons)
});

app.get('/info', (req, res) => {
  const time = new Date().toString();
  res.send(`
    <p>Phonebook has info of ${persons.length} people</p>
    <p>${time}</p>
  `);
;
});

app.get('/api/persons/:id', (req, res) => {
  const id = +req.params.id;
  const item = persons.find(person => person.id === id);

  if (item) res.json(item);
  else res.status(404).end();
  
});

app.delete('/api/persons/:id', (req, res) => {
  const id = +req.params.id;
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;

  if(!name || !number) {
    return res.status(400).json({ 
      error: 'name or number is missing' 
    })
  }
  const nameExists = persons.find((person) => person.name === name);
  console.log(nameExists);

  if(!nameExists) {
    const person = {
      id: Math.floor(Math.random() * 1000000),
      name,
      number
    }
  
    persons = persons.concat(person);
    res.json(person)
  } else {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }
  
  
});

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});