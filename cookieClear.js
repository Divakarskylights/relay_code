// const cookieParser = require('cookie-parser');

// app.use(cookieParser());



  function signOut(req, res) {
    // Clear the session cookie
    res.clearCookie('session');
  
    // Send a response indicating success
    res.send('Signed out successfully');
  }
  
  module.exports = {
    signOut,
  };

  

