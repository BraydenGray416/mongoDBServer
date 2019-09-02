const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Require the config file
const config = require('./config.json');

// Get the Model for our Product
const Product = require('./models/products');
// Get the Model for our Users
const User = require('./models/users');

// Connect to Mongoose
mongoose.connect(`mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@braydenscluster-n7qmw.mongodb.net/shop?retryWrites=true&w=majority`, {useNewUrlParser: true});

  // Test the connection to mongoose
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('we are connected to mongo db');
  });

  // Convert our json data which gets sent into JS so we can process it
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:false}));

  // Allow Cross Origin requests, ie http to https requests
  app.use(cors());

  // Create a console message showing us what request we are asking for
  app.use(function(req, res, next){
    console.log(`${req.method} request for ${req.url}`);
    next();
  });

  //Home Route
  app.get('/', function(req, res){
    res.send('Welcome to our Products API. Use endpoints to filter out the data');
  });

  //Add a new Product
  app.post('/product', function(req, res){
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      price: req.body.price
    });

    product.save().then(result => {
      res.send(result);
    }).catch(err => res.send(err));
  });

  // Get all Products
  app.get('/allProducts', function(req, res){
    Product.find().then(result => {
      res.send(result);
    })
  })

  //Get single Product based on ID
  app.get('/product/:id', function(req, res){
    const id = req.params.id;
    Product.findById(id, function (err, product) {
      res.send(product);
    });
  });

  // Update a product based on id
  app.patch('/product/:id', function(req, res){
    const id = req.params.id;
    const newProduct = {
      name: req.body.name,
      price: req.body.price
    };
    Product.updateOne({ _id : id }, newProduct).then(result => {
      res.send(result);
    }).catch(err => res.send(err));
  })


  // Delete a product based on id
  app.delete('/product/:id', function(req, res){
    const id = req.params.id;
    Product.deleteOne({ _id: id }, function (err) {
      res.send('deleted');
    });
  });


  app.post('/users', function(req, res){
    User.findOne({ username: req.body.username}, function (err, checkUser) {
      if (checkUser) {
        res.send('user already exists');
      } else {
        const hash = bcrypt.hashSync(req.body.password);
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          username: req.body.username,
          email: req.body.email,
          password: hash
        });

        user.save().then(result => {
          res.send(result);
        }).catch(err => res.send(err));
      }
    });

  })

  app.post('/getUser', function(req, res){
    User.findOne({ username: req.body.username}, function (err, checkUser) {
      if (checkUser) {
        if(bcrypt.compareSync(req.body.password, checkUser.password)){
            console.log('password matches');
            res.send('password matches')
        } else {
            console.log('password does not match');
            res.send('invalid password')
        }
      } else {
      res.send('invalid user');
      }
    }).catch(err => res.send(err));
    console.log(`${req.body.username}`);
    console.log(`${req.body.password}`);

  })

  // Listen to the port number
  app.listen(port, () => {
    console.clear();
    console.log(`application is running on port ${port}`)
  });
