const User = require('../models/User')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const { verifyUsernameAndEmailExists } = require('../utils/verifyEmailUsername')
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT)
const registerUser = async (req, res) => {
  const isValid = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
  }).validate(req.body)

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: 'Invalid Input',
      data: isValid.error,
    })
  }

  const usernameEmailVerify = await verifyUsernameAndEmailExists(
    req.body.email,
    req.body.username
  )
  console.log(usernameEmailVerify)

  if (usernameEmailVerify === 'E') {
    res.status(400).send({
      status: 400,
      message: 'Email already exists!',
    })
    return
  } else if (usernameEmailVerify === 'U') {
    res.status(400).send({
      status: 400,
      message: 'Username already exists!',
    })
    return
  } else if (usernameEmailVerify === 'Err') {
    res.status(400).send({
      status: 400,
      message: "DB Error: Couldn't register user!",
    })
    return
  }

  const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_SALT)
  const userObj = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  })

  try {
    userObj.save()
    res.status(201).send({
      status: 201,
      message: 'User created successfully!',
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'DB Error: User creation failed',
      data: err,
    })
  }
}

const loginUser = async (req, res) => {
  const { loginId, password } = req.body
  let userData

  const isValid = Joi.object({
    loginId: Joi.string().email().required(),
  }).validate(loginId)

  try {
    // Checking if the loginId is  as Email or username based on that db call is made
    if (isValid.error) {
      userData = await User.findOne({ username: loginId })
    } else {
      userData = await User.findOne({ email: loginId })
    }

    // If user is not found we send an error
    if (!userData) {
      return res.status(400).send({
        status: 400,
        message: 'No User found! Please register or check your credentials',
      })
    }
    // Updating the express session
    req.session.isAuth = true
    req.session.user = {
      username: userData.username,
      email: userData.email,
      userId: userData._id,
    }

    // Password is matched with the encrypted db password
    const isPasswordMatched = await bcrypt.compare(password, userData.password)
    if (isPasswordMatched) {
      return res.status(200).send({
        status: 200,
        message: 'Successfully logged in!',
        data: req.session.user,
      })
    } else {
      return res.status(400).send({
        status: 400,
        message: 'InCorrect Password',
      })
    }
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'DB Error: Login failed',
      data: err,
    })
  }
}

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send({
        status: 400,
        message: 'Logout unsuccessfull',
        err: err,
      })
    }
    return res.send({
      status: 200,
      message: 'Logged out successfully',
    })
  })
}

const getAllUsers = async (req, res) => {
  const userId = req.params.userid
  try {
    const allUsers = await User.find({ _id: { $ne: userId } })
    let usersData = []
    allUsers.map((user) => {
      let userData = {
        name: user.name,
        username: user.username,
        email: user.email,
        _id: user._id,
      }

      usersData.push(userData)
    })
    res.status(200).send({
      status: 200,
      message: 'Fetched all the users!',
      data: usersData,
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'DB Error: Get all Users!',
    })
  }
}

module.exports = { registerUser, loginUser, logoutUser, getAllUsers }
