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
          params: { date: formatDate(extractDate(post)) },
        }" class="post-date" @click="setPost(post)">
          <span>{{ formatDate(extractDate(post)) }}</span>
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

export default {
  name: 'BlogPosts',
  setup() {
    const posts = ref([])
    const isFirstPage = ref(true)
    const currentFirstPostDate = ref(null)
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

    const fetchFirstPage = async () => {
      try {
        isLoading.value = true
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
      } finally {
        isLoading.value = false
      }
    }

    const fetchNextPage = async () => {
      if (posts.value.length === 0) return

      try {
        isLoading.value = true
        const lastPost = posts.value[posts.value.length - 1]
        const lastPostDate = extractDate(lastPost);
        console.log('lastPostDate:', lastPostDate);

        const day = lastPostDate.substring(0, 2)
        const month = lastPostDate.substring(2, 4)
        const year = lastPostDate.substring(4, 8)

        const date = new Date(year, month - 1, day)
        date.setDate(date.getDate() - 1)

        const prevDay = String(date.getDate()).padStart(2, '0')
        const prevMonth = String(date.getMonth() + 1).padStart(2, '0')
        const prevYear = date.getFullYear()

        const dateToFetch = `${prevDay}${prevMonth}${prevYear}`

        console.log('Fetching next posts from:', dateToFetch);

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
      } finally {
        isLoading.value = false
      }
    }

    const fetchPreviousPage = async () => {
      if (!currentFirstPostDate.value) return;

      try {
        isLoading.value = true;
        const day = currentFirstPostDate.value.substring(0, 2);
        const month = currentFirstPostDate.value.substring(2, 4);
        const year = currentFirstPostDate.value.substring(4, 8);

        const date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + 10); // Move forward by 10 days to get the previous page

        const nextDay = String(date.getDate()).padStart(2, '0');
        const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
        const nextYear = date.getFullYear();

        const dateToFetch = `${nextDay}${nextMonth}${nextYear}`;

        const latestResponse = await fetch('https://blogtbe.hbvu.su/posts');
        const latestData = await latestResponse.json();
        const latestFirstDate = extractDate(latestData[0]);

        if (dateToFetch <= latestFirstDate) {
          const response = await fetch(`https://blogtbe.hbvu.su/posts/from/${dateToFetch}`);
          if (!response.ok) {
            throw new Error('Failed to fetch previous posts');
          }
          const data = await response.json();
          if (data.length > 0) {
            posts.value = data;
            isFirstPage.value = dateToFetch === latestFirstDate;
            currentFirstPostDate.value = extractDate(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching previous posts:', error);
      } finally {
        isLoading.value = false;
      }
    };


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
      formatDate,
      extractDate,
      isLoading,
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

.markdown-container {
  max-width: 400px;
  word-wrap: break-word;
}

.nested-table {
  margin-top: 0;
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
}

.post-image {
  width: 250px;
  vertical-align: top;
  text-align: left;
}

.thumbnail {
  width: 100%;
  height: auto;
  max-width: 500px;
  border: #333 1px solid;
}

.post-content {
  padding-left: 30px;
  vertical-align: top;
  text-align: left;
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
  .mobile-title {
    display: block;
    margin-bottom: 10px;
    font-size: 1.4em;
    text-align: left;
  }

  .desktop-title {
    display: none;
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
}
</style>
