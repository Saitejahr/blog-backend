const express = require('express')
const {
  followUser,
  getFollowingList,
  getFollowerList,
  unfollowUser,
} = require('../controllers/follow.controllers')
const { isAuth } = require('../middlewares/AuthMiddleware')
const router = express()

router.post('/followUser/:userid', isAuth, followUser)
router.get('/followingList/:userid', isAuth, getFollowingList)
router.get('/followerList/:userid', isAuth, getFollowerList)
router.post('/unfollowUser/:userid', isAuth, unfollowUser)
module.exports = router
