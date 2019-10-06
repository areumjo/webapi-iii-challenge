const express = require('express');
const userRouter = require('./users/userRouter.js');

const server = express();

// Built-in Middleware
server.use(express.json());

server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`)
});

// Custom Middleware
server.use(logger);

// Router
server.use('/api/users', userRouter);

// when you GET request with http://localhost:4000/d
// [2019-10-06T18:53:58.494Z] GET to /d from undefined
function logger(req, res, next) {
  console.log(
    `[${new Date().toISOString()}] reqest method ${req.method} to request url ${req.url} from ${req.get(
      'Origin'
    )}`
  );
  next();
};

module.exports = server;
