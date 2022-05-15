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
// GET ALL
app.get('/api/persons', (_, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
});
// GET INFO
app.get('/info', (_, res) => {
  const time = new Date().toString();
  Person.find({}).then(result => {
    res.send(`
    <p>Phonebook has info of ${result.length} people</p>
    <p>${time}</p>
  `)
  })
});
// GET BY ID
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
// DELETE
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
});
// POST
app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;
  
  if(!name || !number) {
    return res.status(400).json({ 
      error: 'name or number is missing' 
    })
  }

  Person.find({name}, function(_, contact) {
    if (contact.length) {
      return res.status(400).json({ 
        error: 'name already exists' 
      })
    } else {
      const person = new Person({ name, number });

      person.save().then(savedPerson => {
        res.json(savedPerson)
      }).catch((error) => next(error))
    }
  })
});

// PUT
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
// ENDPOINT
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
// ERROR
const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
