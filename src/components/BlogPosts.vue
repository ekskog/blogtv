<template>
  <div class="posts-container">
    <div v-for="(post, index) in posts" :key="index" class="blogpost">
      <!-- Desktop layout -->
      <div class="desktop-view">
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
      </div>

      <!-- Mobile layout with title/geotag and flipcard -->
      <div class="mobile-view">
        <!-- Title and geotag outside flipcard -->
        <div class="mobile-header">
          <h2 class="mobile-title">{{ extractTitle(post) }}</h2>
          <p v-if="extractGeotag(post)" class="mobile-geotag">
            <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
              @ {{ extractGeotag(post)?.text }}
            </a>
          </p>
        </div>

        <!-- Flipcard below title -->
        <div class="flipcard-container">
          <div
            class="flipcard"
            :class="{ 'is-flipped': flippedCards[index] }"
          >
            <!-- Front side - Image -->
            <div class="card-face card-front" @click="toggleFlip(index)">
              <img :src="getImageUrl(post)" alt="Post Image" class="mobile-thumbnail" />
              <div class="mobile-caption">{{ calculateCaption(post) }}</div>
            </div>

            <!-- Back side - Content (no title/geotag) -->
            <div class="card-face card-back" @click="toggleFlip(index)">
              <div
                class="mobile-content"
                v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"
              ></div>
              <div class="flip-hint-subtle">Tap to return</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tags-container">
        <div class="tags-wrapper">
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
          <div class="tags-section">
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
import { ref, onMounted, reactive } from 'vue'
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
    const flippedCards = reactive({}) // Track flipped state for each card

    const toggleFlip = (index) => {
      flippedCards[index] = !flippedCards[index]
      console.log(`Toggled card ${index} to ${flippedCards[index] ? 'flipped' : 'unflipped'}`)
    }

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
      flippedCards,
      toggleFlip
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
/* Container layout */
.posts-container {
  margin: 0 auto;
  padding: 20px;
}

/* Blog post card */
.blogpost {
  margin-bottom: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

/* Mobile view is hidden on desktop */
.mobile-view {
  display: none;
}

/* Desktop view - default display */
.desktop-view {
  display: block;
}

/* Two-column layout for desktop */
.post-layout {
  display: flex;
  flex-direction: row;
}

/* Left panel - Image and caption */
.photo-container {
  flex: 0 0 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.thumbnail {
  width: 100%;
  max-width: 500px;
  max-height: 500px;
  object-fit: contain;
  border: 1px solid #000;
}

.caption {
  margin-top: 10px;
  font-size: 0.8rem;
  text-align: center;
  color: #666;
  max-width: 500px;
}

/* Right panel - Content */
.post-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow: hidden;
}

/* Flipcard specific styling */
.flipcard-container {
  width: 100%;
  height: 350px; /* Fixed height */
  perspective: 1000px;
  margin-bottom: 5px;
}

.flipcard {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flipcard.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  overflow: hidden;
  transform-style: preserve-3d; /* Ensure 3D rendering */
  -webkit-transform-style: preserve-3d;
}

.card-front {
  background-color: white;
  transform: rotateY(0deg);
  z-index: 2; /* Higher z-index to ensure it's on top when not flipped */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.card-back {
  background-color: white;
  transform: rotateY(180deg);
  z-index: 1;
  padding: 15px;
  padding-bottom: 45px; /* More space at bottom for the tap hint */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 350px; /* Minimum height matches front face */
  height: 350px; /* Fixed height to match front side */
  position: relative; /* For absolute positioning of child elements */
}

.mobile-thumbnail {
  width: 80%;
  max-width: 300px;
  height: auto;
  aspect-ratio: 1/1;
  object-fit: contain;
  margin: 10px auto 5px; /* Reduced from 15px, smaller bottom margin */
  border: 1px solid #000;
}

.mobile-caption {
  margin-top: 5px; /* Reduced from 10px */
  padding: 0 15px 5px;
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  width: calc(100% - 30px); /* Match the image width */
}

.mobile-header {
  padding: 8px 15px 3px; /* Reduced vertical padding */
  border-bottom: 1px solid #eee;
  margin-bottom: 8px; /* Reduced from 10px */
}

.mobile-title {
  font-size: 1.5rem;
  margin-bottom: 5px; /* Reduced from 10px */
  color: #222;
  text-transform: uppercase;
}

.mobile-geotag {
  font-size: 0.7rem;
  margin-bottom: 8px; /* Reduced from 15px */
}

.mobile-geotag a {
  color: black;
  text-decoration: none;
}

.mobile-content {
  flex: 1;
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden;
  font-size: 0.9rem;
  line-height: 1.4;
  padding-right: 10px; /* More space for scrollbar */
  width: 100%;
  word-wrap: break-word;
  height: 270px; /* Fixed height to fit within card - leaving space for hint */
  position: relative;
}

.flip-hint {
  text-align: center;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  background-color: rgba(255, 255, 255, 0.9);
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.flip-hint-subtle {
  text-align: center;
  padding: 5px;
  font-size: 0.8rem;
  color: #666;
  background-color: rgba(255, 255, 255, 0.9);
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
  border-top: 1px solid #f0f0f0;
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
  overflow-y: auto;
  padding-right: 10px;
  font-size: 1.2rem;
  line-height: 1.4;
}

/* Scrollbar styling */
.markdown-container::-webkit-scrollbar,
.mobile-content::-webkit-scrollbar {
  width: 8px;
}

.markdown-container::-webkit-scrollbar-track,
.mobile-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.markdown-container::-webkit-scrollbar-thumb,
.mobile-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.markdown-container::-webkit-scrollbar-thumb:hover,
.mobile-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* Markdown content elements */
.markdown-container h1,
.markdown-container h2,
.markdown-container h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-container p {
  margin-bottom: 1em;
  font-size: 1rem;
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

/* Tags and metadata */
.tags-container {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.tags-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  align-items: flex-start;
}

.post-date {
  font-size: 0.8rem;
  font-weight: bold;
  text-decoration: none;
  display: block;
}

.post-date:hover {
  color: lightblue;
}

.tag {
  font-size: 0.7rem; /* Smaller, same as geotag */
  font-weight: bold;
  text-decoration: none;
  text-transform: uppercase;
  margin: 2px 5px 2px 0;
  display: inline-block;
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

.left-button,
.middle-button,
.right-button {
  flex: 1;
  display: flex;
}

.left-button {
  justify-content: flex-start;
}

.middle-button {
  justify-content: center;
}

.right-button {
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
    position: relative;
  }

  /* Hide desktop view, show mobile view */
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  /* Adjust flipcard styling for mobile */
  .flipcard-container {
    margin: 0 0 20px 0;
  }

  /* Mobile content adjustments */
  .mobile-content {
    height: 270px; /* Fixed height */
    padding-bottom: 10px;
    padding-right: 15px;
    width: calc(100% - 15px); /* Account for padding */
    box-sizing: border-box;
  }

  /* Tags container adjustments for mobile */
  .tags-container {
    padding: 15px;
    clear: both; /* Ensure tags are below the flipcard */
  }

  .tags-wrapper {
    width: 100%;
  }

  .tags-section {
    margin-top: 4px;
    width: 100%;
  }

  .post-date {
    margin-bottom: 0;
  }

  .tag {
    margin: 2px 4px 2px 0;
  }

  /* Pagination controls for mobile */
  .pagination-controls {
    flex-direction: row;
    gap: 5px;
    align-items: center;
    justify-content: space-between;
  }

  .pagination-button {
    width: auto;
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}

/* For larger mobile screens (480px-788px) */
@media (min-width: 480px) and (max-width: 788px) {
  .flipcard-container {
    height: 400px;
  }

  .mobile-thumbnail {
    width: 70%;
    max-width: 350px;
  }

  .pagination-controls {
    flex-direction: row;
    justify-content: space-between;
  }

  .pagination-button {
    width: auto;
    font-size: 0.9rem;
  }
}
</style>
