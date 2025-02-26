<template>
  <div class="blog-posts">
    <h6>this is it...</h6>
    <div v-for="(post, index) in posts" :key="index" class="post">
      <div class="padding"></div>
      <!-- Mobile-only title -->
      <h2 class="post-title mobile-title">{{ extractTitle(post) }}</h2>
      <p v-if="extractGeotag(post)" class="geotag mobile-geotag">@
        <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
          {{ extractGeotag(post)?.text }}
        </a>
      </p>
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
          <p v-if="extractGeotag(post)" class="geotag desktop-geotag">@
            <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
              {{ extractGeotag(post)?.text }}
            </a>
          </p>
          <!-- Markdown content -->
          <div class="markdown-container" v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"></div>
        </div>
      </div>
      <!-- Tags with separators -->
      <div class="tags-container">
        <h6>
          <router-link :to="{
            name: 'Post',
            params: { date: extractDate(post) },
          }" class="post-date" @click="setPost(post)">
            <span>{{ extractDate(post) }}</span>
          </router-link>
          <span v-for="(tag, index) in extractTags(post).split(',')" :key="index">
            <span class="tag">
              <router-link :to="{
                name: 'search',
                query: { tag: tag.trim() }
              }">
                {{ tag.trim() }}
              </router-link>
            </span>
            <span v-if="index < extractTags(post).split(',').length - 1" class="tag-separator">|</span>
          </span>
        </h6>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <button @click="fetchPreviousPage" :disabled="isFirstPage || isLoading" class="pagination-button">
        {{ isLoading ? 'Loading...' : 'Previous Posts' }}
      </button>
      <button @click="fetchFirstPage" :disabled="isFirstPage || isLoading" class="pagination-button">
        {{ isLoading ? 'Loading...' : 'Latest Posts' }}
      </button>
      <button @click="fetchNextPage" :disabled="posts.length < 5 || isLoading" class="pagination-button">
        {{ isLoading ? 'Loading...' : 'Next Posts' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import { postStore } from '@/stores/posts'
import CryptoJS from 'crypto-js';


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
        fetchFirstPage();
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
      const MD5Caption = CryptoJS.MD5(post).toString();
      return MD5Caption;
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
          currentFirstPostDate.value = extractDate(data[0]);
          currentLastPostDate.value = extractDate(data[data.length - 1]);
          console.log('first page > Current First Post Date:', currentFirstPostDate.value);
          console.log('first page > Current Last Post Date:', currentLastPostDate.value);
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

        console.log('fetchNextPage > Current First Post Date:', currentFirstPostDate.value);
        console.log('fetchNextPage > Current Last Post Date:', currentLastPostDate.value);

        const day = parseInt(currentLastPostDate.value.slice(0, 2), 10) - 1;
        const month = parseInt(currentLastPostDate.value.slice(2, 4), 10) - 1; // JS months are 0-indexed
        const year = parseInt(currentLastPostDate.value.slice(4), 10);
        const prevDate = new Date(year, month, day);

        const prevDay = String(prevDate.getDate()).padStart(2, '0')
        const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0')
        const prevYear = prevDate.getFullYear()
        const dateToFetch = `${prevDay}${prevMonth}${prevYear}`

        console.log('fetchNextPage > Will Fetch:', dateToFetch);

        const response = await fetch(`https://blogtbe.hbvu.su/posts/from/${dateToFetch}`)
        if (!response.ok) {
          throw new Error('Failed to fetch next posts')
        }
        const data = await response.json()
        if (data.length > 0) {
          posts.value = data
          isFirstPage.value = false
          currentFirstPostDate.value = extractDate(data[0]);
          currentLastPostDate.value = extractDate(data[data.length - 1]);
        }
      } catch (error) {
        console.error('Error fetching next posts:', error)
      } finally {
        isLoading.value = false
      }
    }

    const fetchPreviousPage = async () => {
      console.log('fetch previous page...')
      if (!currentFirstPostDate.value) return;
      console.log('cfd: ', currentFirstPostDate);

      try {
        isLoading.value = true;

        console.log('fetchPreviousPage > Current First Post Date:', currentFirstPostDate.value);
        console.log('fetchPreviousPage > Current Last Post Date:', currentLastPostDate.value);

        const day = parseInt(currentFirstPostDate.value.slice(0, 2), 10);
        const month = parseInt(currentLastPostDate.value.slice(2, 4), 10) - 1; // JS months are 0-indexed
        const year = parseInt(currentLastPostDate.value.slice(4), 10);
        const date = new Date(year, month, day);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 10);
        console.log('This is the date 10 days after Date:', nextDate);

        const nextDay = String(nextDate.getDate()).padStart(2, '0');
        const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0'); // JS months are 0-indexed
        const nextYear = nextDate.getFullYear();

        const dateToFetch = `${nextDay}${nextMonth}${nextYear}`;
        console.log(`Date to fetch from: ${nextDay} - ${nextMonth} - ${nextYear}`);

        const response = await fetch(`https://blogtbe.hbvu.su/posts/from/${dateToFetch}`)

        if (!response.ok) {
          throw new Error('Failed to fetch next posts')
        }
        const data = await response.json()
        if (data.length > 0) {
          posts.value = data
          isFirstPage.value = false
          currentFirstPostDate.value = extractDate(data[0]);
          currentLastPostDate.value = extractDate(data[data.length - 1]);
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
      calculateCaption
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
  font-size: 0.6em;
  color: black;
  margin-top: 1px;
  margin-bottom: 5px;
  /* Add some margin to separate geotag from other elements */
  text-decoration: none;
}

.markdown-container {
  max-width: 400px;
  word-wrap: break-word;
  flex: 1;
  overflow-y: auto;
  /* Changed from auto to scroll to always show */
  scrollbar-width: thin;
  /* For Firefox */
  scrollbar-color: #888 #f1f1f1;
  /* For Firefox */
}

/* For Webkit browsers (Chrome, Safari, Edge) */
.markdown-container::-webkit-scrollbar {
  width: 8px;
}

.markdown-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
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

@media (max-width: 768px) {
  .post-layout {
    height: auto;
    /* Reset height for mobile */
  }

  .mobile-title {
    display: block;
    margin-bottom: 2px;
    font-size: 1.4em;
    text-align: left;
  }

  .desktop-title {
    padding-bottom: 1px;
    display: none;
  }

  .desktop-geotag {
    display: none;
  }

  .mobile-geotag {
    display: block;
  }

  .post-image {
    width: 100%;
    padding: 0;
    text-align: left;
  }

  .thumbnail {
    max-width: none;
    width: 100%;
    height: auto;
    margin: 0;
  }

  .markdown-container {
    max-width: 100%;
    word-wrap: break-word;
  }

  .post-layout {
    display: block;
    text-align: left;
  }

  .post-image,
  .post-content {
    display: block;
    width: 100%;
    padding-left: 0;
    text-align: left;
  }

  .thumbnail {
    margin-bottom: 20px;
    margin-top: 20px;
  }

  .post-content {
    text-align: left;
  }

  .post-date {
    margin-top: 3px;
    font-size: 0.5em;
    margin-bottom: 10px;
    text-align: left;
  }

  /* Add padding between image and post title on small screens */
  .post img {
    padding-bottom: 1em
  }
}
</style>
