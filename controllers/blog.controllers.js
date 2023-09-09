const Joi = require('joi')
const Blog = require('../models/Blog')
const Follow = require('../models/Follow')
const User = require('../models/User')

const createBlog = async (req, res) => {
  // const body = {
  //   title: req.body.title,
  //   textBody: req.body.textBody,
  // }
  const isValid = Joi.object({
    title: Joi.string().required(),
    textBody: Joi.string().max(1000).required(),
  }).validate(req.body)

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: 'Invalid Data Format',
      data: isValid.error,
    })
  }
  let userData
  try {
    userData = await User.findById(req.params.userid)
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'Unable to fetch user',
      data: err,
    })
  }

  const blogObj = new Blog({
    title: req.body.title,
    textBody: req.body.textBody,
    userId: userData._id,
    username: userData.username,
  })

  try {
    await blogObj.save()
    res.status(201).send({
      status: 201,
      message: 'Blog successfully created!',
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'Blog creation failed!',
    })
  }
}

const getUserBlogs = async (req, res) => {
  const userId = req.params.userid
  const page = req.query.page || 1
  const LIMIT = 10
  try {
    const myBlogsData = await Blog.find({ userId, isDeleted: false })
    // .sort({ creationDateTime: -1 })
    // .skip(parseInt(page) - 1)
    // .limit(LIMIT)

    res.status(200).send({
      status: 200,
      message: 'User blogs fetched successfully!',
      data: myBlogsData,
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'Failed to get the blogs!',
      data: err,
    })
  }
}

const deleteBlog = async (req, res) => {
  const blogId = req.params.blogId
  try {
    await Blog.findOneAndUpdate(
      {
        _id: blogId,
      },
      { isDeleted: true, deletionDateTime: Date.now() }
    )
    res.status(200).send({
      status: 200,
      message: 'Blogs has been successfully deleted!',
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'Unable to delete the blog!',
    })
  }
}

const editBlog = async (req, res) => {
  const { blogId, title, textBody } = req.body
  const userId = req.params.userid

  try {
    const blogData = await Blog.findById(blogId)

    // Compare the owner and the user making the request to edit
    if (!(blogData.userId.toString() === userId.toString())) {
      return res.status(401).send({
        status: 401,
        message: 'Not allowed to edit, Authorization failed!',
      })
    }

    // Compare the time, if it's in the 30 min bracket
    const creationDateTime = blogData.creationDateTime.getTime()
    const currentDateTime = Date.now()

    const diff = (currentDateTime - creationDateTime) / (1000 * 60)
    if (diff > 30) {
      return res.status(400).send({
        status: 400,
        message: 'Not allowed to edit after 30 minutes of creation!',
      })
    }
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'Unable to edit the blog!',
    })
  }
  try {
    const newBlogData = {
      title,
      textBody,
    }

    await Blog.findOneAndUpdate({ _id: blogId }, newBlogData)

    res.status(200).send({
      status: 200,
      message: 'Blog edited successfully!',
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'Unable to edit the blog!',
    })
  }
}

const getHomepageBlogs = async (req, res) => {
  const userId = req.params.userid
  try {
    const followingList = await Follow.find({ followerUserId: userId })

    let followingUserId = []
    followingList.forEach((followObj) => {
      followingUserId.push(followObj.followingUserId)
    })

    const followingBlogs = await Blog.find({
      userId: { $in: followingUserId },
      isDeleted: false,
    })

    res.status(200).send({
      status: 200,
      message: 'Fetched all homepage blogs!',
      data: followingBlogs,
    })
  } catch (err) {
    res.status(400).send({
      status: 400,
      message: 'Unable to find the blogs!',
    })
  }
}

module.exports = {
  createBlog,
  getUserBlogs,
  deleteBlog,
  editBlog,
  getHomepageBlogs,
}
