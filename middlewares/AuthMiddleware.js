const Session = require('../models/Session')

const isAuth = (req, res, next) => {
  // try{
  //    const userData = Session.find(session.user.userId: )
  // }catch(err){
  //    res.send()
  // }
  // if (req.session.isAuth) {
  //   next()
  // } else {
  //   return res.status(401).send({
  //     status: 401,
  //     message: 'Invalid session, please login',
  //   })
  // }

  next()
}

module.exports = { isAuth }
