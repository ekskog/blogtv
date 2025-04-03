<template>
  <div class="blog-search">
    <!-- Title -->
    <h3 v-if="searchTag" class="page-title">Search Results for Tag: {{ searchTag }}</h3>

    <!-- Default State -->
    <div v-if="!searchTag && !loading" class="text-center py-4 text-gray-600">
      Enter a tag to start searching.
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">Loading results...</div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-600 py-4">
      {{ error }}
    </div>

    <!-- Results Table -->
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
              <a @click.prevent="loadPost(post.date)" class="link-style">
                {{ formatDate(post.date) }}
              </a>
            </td>
            <td>{{ formatTitle(post.title) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No Results State -->
    <div v-else-if="searchTag" class="text-center py-4 text-gray-600">
      No posts found for tag "{{ searchTag }}"
    </div>

    <!-- Pagination -->
    <div v-if="searchResults.length" class="pagination mt-4">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ searchResults.length }} results
      </div>
      <div class="pagination-controls">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">
          Previous
        </button>
        <span class="pagination-page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlogSearch',
  data() {
    return {
      searchTag: this.$route.query.tag || '', // Set the initial tag from the route
      searchResults: [],
      loading: false,
      error: null,
      currentPage: 1,
      resultsPerPage: 10,
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
  watch: {
    '$route.query.tag': function (newTag) {
      this.searchTag = newTag || ''
      if (this.searchTag) {
        this.performSearch()
      }
    },
  },
  created() {
    if (this.searchTag) {
      this.performSearch()
    }
  },
  methods: {
    async performSearch() {
      this.loading = true
      this.error = null
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
      const day = dateStr.substring(0, 2) // DD
      const month = dateStr.substring(2, 4) // MM
      const year = dateStr.substring(4, 8) // YYYY
      return `${day}${month}${year}` // Return in DDMMYYYY format
    },
    async loadPost(date) {
      console.log('Loading post for date:', date)
      this.$router.push({
        name: 'post', // Route name, case-sensitive
        params: { date }, // Pass the `date` parameter
      })
    },
    formatTitle(title) {
      return title
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },
  },
}
</script>

<style scoped>
.page-title {
  width: 80%;
  margin: 0 auto 40px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #333;
}

.manual-search {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
}

.search-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 250px;
}

.search-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #0056b3;
}

.custom-table {
  width: 80%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
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
  font-size: 10px;
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

.link-style {
  color: #007bff;
  text-decoration: none;
}

.link-style:hover {
  text-decoration: underline;
}

@media screen and (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 15px;
  }

  .pagination-info {
    text-align: center;
    width: 100%;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>
