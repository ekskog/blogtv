<template>
  <div class="blog-search">
    <h3 class="page-title">Search Results for Tag: {{ searchTag }}</h3>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-4">Loading results...</div>

    <!-- Error state -->
    <div v-else-if="error" class="text-red-600 py-4">
      {{ error }}
    </div>

    <!-- Results table -->
    <div v-else-if="searchResults.length" class="search-results">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Post Title</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in paginatedResults" :key="post.date">
            <td>
              <a @click.prevent="openPost(post.date)" class="link-style">
                {{ formatDate(post.date) }}
              </a>
            </td>
            <td>{{ formatTitle(post.title) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No results state -->
    <div v-else class="text-center py-4 text-gray-600">
      No posts found for tag "{{ searchTag }}"
    </div>

    <!-- Pagination controls -->
    <div class="pagination mt-4">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ searchResults.length }} results
      </div>
      <div class="pagination-controls">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">
          Previous
        </button>
        <span class="pagination-page-info"> Page {{ currentPage }} of {{ totalPages }} </span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-btn">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { postStore } from '@/stores/posts' // Assuming postStore is imported

export default {
  name: 'BlogSearch',
  data() {
    return {
      searchTag: '',
      searchResults: [],
      loading: false,
      error: null,
      currentPage: 1,
      resultsPerPage: 10,
      posts: [], // List of posts for the search results
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.searchResults.length / this.resultsPerPage)
    },
    paginatedResults() {
      const start = (this.currentPage - 1) * this.resultsPerPage
      const end = start + this.resultsPerPage
      return this.searchResults.slice(start, end)
    },
    startIndex() {
      return (this.currentPage - 1) * this.resultsPerPage
    },
    endIndex() {
      return Math.min(this.startIndex + this.resultsPerPage, this.searchResults.length)
    },
  },
  created() {
    this.searchTag = this.$route.query.tag
    this.performSearch()
  },
  methods: {
    async performSearch() {
      this.loading = true
      this.error = null
      this.searchResults = []
      this.currentPage = 1 // Reset to first page on new search

      try {
        const response = await fetch(
          `https://blogtbe.hbvu.su/tags/${encodeURIComponent(this.searchTag)}`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        this.searchResults = await response.json()
      } catch (err) {
        this.error = 'Failed to fetch search results. Please try again later.'
        console.error('Search error:', err)
      } finally {
        this.loading = false
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''

      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)

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
    },
    async openPost(date) {
      const posts = ref([])

      try {
        // Fetch post content from the backend
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`)
        if (!response.ok) {
          throw new Error('Post not found')
        }
        const data = await response.json()
        posts.value = data
        const postContent = posts.value[0]

        // Store the fetched post in the state
        postStore.setCurrentPost(postContent)
        let postDate = this.formatDate(date)

        // Navigate to BlogPost component
        this.$router.push({ name: 'Post', params: { date: postDate } })
      } catch (error) {
        alert(error)
      }
    },
    formatTitle(title) {
      return title
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },

  },
  watch: {
    '$route.query.tag'(newTag) {
      this.searchTag = newTag
      this.performSearch()
    },
  },
}
</script>

<style scoped>
.page-title {
  width: 80%;
  margin: 0 auto 40px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #333;
}

.custom-table {
  width: 80%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: fixed;
}

.custom-table th,
.custom-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-table th {
  background-color: #d6d6d6;
  color: #333;
  font-weight: bold;
}

.custom-table tbody tr:hover {
  background-color: #f1f1f1;
}

.custom-table th:first-child,
.custom-table td:first-child {
  width: 50%;
}

.custom-table th:last-child,
.custom-table td:last-child {
  width: 50%;
}

.custom-table tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

.pagination {
  width: 80%;
  margin: 20px auto 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.pagination-info {
  font-size: 14px;
  color: #555;
}

.pagination-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.pagination-btn:hover {
  background-color: #e2e2e2;
}

.pagination-btn:disabled {
  background-color: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

.pagination-page-info {
  font-weight: bold;
  color: #444;
}

/* Styling for clickable date */
/* Add this CSS to ensure the date link is styled as clickable */
.link-style {
  color: #007bff;
  text-decoration: none;
}

.link-style:hover {
  text-decoration: underline;
  cursor: pointer;
}
</style>
