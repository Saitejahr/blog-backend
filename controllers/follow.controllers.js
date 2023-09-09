const Joi = require('joi')
const Follow = require('../models/Follow')
const User = require('../models/User')
const { verifyUserId } = require('../utils/verifyUserId')

const followUser = async (req, res) => {
  const followerUserId = req.params.userid
  const { followingUserId } = req.body

  // Validating the body
  const isValid = Joi.object({
    followingUserId: Joi.string().required(),
  }).validate(req.body)

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: 'Invalid User Id',
      data: isValid.error,
    })
  }

  // validate the followerUserId
  try {
    const resVerifyUser = await verifyUserId(followerUserId)
    if (resVerifyUser === 'err') {
      return res.status(400).send({
        status: 400,
        message: 'DB Error: Follow User endpoint',
      })
    }

    if (resVerifyUser === false) {
      return res.status(400).send({
        status: 400,
        message: 'Follower User not found!',
      })
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'Unable to find follower User Id',
    })
  }

  // validate the followingUserId
  try {
    const resVerifyUser = await verifyUserId(followingUserId)
    if (resVerifyUser === 'err') {
      return res.status(400).send({
        status: 400,
        message: 'DB Error: Follow User endpoint',
      })
    }

    if (resVerifyUser === false) {
      return res.status(400).send({
        status: 400,
        message: 'Following User not found!',
      })
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'Unable to find following User Id',
    })
  }

  try {
    // Finding whether the follower already follows the user or not
    // basically check if this record already exists or not

    const followDetail = await Follow.findOne({
      followerUserId,
      followingUserId,
    })

    if (followDetail) {
      return res.status(400).send({
        status: 400,
        message: 'User already follows',
      })
    }
    // creating new object to add into follow collection
    const followObj = new Follow({
      followerUserId,
      followingUserId,
    })

    await followObj.save()

    res.status(201).send({
      status: 201,
      message: 'Following successfully!',
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'DB Error: Follow creation!',
    })
  }
}

const getFollowingList = async (req, res) => {
  const userId = req.params.userid
  const page = req.query.page || 1
  const LIMIT = 10
  // Verifying the userId
  try {
    const resVerifyUser = await verifyUserId(userId)
    if (resVerifyUser === 'err') {
      return res.status(400).send({
        status: 400,
        message: 'DB Error: Following list  endpoint',
      })
    }

    if (resVerifyUser === false) {
      return res.status(400).send({
        status: 400,
        message: 'User not found!',
      })
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'User not found!',
    })
  }

  try {
    const followingList = await Follow.find({ followerUserId: userId })
      .sort({ creationDateTime: -1 })
      .skip(parseInt(page) - 1)
      .limit(LIMIT)

    let followingUserId = []
    followingList.forEach((followObj) => {
      followingUserId.push(followObj.followingUserId)
    })

    const followingUserDetails = await User.find({
      _id: { $in: followingUserId },
    })

    let usersData = []
    followingUserDetails.map((user) => {
      let userData = {
        name: user.name,
        username: user.username,
        email: user.email,
        _id: user._id,
      }

      usersData.push(userData)
    })

    return res.status(200).send({
      status: 200,
      message: 'Fetched following list!',
      data: usersData,
    })
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'DB Error: Following list!',
    })
  }
}

const getFollowerList = async (req, res) => {
  const userId = req.params.userid
  const page = req.query.page || 1
  const LIMIT = 10
  // Verifying the userId
  try {
    const resVerifyUser = await verifyUserId(userId)
    if (resVerifyUser === 'err') {
      return res.status(400).send({
        status: 400,
        message: 'DB Error: Following list  endpoint',
      })
    }

    if (resVerifyUser === false) {
      return res.status(400).send({
        status: 400,
        message: 'User not found!',
      })
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'User not found!',
    })
  }

  try {
    // finding the followers list from the follow collection
    const followerList = await Follow.find({ followingUserId: userId })
      .sort({ creationDateTime: -1 })
      .skip(parseInt(page) - 1)
      .limit(LIMIT)
    // finding the ids of all the followers of the user
    let followerUserId = []
    followerList.forEach((followerObj) => {
      followerUserId.push(followerObj.followerUserId)
    })
    // we are finding the details of all the followers from the user collection
    //using the ids we got from follow collection
    const followerUserDetails = await User.find({
      _id: { $in: followerUserId },
    })

    let usersData = []
    followerUserDetails.map((user) => {
      let userData = {
        name: user.name,
        username: user.username,
        email: user.email,
        _id: user._id,
      }

      usersData.push(userData)
    })

    return res.status(200).send({
      status: 200,
      message: 'Fetched followers list!',
      data: usersData,
    })
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'DB Error: Follower list!',
    })
  }
}

const unfollowUser = async (req, res) => {
  const followerUserId = req.params.userid
  const { followingUserId } = req.body

  // Validating the body
  const isValid = Joi.object({
    followingUserId: Joi.string().required(),
  }).validate(req.body)

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: 'Invalid User Id',
      data: isValid.error,
    })
  }

  // validate the followerUserId
  try {
    const resVerifyUser = await verifyUserId(followerUserId)
    if (resVerifyUser === 'err') {
      return res.status(400).send({
        status: 400,
        message: 'DB Error: unfollow User endpoint',
      })
    }

    if (resVerifyUser === false) {
      return res.status(400).send({
        status: 400,
        message: 'Follower User not found!',
      })
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'Unable to find follower User Id',
    })
  }

  // validate the followingUserId
  try {
    const resVerifyUser = await verifyUserId(followingUserId)
    if (resVerifyUser === 'err') {
      return res.status(400).send({
        status: 400,
        message: 'DB Error: unfollow User endpoint',
      })
    }

    if (resVerifyUser === false) {
      return res.status(400).send({
        status: 400,
        message: 'Following User not found!',
      })
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: 'Unable to find following User Id',
    })
  }

  try {
    // find the record and deleting from follow collection
    await Follow.findOneAndDelete({
      followerUserId,
      followingUserId,
    })
    res.status(200).send({
      status: 200,
      message: 'Unfollowed successfully!',
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'DB Error: Unfollow!',
    })
  }
}

module.exports = {
  followUser,
  getFollowingList,
  getFollowerList,
  unfollowUser,
}
