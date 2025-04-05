<template>
  <div class="blog-posts">
    <div v-for="(post, index) in posts" :key="index" class="post">
      <div>
        <h2 class="post-title mobile-title">{{ extractTitle(post) }}</h2>
        <p v-if="extractGeotag(post)" class="geotag mobile-geotag">
          <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
            {{ extractGeotag(post)?.text }}
          </a>
        </p>
      </div>
      <div class="post-layout">
        <!-- Left panel - Image -->
        <div class="post-image">
          <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
          <span class="caption">{{ calculateCaption(post) }}</span>
        </div>

        <!-- Right panel - Content -->
        <div class="post-content">
          <!-- Desktop-only title -->
          <h2 class="post-title desktop-title">{{ extractTitle(post) }}</h2>
          <p v-if="extractGeotag(post)" class="geotag desktop-geotag">
            <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
              {{ extractGeotag(post)?.text }}
            </a>
          </p>
          <!-- Markdown content -->
          <div
            class="markdown-container"
            v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"
          ></div>
        </div>
      </div>
      <div class="tags-container">
        <h6>
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
        </h6>
      </div>
    </div>

    <div class="pagination-controls">
      <button
        @click="fetchPreviousPage"
        :disabled="isFirstPage || isLoading"
        class="pagination-button"
      >
        {{ isLoading ? 'Loading...' : 'Previous Posts' }}
      </button>
      <button
        @click="fetchFirstPage"
        :disabled="isFirstPage || isLoading"
        class="pagination-button"
      >
        {{ isLoading ? 'Loading...' : 'Latest Posts' }}
      </button>
      <button
        @click="fetchNextPage"
        :disabled="posts.length < 5 || isLoading"
        class="pagination-button"
      >
        {{ isLoading ? 'Loading...' : 'Next Posts' }}
      </button>
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
.blog-posts {
  padding: 20px;
  text-align: left;
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
  color: purple;
  margin: 0;
  padding: 0px 0;
  text-align: left;
  text-transform: uppercase;
}

.geotag {
  font-size: 0.8em;
  color: black;
  margin-bottom: 5px;
  text-decoration: none !important;
}
.geotag a:hover {
  color: pink;
  text-decoration: none !important;
}

.markdown-container {
  padding-top: 10px;
  max-width: 100%;
  font-size: 1em; /* Adjusted for better readability */
  line-height: 1.6; /* Add an explicit line height if not already set */
  max-width: 600px;
  word-wrap: break-word;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: #888 #f1f1f1; /* For Firefox */
  padding-right: 10px; /* Adds padding to content, creating space from scrollbar */
}

/* For Webkit browsers (Chrome, Safari, Edge) */
.markdown-container::-webkit-scrollbar {
  width: 10px; /* Increase width for padding illusion */
}

.markdown-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin-left: 2px; /* Creates the padding illusion */
}

.markdown-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.markdown-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.mobile-title,
.mobile-geotag {
  display: none;
}

.desktop-title,
.desktop-geotag {
  display: block;
}

.padding {
  height: 20px;
}

.post-layout {
  display: flex;
  gap: 30px;
  width: 100%;
  align-items: flex-start;
  /* Align items to the top */
}

.post-image {
  flex: 0 0 300px;
  /* Fixed width, won't grow or shrink */
  max-height: 300px;
  /* Set explicit max height */
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Maintain aspect ratio */
  max-width: 500px;
  border: #333 1px solid;
}

.caption {
  margin-top: 5px;
  text-align: center;
  display: block;
  font-size: 0.2em;
}

.post-content {
  flex: 1;
  min-width: 0;
  height: 300px;
  /* Match image height */
  display: flex;
  flex-direction: column;
}

.post-content td {
  padding-top: 0;
}

.post-tags {
  font-size: 0.9em;
  margin-top: 10px;
  margin-bottom: 5px;
  text-align: left;
}

.tags-container {
  margin-top: 55px;
}

.post-date {
  font-size: 0.5em;
  font-style: bold;
  padding-right: 20px;
  text-decoration: none !important;
  color: black;
}

.post-date:hover {
  color: purple;
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

@media (min-width: 600px) and (max-width: 1024px) {
  .post-layout {
    flex-direction: column; /* Stack elements vertically */
    align-items: flex-start; /* Align them to the left */
    gap: 20px; /* Add spacing between stacked elements */
  }

  .post-image,
  .post-content {
    width: 100%; /* Allow them to resize naturally */
  }
}

@media (max-width: 768px) {
  .post-layout {
    display: block; /* Stack elements vertically */
    width: 100%; /* Full width for mobile */
  }

  /* Title */
  .mobile-title {
    display: block; /* Show title on mobile */
    margin-bottom: 10px; /* Space after title */
    text-align: left; /* Align content to the left */
  }

  /* Geotag */
  .mobile-geotag {
    display: block; /* Show geotag on mobile */
    margin-bottom: 10px; /* Space after geotag */
    text-align: left; /* Align to the left */
  }

  .desktop-title,
  .desktop-geotag {
    display: none; /* Hide desktop-specific title and geotag */
  }

  /* Post Image (Figure) */
  .post-image {
    display: block;
    width: 100%; /* Full width */
    margin-bottom: 10px; /* Space below image */
    text-align: center; /* Center the image */
  }

  .thumbnail {
    width: 100%;
    height: auto; /* Maintain aspect ratio */
  }

  /* Caption */
  .caption {
    display: block; /* Ensure caption is on a new line */
    margin-top: 5px; /* Space above caption */
    margin-bottom: 10px; /* Space below caption */
    text-align: center;
  }

  /* Tags Container */
  .tags-container {
    display: block;
    margin-top: 10px; /* Space after markdown container */
    text-align: left; /* Align content to the left */
  }

  /* Date */
  .post-date {
    display: inline-block; /* Align date with tags */
    margin-right: 10px; /* Space between date and tags */
    text-align: left;
  }

  /* Tags and Separators */
  .tag {
    display: inline-block; /* Align tags horizontally */
    margin-right: 5px; /* Space between tags */
  }

  .tag-separator {
    display: inline; /* Keep separators inline */
    margin-right: 5px; /* Space after separator */
  }
}
</style>
