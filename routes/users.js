const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//  carregando model usuario
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Pagina de Login
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Pagina de Cadastro
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Cadastro
router.post('/register', (req, res) => {
  const { email, name, password, password2 } = req.body;
  let err = [];

  if (!email || !name || !password || !password2) {
    err.push({ msg: 'Por favor, preencha todos os campos!' });
  }

  if (password != password2) {
    err.push({ msg: 'Senhas não condizem' });
  }

  if (password.length < 6) {
    err.push({ msg: 'Opa, senha muito curta' });
  }

  if (err.length > 0) {
    res.render('register', {
      err,
      email,
      name,      
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        err.push({ msg: 'E-mail já cadastrado' });
        res.render('register', {
          err,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Parabéns, agora so logar'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login routes
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//  Logout routes
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Desconectado');
  res.redirect('/users/login');
});

module.exports = router;
