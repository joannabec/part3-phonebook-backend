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

app.use(express.static('build'));
app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))

app.get('/api/persons', (_, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
});

app.get('/info', (_, res) => {
  const time = new Date().toString();
  Person.find({}).then(result => {
    res.send(`
    <p>Phonebook has info of ${result.length} people</p>
    <p>${time}</p>
  `)
  })
});

app.get('/api/persons/:id', (req, resp, next) => {
  Person.findById(req.params.id)
  .then(contact => {
    if (contact) {
      resp.json(contact)
    } else {
      resp.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
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

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedContact => {
      res.json(updatedContact)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
