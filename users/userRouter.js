const express = require('express');

const Users = require('./userDb.js');
const Posts = require('../posts/postDb.js');
const router = express.Router();

// /api/users -- router
router.use((req, res, next) => {
    console.log('User router'); // whenever we use this route (which is /api/hubs), print this out
    next();
  })

// POST user : { "name": "Frodo Baggins" }
router.post('/', validateUser, (req, res) => {
    Users.insert(req.body)
        .then(user => {
            res.json(201).json(user);
        })
        .catch(er => {
            res.status(500).json({
                message: 'Error adding new user',
            })
        })
});

// POST post json : { user_id: 1, text: 'NEW POST by userId 1' }
router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
    const postInfo = req.body;
    console.log('postInfo: ', postInfo);
    Posts.insert(postInfo)
        .then(post => {
            res.status(201).json(post);
        })
        .catch(err => {
            res.status(500).json({
                message: 'Error posting new post on user id'
            })
        })
});

router.get('/', (req, res) => {
    Users.get(req.query)
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({
                message: 'Error retrieving the users',
            })
        })
});

router.get('/:id', validateUserId, (req, res) => {
    res.status(200).json(req.user);
    // const { id } = req.params;
    // Users.getById(id)
    //     .then(user => {
    //         res.status(200).json(user);
    //     })
    //     .catch(err => {
    //         res.status(500).json({
    //             message: 'Error retrieving a user by userId'
    //         })
    //     })
});

router.get('/:id/posts', validateUserId, (req, res) => {
    const { id } = req.params;
    Users.getUserPosts(id)
        .then(userPost => {
            res.status(200).json(userPost);
        })
        .catch(err => {
            res.status(500).json({
                message: 'Error retrieving user post by userID'
            })
        })
});

router.delete('/:id', validateUserId, (req, res) => {
    const { id } = req.user;
    Users.remove(id)
        .then(() => res.status(204).end())
        .catch(err => {
            res.status(500).json({
                message: 'Error removing user'
            })
        })

});

router.put('/:id', validateUserId, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    Users.update(id, { name })
        .then(user => res.status(200).json(user))
        .catch(err => {
            res.status(500).json({
                message: 'Error updaing user'
            })
        })
});

//custom middleware

function validateUserId(req, res, next) {
    const { id } = req.params;
    Users.getById(id)
        .then(user => {
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(404).json({ message: "invalid user id from middleware - validateUserId" });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Failed to process request from middleware - validateUserId' })
        })
};

function validateUser(req, res, next) {
    // if (req.body && Object.keys(req.body).length) {
    //     next();
    // } else {
    //     next({ message: 'Please include request body'})
    // }
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "missing user data" });
    }
    if (typeof name !== 'string') {
        return res.status(400).json({ error: "Name must be string" });
    }
    req.body = { name };
    next();
};

function validatePost(req, res, next) {
    const { id: user_id } = req.params;
    console.log('id: ', user_id);

    const { text } = req.body;
    console.log('text', req.body);

    if (!req.body) {
        return res.status(400).json({ message: "Post requires body" })
    }
    if (!text) {
        return res.status(400).json({ message: "Post requires text"})
    }
    req.body = { user_id, text };
    next();
};

module.exports = router;
