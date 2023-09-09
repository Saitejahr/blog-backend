const express = require('express')
const router = express()
const { isAuth } = require('../middlewares/AuthMiddleware')
const {
  createBlog,
  getUserBlogs,
  deleteBlog,
  editBlog,
  getHomepageBlogs,
} = require('../controllers/blog.controllers')

router.post('/createBlog/:userid', isAuth, createBlog)
router.get('/getUserBlogs/:userid', isAuth, getUserBlogs)
router.delete('/deleteBlog/:blogId', deleteBlog)
router.put('/editBlog/:userid', editBlog)
router.get('/homeblogs/:userid', getHomepageBlogs)
module.exports = router
