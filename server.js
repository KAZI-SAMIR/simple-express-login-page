if (process.env.NODE_ENV !== 'production'){
   require('dotenv').config()
}
  
const method = require('method-override')
const express = require('express')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const bcrypt = require('bcrypt')

const initializePassport = require('./passport-config')

initializePassport(
  passport,
  email => users.find(users => users.email === email),
  id => users.find(user => user.id === id)
)
const users = []
//view engine//
app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(method('_method'))
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// Pages //

app.get('/',checkAuthenticated, (req, res) => {
  res.render('index.ejs', {
    name: req.user.name
  })
})

app.get('/login',checkNotAuthenticated,(req, res) => {
  res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register',checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated, async (req, res) => {
    try {
    const hashpass = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashpass
    })
    res.redirect('/login')
  }catch {
    res.redirect('/register')
  }
  console.log(users)
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})
function checkAuthenticated(req, res, next) {
   if (req.isAuthenticated()){
     return next()
   }
   res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
if (req.isAuthenticated()){
     return res.redirect('/')
  }
  next()
}

const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server running on PORT ${PORT}`));