const cron = require('node-cron')
const Blog = require('../models/Blog')

const cleanUpBin = () => {
  cron.schedule(
    '0 1 * * *',
    async () => {
      console.log('cron working!')
      const deletedBlogs = await Blog.find({ isDeleted: true })

      // if there are any deleted blogs then iterate through each of them and check if they
      // were deleted 30 days ago, if yes then delete them from the collection
      if (deletedBlogs.length > 0) {
        deletedBlogs.forEach(async (blog) => {
          const diff =
            (Date.now() - blog.deletionDateTime.getTime()) /
            (1000 * 60 * 60 * 24)

          if (diff >= 30) {
            try {
              await Blog.findOneAndDelete({ _id: blog._id })
            } catch (err) {
              console.log(err)
            }
          }
        })
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
    }
  )
}

module.exports = { cleanUpBin }
