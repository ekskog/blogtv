<template>
  <div class="posts-container">
    <div v-for="(post, index) in posts" :key="index" class="blogpost">
      <div class="post-layout">
        <!-- Left panel - Image -->
        <div class="photo-container">
          <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
          <span class="caption">{{ calculateCaption(post) }}</span>
        </div>

        <!-- Right panel - Content -->
        <div class="post-content">
          <div class="post-header">
            <h2 class="post-title">{{ extractTitle(post) }}</h2>
            <p v-if="extractGeotag(post)" class="geotag">
              <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
                @ {{ extractGeotag(post)?.text }}
              </a>
            </p>
          </div>

          <!-- Markdown content -->
          <div
            class="markdown-container"
            v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"
          ></div>
        </div>
      </div>

      <div class="tags-container">
        <router-link
          :to="{
            name: 'post',
            params: { date: extractDate(post) },
          }"
          class="post-date"
          @click="setPost(post)"
        >
          <span>{{ extractDate(post) }}</span>
        </router-link>
        <span v-for="(tag, index) in extractTags(post).split(',')" :key="index">
          <span class="tag">
            <router-link
              :to="{
                name: 'search',
                query: { tag: tag.trim() },
              }"
            >
              {{ tag.trim() }}
            </router-link>
          </span>
          <span v-if="index < extractTags(post).split(',').length - 1" class="tag-separator"
            >|</span
          >
        </span>
      </div>
    </div>

    <div class="pagination-controls">
      <div class="left-button">
        <button
          @click="fetchPreviousPage"
          :disabled="isFirstPage || isLoading"
          class="pagination-button"
        >
          {{ isLoading ? 'Loading...' : '<' }}
        </button>
      </div>
      <div class="middle-button">
        <button
          @click="fetchFirstPage"
          :disabled="isFirstPage || isLoading"
          class="pagination-button"
        >
          {{ isLoading ? 'Loading...' : 'Page 1' }}
        </button>
      </div>
      <div class="right-button">
        <button
          @click="fetchNextPage"
          :disabled="posts.length < 5 || isLoading"
          class="pagination-button"
        >
          {{ isLoading ? 'Loading...' : '>' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import { postStore } from '@/stores/posts'
import CryptoJS from 'crypto-js'

export default {
  name: 'BlogPosts',
  setup() {
    const posts = ref([])
    const isFirstPage = ref(true)
    const currentFirstPostDate = ref(null)
    const currentLastPostDate = ref(null)
    const isLoading = ref(false)

    const fetchPosts = async () => {
      try {
        fetchFirstPage()
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        isLoading.value = false
      }
    }

    const extractTitle = (post) => {
      const titleMatch = post.match(/^Title:\s*(.+)$/m)
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
      return title
    }

    const calculateCaption = (post) => {
      const MD5Caption = CryptoJS.MD5(post).toString()
      return MD5Caption
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

    const fetchFirstPage = async () => {
      try {
        isLoading.value = true
        console.log('fetch latest posts...')
        const response = await fetch('https://blogtbe.hbvu.su/posts')
        if (!response.ok) {
          throw new Error('Failed to fetch first page posts')
        }
        const data = await response.json()
        posts.value = data
        isFirstPage.value = true
        if (data.length > 0) {
          currentFirstPostDate.value = extractDate(data[0])
          currentLastPostDate.value = extractDate(data[data.length - 1])
          console.log('first page > Current First Post Date:', currentFirstPostDate.value)
          console.log('first page > Current Last Post Date:', currentLastPostDate.value)
        }
      } catch (error) {
        console.error('Error fetching first page posts:', error)
      } finally {
        isLoading.value = false
      }
    }

    const fetchNextPage = async () => {
      if (posts.value.length === 0) return
      console.log('fetch next page...')

      try {
        isLoading.value = true

        console.log('fetchNextPage > Current First Post Date:', currentFirstPostDate.value)
        console.log('fetchNextPage > Current Last Post Date:', currentLastPostDate.value)

        const day = parseInt(currentLastPostDate.value.slice(0, 2), 10) - 1
        const month = parseInt(currentLastPostDate.value.slice(2, 4), 10) - 1 // JS months are 0-indexed
        const year = parseInt(currentLastPostDate.value.slice(4), 10)
        const prevDate = new Date(year, month, day)

        const prevDay = String(prevDate.getDate()).padStart(2, '0')
        const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0')
        const prevYear = prevDate.getFullYear()
        const dateToFetch = `${prevDay}${prevMonth}${prevYear}`

        console.log('fetchNextPage > Will Fetch:', dateToFetch)

        const response = await fetch(`https://blogtbe.hbvu.su/posts/from/${dateToFetch}`)
        if (!response.ok) {
          throw new Error('Failed to fetch next posts')
        }
        const data = await response.json()
        if (data.length > 0) {
          posts.value = data
          isFirstPage.value = false
          currentFirstPostDate.value = extractDate(data[0])
          currentLastPostDate.value = extractDate(data[data.length - 1])
        }
      } catch (error) {
        console.error('Error fetching next posts:', error)
      } finally {
        isLoading.value = false
      }
    }

    const fetchPreviousPage = async () => {
      console.log('fetch previous page...')
      if (!currentFirstPostDate.value) return
      console.log('cfd: ', currentFirstPostDate)

      try {
        isLoading.value = true

        console.log('fetchPreviousPage > Current First Post Date:', currentFirstPostDate.value)
        console.log('fetchPreviousPage > Current Last Post Date:', currentLastPostDate.value)

        const day = parseInt(currentFirstPostDate.value.slice(0, 2), 10)
        const month = parseInt(currentLastPostDate.value.slice(2, 4), 10) - 1 // JS months are 0-indexed
        const year = parseInt(currentLastPostDate.value.slice(4), 10)
        const date = new Date(year, month, day)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 10)
        console.log('This is the date 10 days after Date:', nextDate)

        const nextDay = String(nextDate.getDate()).padStart(2, '0')
        const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0') // JS months are 0-indexed
        const nextYear = nextDate.getFullYear()

        const dateToFetch = `${nextDay}${nextMonth}${nextYear}`
        console.log(`Date to fetch from: ${nextDay} - ${nextMonth} - ${nextYear}`)

        const response = await fetch(`https://blogtbe.hbvu.su/posts/from/${dateToFetch}`)

        if (!response.ok) {
          throw new Error('Failed to fetch next posts')
        }
        const data = await response.json()
        if (data.length > 0) {
          posts.value = data
          isFirstPage.value = false
          currentFirstPostDate.value = extractDate(data[0])
          currentLastPostDate.value = extractDate(data[data.length - 1])
        }
      } catch (error) {
        console.error('Error fetching next posts:', error)
      } finally {
        isLoading.value = false
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
      fetchFirstPage,
      fetchNextPage,
      fetchPreviousPage,
      isFirstPage,
      extractDate,
      isLoading,
      calculateCaption,
    }
  },
  methods: {
    setPost(post) {
      postStore.setCurrentPost(post)
    },
  },
}
</script>

<style scoped>
/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
}

.posts-container {
  margin: 0 auto;
  padding: 20px;
}

/* Individual blog post styling */
.blogpost {
  margin-bottom: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

/* Two-column layout for desktop */
.post-layout {
  display: flex;
  flex-direction: row;
}

/* Left panel - Image and caption */
.photo-container {
  flex: 0 0 500px; /* Updated fixed width of 500px */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.thumbnail {
  width: 100%;
  max-width: 500px; /* Updated max width to 500px */
  max-height: 500px; /* Updated max height to 500px */
  object-fit: contain;
  border: 1px solid #000;
}

.caption {
  margin-top: 10px;
  font-size: 0.4em;
  text-align: center;
  color: #666;
  max-width: 500px; /* Updated to match image width */
}

/* Right panel - Content */
.post-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 500px; /* Updated to match the height of the image container */
  overflow: hidden;
}

.post-header {
  margin-bottom: 5px;
}

.post-title {
  font-size: 2.2rem;
  margin-bottom: 8px;
  color: #222;
  text-transform: uppercase;
}

.geotag {
  font-size: 0.7rem;
  color: black;
  margin-bottom: 0;
}

.geotag a {
  color: black;
  text-decoration: none;
}

.geotag a:hover {
  color: blueviolet;
}

/* Markdown content */
.markdown-container {
  flex: 1;
  overflow-y: auto; /* Add scrollbar if content overflows */
  padding-right: 10px; /* Space for scrollbar */
  font-size: 1.2rem;
  line-height: 1.4;
}

/* Scrollbar styling */
.markdown-container::-webkit-scrollbar {
  width: 8px;
}

.markdown-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.markdown-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.markdown-container::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* Markdown content styling */
.markdown-container h1,
.markdown-container h2,
.markdown-container h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-container p {
  margin-bottom: 1em;
  font-size: 0.1em;
}

.markdown-container ul,
.markdown-container ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.markdown-container a {
  color: #0066cc;
  text-decoration: none;
}

.markdown-container a:hover {
  text-decoration: underline;
}

.markdown-container code {
  background-color: #f6f6f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-container pre {
  background-color: #f6f6f6;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-container blockquote {
  border-left: 4px solid #ddd;
  padding-left: 15px;
  color: #666;
  font-style: italic;
  margin: 1em 0;
}

/* Tags and date row */
.tags-container {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.post-date,
.tag {
  font-size: 0.8rem; /* Explicitly enforce font size */
  font-weight: bold; /* Ensure bold font for both */
  text-decoration: none; /* Ensure consistent link styling */
}

.post-date {
  padding-right: 25px;
}
.post-date:hover {
  color: lightblue;
}

.tag {
  text-transform: uppercase;
  margin: 0 5px;
}

.tag a {
  color: black;
  text-decoration: none;
}

.tag a:hover {
  color: lightblue;
}

.tag-separator {
  color: #ccc;
  margin: 0 2px;
}

/* Pagination controls */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 50px;
}

.left-button {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.middle-button {
  flex: 1;
  display: flex;
  justify-content: center;
}

.right-button {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.pagination-button {
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.pagination-button:hover {
  background-color: #0055aa;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Mobile layout (screens smaller than 789px) */
@media (max-width: 788px) {
  .posts-container {
    padding: 15px;
  }

  .blogpost {
    margin-bottom: 30px;
  }

  /* Switch to vertical stacking */
  .post-layout {
    flex-direction: column;
    border-bottom: none;
  }

  /* Adjust image container for mobile */
  .photo-container {
    flex: none;
    width: 100%;
    padding: 15px;
  }

  .thumbnail {
    width: 100%;
    max-width: 100%;
    height: auto;
    aspect-ratio: 1/1; /* Maintain 1:1 aspect ratio */
    object-fit: contain;
  }

  .caption {
    max-width: 100%;
    padding: 0 15px;
    margin-bottom: 15px;
  }

  /* Adjust content area for mobile */
  .post-content {
    height: auto;
    padding: 0 15px 15px;
  }

  .post-header {
    margin-bottom: 5px;
  }

  .post-title {
    font-size: 1.2rem;
  }

  /* Make markdown container non-scrollable on mobile */
  .markdown-container {
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
    width: 100%;
    font-size: 0.8rem; /* Adjusted for better readability */
  }

  /* Tags container adjustments for mobile */
  .tags-container {
    padding: 15px;
  }

  .tags-container h6 {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-date {
    margin-right: 0;
    margin-bottom: 10px;
  }

  /* Pagination controls for mobile */
  .pagination-controls {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .pagination-button {
    width: 80%;
    padding: 10px;
  }
}

/* For larger mobile screens (480px-788px) - better layout */
@media (min-width: 480px) and (max-width: 788px) {
  .thumbnail {
    max-width: 80%;
  }

  .markdown-container {
    font-size: 0.8rem; /* Adjusted for better readability */
  }

  .pagination-controls {
    flex-direction: row;
  }

  .pagination-button {
    width: auto;
  }
}
</style>
