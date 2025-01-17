<template>
  <div class="blog-posts">
    <div v-for="(post, index) in posts" :key="index" class="post">
      <div class="padding"></div>
      <!-- Mobile-only title -->
      <h2 class="post-title mobile-title">{{ extractTitle(post) }}</h2>

      <!-- Table layout for image and content -->
      <table class="post-layout">
        <tbody>
          <tr>
            <!-- Image -->
            <td class="post-image">
              <figure class="figure-wrapper">
                <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
                <figcaption v-if="extractGeotag(post)" class="image-caption">
                  <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
                    {{ extractGeotag(post)?.text }}
                  </a>
                </figcaption>
              </figure>
            </td>

            <!-- Title and Markdown-rendered content -->
            <td class="post-content">
              <table class="nested-table">
                <tbody>
                  <tr>
                    <td>
                      <!-- Desktop-only title -->
                      <h2 class="post-title desktop-title">{{ extractTitle(post) }}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="markdown-container" v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="padding"></div>

      <!-- Tags with separators -->
      <h6>
        <router-link :to="{
          name: 'Post',
          params: { date: formatDate(extractDate(post)) }
        }" class="date-link" @click="setPost(post)">
          <span class="post-date">{{ formatDate(extractDate(post)) }}: </span>
        </router-link>

        <span v-for="(tag, index) in extractTags(post).split(',')" :key="index">
          <span class="tag">
            <a href="#" @click.prevent="fetchPostsByTag(tag.trim())">
              {{ tag.trim() }}
            </a>
          </span>
          <span v-if="index < extractTags(post).split(',').length - 1" class="tag-separator">|</span>
        </span>
      </h6>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <button @click="fetchPreviousPage" :disabled="isFirstPage" class="pagination-button">
        Previous Posts
      </button>
      <button @click="fetchNextPage" :disabled="posts.length < 5" class="pagination-button">
        Next Posts
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import { postStore } from '@/stores/posts';


export default {
  name: 'BlogPost',
  setup() {
    const posts = ref([])
    const isFirstPage = ref(true)
    const currentFirstPostDate = ref(null)

    const fetchPosts = async () => {
      try {
        const response = await fetch('https://blogtbe.hbvu.su/posts')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        posts.value = data
        isFirstPage.value = true
        if (data.length > 0) {
          currentFirstPostDate.value = extractDate(data[0])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }

    const extractTitle = (post) => {
      const titleMatch = post.match(/^Title:\s*(.+)$/m)
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
      return title
    }

    const removeMetadata = (post) => {
      const cleanedPost = post.replace(/^(Date:.*|Tags:.*|Title:.*)$/gm, '').trim()
      return cleanedPost
    }

    const extractTags = (post) => {
      const tagsMatch = post.match(/^Tags:\s*(.+)$/m)
      const tags = tagsMatch ? tagsMatch[1].trim() : 'No Tags'
      return tags
    }

    const extractGeotag = (post) => {
      const cleanedPost = removeMetadata(post)
      const geotagMatch = cleanedPost.match(/\[(.*?)\]\((https:\/\/maps\.app\.goo\.gl\/[^\s)]+)\)/)
      return geotagMatch
        ? {
          text: geotagMatch[1],
          url: geotagMatch[2],
        }
        : null
    }

    const removeGeotag = (content) => {
      return content
        .replace(/\[.*?\]\(https:\/\/maps\.app\.goo\.gl\/[^\s)]+\)\s*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }

    const extractDate = (post) => {
      const dateMatch = post.match(/^Date:\s*(\d{2})(\d{2})(\d{4})$/m)
      return dateMatch ? `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}` : null
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const day = dateStr.substring(0, 2)
      const month = dateStr.substring(2, 4)
      const year = dateStr.substring(4, 8)

      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]

      const monthIndex = parseInt(month, 10) - 1
      return `${day} ${months[monthIndex]} ${year}`
    }

    const renderMarkdown = (markdown) => {
      return marked(markdown)
    }

    const getImageUrl = (post) => {
      const dateMatch = post.match(/^Date:\s*(\d{2})(\d{2})(\d{4})$/m)
      if (dateMatch) {
        const day = dateMatch[1]
        const month = dateMatch[2]
        const year = dateMatch[3]
        let dateUrl = `https://objects.hbvu.su/blotpix/${year}/${month}/${day}.jpeg`
        return dateUrl
      }
      console.error('Invalid Date format in metadata:', post)
      return ''
    }

    const fetchNextPage = async () => {
      if (posts.value.length === 0) return

      const lastPost = posts.value[posts.value.length - 1]
      const lastPostDate = extractDate(lastPost)

      const day = lastPostDate.substring(0, 2)
      const month = lastPostDate.substring(2, 4)
      const year = lastPostDate.substring(4, 8)

      const date = new Date(year, month - 1, day)
      date.setDate(date.getDate() - 1)

      const prevDay = String(date.getDate()).padStart(2, '0')
      const prevMonth = String(date.getMonth() + 1).padStart(2, '0')
      const prevYear = date.getFullYear()

      const dateToFetch = `${prevDay}${prevMonth}${prevYear}`

      try {
        const response = await fetch(`https://blogtbe.hbvu.su/posts/from/${dateToFetch}`)
        if (!response.ok) {
          throw new Error('Failed to fetch next posts')
        }
        const data = await response.json()
        if (data.length > 0) {
          posts.value = data
          isFirstPage.value = false
          currentFirstPostDate.value = extractDate(data[0])
        }
      } catch (error) {
        console.error('Error fetching next posts:', error)
      }
    }

    const fetchPreviousPage = async () => {
      if (!currentFirstPostDate.value) return

      const day = currentFirstPostDate.value.substring(0, 2)
      const month = currentFirstPostDate.value.substring(2, 4)
      const year = currentFirstPostDate.value.substring(4, 8)

      const date = new Date(year, month - 1, day)
      date.setDate(date.getDate() + 1)

      const nextDay = String(date.getDate()).padStart(2, '0')
      const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
      const nextYear = date.getFullYear()

      const dateToFetch = `${nextDay}${nextMonth}${nextYear}`

      try {
        const latestResponse = await fetch('https://blogtbe.hbvu.su/posts')
        const latestData = await latestResponse.json()
        const latestFirstDate = extractDate(latestData[0])

        if (dateToFetch <= latestFirstDate) {
          const response = await fetch(`https://blogtbe.hbvu.su/posts/from/${dateToFetch}`)
          if (!response.ok) {
            throw new Error('Failed to fetch previous posts')
          }
          const data = await response.json()
          if (data.length > 0) {
            posts.value = data
            isFirstPage.value = dateToFetch === latestFirstDate
            currentFirstPostDate.value = extractDate(data[0])
          }
        }
      } catch (error) {
        console.error('Error fetching previous posts:', error)
      }
    }

    onMounted(fetchPosts)

    return {
      posts,
      extractTitle,
      removeMetadata,
      extractTags,
      renderMarkdown,
      getImageUrl,
      extractGeotag,
      removeGeotag,
      fetchNextPage,
      fetchPreviousPage,
      isFirstPage,
      formatDate,
      extractDate,
    }
  },
  methods: {
    setPost(post) {
      postStore.setCurrentPost(post);
    }
  }
}
</script>

<style scoped>
.blog-posts {
  padding: 20px;
  text-align: left;
  /* Ensure all text is left-aligned */
}

.post {
  margin-bottom: 60px;
}

.post:not(:last-child)::after {
  content: '';
  display: block;
  width: 100%;
  border-top: 2px solid #e0e0e0;
  margin-top: 40px;
  margin-bottom: 40px;
}

.post-title {
  font-size: 1.2em;
  margin: 0;
  padding: 0px 0;
  text-align: left;
  /* Left-align the title */
}

.markdown-container {
  max-width: 300px;
  /* If you want the content to wrap */
  word-wrap: break-word;
}

.nested-table {
  margin-top: 0;  /* Remove any default table margin */
}

.mobile-title {
  display: none;
}

.padding {
  height: 20px;
}

.post-layout {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  /* Ensure table content is left-aligned */
}

.post-image {
  width: 250px;
  vertical-align: top;
  text-align: left;
  /* Left-align the image */
}

.thumbnail {
  width: 100%;
  height: auto;
  max-width: 500px;
  border: #333 1px solid;
}


.post-content {
  padding-left: 20px;
  vertical-align: top;
  text-align: left;

  /* Left-align the content */
}

.post-tags {
  font-size: 0.9em;
  margin-top: 10px;
  margin-bottom: 5px;
  text-align: left;
  /* Left-align the tags */
}

.tag {
  display: inline-block;
  font-size: 0.85em;
}

.tag-separator {
  margin: 0 8px;
  color: #666;
  font-size: 0.85em;
}

.tag a {
  text-decoration: none;
  color: #333;
}

.tag a:hover {
  color: #007bff;
  text-decoration: underline;
}

.post-date {
  font-size: 0.5em;
  color: #666;
  font-style: italic;
}

.date-link {
  text-decoration: none !important;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 0 20px;
}

.pagination-button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .mobile-title {
    display: block;
    margin-bottom: 10px;
    font-size: 1.4em;
    text-align: left;
    /* Left-align the mobile title */
  }

  .desktop-title {
    display: none;
  }

  .post-image {
    width: 100%;
    /* Ensure the image takes full width */
    padding: 0;
    /* Remove padding */
    text-align: left;
    /* Left-align the mobile image */
  }

  .thumbnail {
    max-width: none;
    width: 100%;
    height: auto;
    margin: 0;
    /* Remove margin */
  }

  .post-layout {
    display: block;
    text-align: left;
    /* Ensure mobile layout is left-aligned */
  }

  .post-image,
  .post-content {
    display: block;
    width: 100%;
    padding-left: 0;
    text-align: left;
    /* Left-align mobile content */
  }

  .thumbnail {
    margin-bottom: 20px;
  }



  .post-content {
    text-align: left;
    /* Left-align mobile content */
  }

  .post-date {
    margin-top: 3px;
    font-size: 0.5em;
    margin-bottom: 10px;
    text-align: left;
    /* Left-align mobile date */
  }
}
</style>
