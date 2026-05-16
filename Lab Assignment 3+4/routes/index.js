const express = require('express');
const router = express.Router();

// Landing page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Welcome to MERN E-Commerce',
    description: 'The best place to find awesome products.'
  });
});

module.exports = router;
