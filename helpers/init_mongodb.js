const mongoose = require('mongoose')

mongoose.connect(process.env.DB_CONNECTION_STRING, 
    { useUnifiedTopology: true },
    { useNewUrlParser: true },
    { useCreateIndex: true })
    .then(() => {
      console.log("Database connected....")
    })
    .catch((err) => console.log(err.message))
    