require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');

morgan.token('post', function (req) { 
  return req.method === 'POST' && JSON.stringify(req.body);
})

app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))
app.use(express.static('build'));

app.get('/api/persons', (_, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
});

app.get('/info', (_, res) => {
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

  const person = new Person({ name, number });

  person.save().then(savedPerson => {
    res.json(savedPerson)
  });
});

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});