<template>
  <div class="single-post">
    <div v-if="post">
      <h2 class="post-title">{{ extractTitle(post) }}</h2>
      <div v-if="extractGeotag(post)">
        <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer" class="geotag">
          @ {{ extractGeotag(post)?.text }}
        </a>
      </div>

      <!-- Image with Loading State -->
      <div class="post-image">
        <figure class="figure-wrapper">
          <div v-if="imageLoading" class="image-loading">Fetching Image...</div>
          <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" @load="onImageLoaded" @error="onImageError"
            v-show="!imageLoading" @click="openImageModal" />
          <span class="caption" v-show="!imageLoading">{{ calculateCaption(post) }}</span>
        </figure>
      </div>

      <!-- Image Modal -->
      <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
        <div class="modal-content" @click.stop>
          <div class="close-button-container">
            <button class="close-modal-button" @click="closeImageModal">Close</button>
          </div>
          <img :src="getImageUrl(post)" alt="Full Resolution Image" class="full-resolution-image" />
        </div>
      </div>

      <!-- EXIF and Azure Eye Toggle Buttons Below the Caption -->
      <div class="toggle-buttons">
        <button @click="toggleExifData" class="exif-toggle-button">
          {{ showExifData ? 'Hide EXIF Data' : 'Show EXIF Data' }}
        </button>
        <button @click="toggleAzEyeData" class="azeye-toggle-button">
          {{ showAzEyeData ? 'Hide AzEye Data' : 'Show AzEye Data' }}
        </button>
      </div>

      <!-- EXIF Viewer -->
      <div v-if="showExifData" class="exif-container">
        <ExifViewer :initialImageUrl="getImageUrl(post)" />
      </div>

      <!-- Azure Eye Viewer -->
      <div v-if="showAzEyeData" class="azeye-container">
        <AzureViewer :initialImageUrl="getImageUrl(post)" />
      </div>

      <!-- The Blog Post Text Markdown, Rendered -->
      <div class="markdown-container" v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"></div>

      <!-- Clickable Tags with separators -->
      <div class="tags-container">
        <span class="post-date">{{ date }}</span>
        <!-- Changed from <p> to <span> -->
        <span v-for="(tag, index) in extractTags(post).split(',')" :key="index">
          <span class="tag">
            <router-link :to="{
              name: 'search',
              query: { tag: tag.trim() },
            }">
              {{ tag.trim() }}
            </router-link>
          </span>
          <span v-if="index < extractTags(post).split(',').length - 1" class="tag-separator">|</span>
        </span>
      </div>

      <!-- Navigation Buttons -->
      <div class="pagination-controls">
        <button @click="navigateToPreviousDay" class="pagination-button" :disabled="navigationLoading">
          <span v-if="navigationLoading && previousLoading">Searching...</span>
          <span v-else>{{ '< 1' }}</span>
        </button>
        <button @click="navigateToPreviousYear" class="pagination-button" :disabled="navigationLoading">
          {{ '< 365' }}
        </button>
        <button @click="navigateToNextYear" class="pagination-button" :disabled="navigationLoading">
          {{ '> 365' }}
        </button>
        <button @click="navigateToNextDay" class="pagination-button" :disabled="navigationLoading">
          <span v-if="navigationLoading && nextLoading">Searching...</span>
          <span v-else>{{ '> 1' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
//import { ref } from 'vue'
import { postStore } from '@/stores/posts'
import { marked } from 'marked'
import CryptoJS from 'crypto-js'
import ExifViewer from './ExifViewer.vue' // Import ExifViewer component
import AzureViewer from './AzureViewer.vue' // Import AzureViewer component

export default {
  name: 'BlogPost',
  components: {
    ExifViewer,
    AzureViewer,
  },
  data() {
    return {
      date: this.$route.params.date,
      post: postStore.currentPost,
      showExifData: false,
      showAzEyeData: false,
      showImageModal: false, // New data property for image modal
      loading: false,
      imageLoading: true, // Added for image loading state
      navigationLoading: false, // General navigation loading state
      nextLoading: false, // Specific to next button
      previousLoading: false, // Specific to previous button
    }
  },

  mounted() {
    if (!this.post) {
      console.warn('Post is not yet set, skipping image fetch.');
      return;
    }

    const img = new Image();
    img.onload = () => {
      this.imageLoading = false;
    };
    img.src = this.getImageUrl(this.post);
  },

  watch: {
    '$route.params.date': {
      immediate: true,
      async handler(newDate) {
        console.log('Detected route change, new date:', newDate)
        if (newDate) {
          this.date = newDate
          this.imageLoading = true // Reset image loading state when route changes
          this.loadPost(newDate) // Fetch the new post
          if (this.post) {
            console.log('Post fetched, now updating image...');
            this.imageLoading = false;
          }
        } else {
          console.error('No date provided in route params!')
          this.post = null // Clear the post if date is invalid
        }
      },
    },

    'post': {
      handler() {
        // Reset image loading state when post data changes
        if (this.post) {
          this.imageLoading = true
        }
      },
    }
  },

  methods: {
    // Image modal methods
    openImageModal() {
      this.showImageModal = true;
      // Add a class to body to prevent scrolling when modal is open
      document.body.classList.add('modal-open');
    },

    closeImageModal() {
      this.showImageModal = false;
      // Remove the class from body when modal is closed
      document.body.classList.remove('modal-open');
    },

    toggleExifData() {
      this.showExifData = !this.showExifData
    },
    toggleAzEyeData() {
      this.showAzEyeData = !this.showAzEyeData
    },

    onImageLoaded() {
      // Image has finished loading
      console.log('Image loaded successfully')
      this.imageLoading = false
    },

    onImageError() {
      // Handle image loading error
      console.error('Error loading image')
      this.imageLoading = false
    },

    async loadPost(date) {
      try {
        this.loading = true
        this.imageLoading = true // Reset image loading state
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`)
        if (!response.ok) {
          throw new Error ('error fetching post')
        } else {
          const data = await response.json()
          console.log(`DEBUG >> ${data}`)
          const postContent = data[0]
          postStore.setCurrentPost(postContent)
          this.post = postContent
          this.loading = false
        }
      } catch (error) {
        alert(error.message + ` >> no post for ${date}`)
        this.loading = false
      }
    },

    getImageUrl(post) {
      if (!post) {
        console.error('getImageUrl called with null post!');
        return '';
      }

      const dateMatch = post.match(/Date:\s*(\d{2})(\d{2})(\d{4})/)
      if (dateMatch) {
        const [_, day, month, year] = dateMatch;
        return `https://objects.hbvu.su/blotpix/${year}/${month}/${day}.jpeg`;
      }
      console.error('Invalid Date format in metadata:', post)
      return ''
    },

    calculateCaption(post) {
      const MD5Caption = CryptoJS.MD5(post).toString()
      return MD5Caption
    },
    extractTags(post) {
      const tagsMatch = post.match(/^Tags:\s*(.+)$/m)
      const tags = tagsMatch ? tagsMatch[1].trim() : 'No Tags'
      return tags
    },
    removeGeotag(content) {
      return content
        .replace(/\[.*?\]\(https:\/\/maps\.app\.goo\.gl\/[^\s)]+\)\s*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    },
    extractGeotag(post) {
      const cleanedPost = this.removeMetadata(post)
      const geotagMatch = cleanedPost.match(/\[(.*?)\]\((https:\/\/maps\.app\.goo\.gl\/[^\s)]+)\)/)
      return geotagMatch
        ? {
          text: geotagMatch[1],
          url: geotagMatch[2],
        }
        : null
    },
    extractTitle(post) {
      const titleMatch = post.match(/Title:\s*([^\n]+)/)
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
      return title
    },
    removeMetadata(post) {
      const cleanedPost = post.replace(/^(Date:.*|Tags:.*|Title:.*)$/gm, '').trim()
      return cleanedPost
    },
    renderMarkdown(markdown) {
      return marked(markdown)
    },
    parseDateString() {
      const day = parseInt(this.date.slice(0, 2))
      const month = parseInt(this.date.slice(2, 4)) - 1
      const year = parseInt(this.date.slice(4, 8))
      let parsedDate = new Date(year, month, day)
      return parsedDate // Return Date object
    },

    async navigateToNextDay() {
      const inputDate = this.parseDateString()

      // Show loading indicator in UI
      this.navigationLoading = true
      this.nextLoading = true

      // Find the next available post
      const nextPostDate = await this.findNextAvailablePost(inputDate)

      if (nextPostDate) {
        console.log('Found next available post for date:', nextPostDate)
        this.$router.push({ name: 'post', params: { date: nextPostDate } })
      } else {
        console.log('No next post found')
        alert('No more posts found in the next 60 days')
        this.navigationLoading = false
        this.nextLoading = false
      }
    },

    async navigateToPreviousDay() {
      const inputDate = this.parseDateString()

      // Show loading indicator in UI
      this.navigationLoading = true
      this.previousLoading = true

      // Find the previous available post
      const previousPostDate = await this.findPreviousAvailablePost(inputDate)

      if (previousPostDate) {
        console.log('Found previous available post for date:', previousPostDate)
        this.$router.push({ name: 'post', params: { date: previousPostDate } })
      } else {
        console.log('No previous post found')
        alert('No more posts found in the previous 60 days')
        this.navigationLoading = false
        this.previousLoading = false
      }
    },

    navigateToNextYear() {
      console.log('NAVIGATE TO NEXT YEAR')
      const inputDate = this.parseDateString()
      // Calculate the date for the next year
      const nextYear = new Date(inputDate);
      nextYear.setFullYear(inputDate.getFullYear() + 1);
      const nextYearFormatted = this.formatDateStr(nextYear) // Format the date
      console.log('Navigating to same day, next year:', nextYearFormatted)
      this.$router.push({ name: 'post', params: { date: nextYearFormatted } }) // Route to next day
    },

    navigateToPreviousYear() {
      console.log('NAVIGATE TO PREVIOUS YEAR')
      const inputDate = this.parseDateString()
      // Calculate the date for the previous year
      const previousYear = new Date(inputDate);
      previousYear.setFullYear(inputDate.getFullYear() - 1);
      const previousYearFormatted = this.formatDateStr(previousYear) // Format the date
      console.log('Navigating to same day, previous year:', previousYearFormatted)
      this.$router.push({ name: 'post', params: { date: previousYearFormatted } }) // Route to next day
    },
    formatDateStr(date) {
      // Formats the date as DDMMYYYY
      return `${('0' + date.getDate()).slice(-2)}${('0' + (date.getMonth() + 1)).slice(-2)}${date.getFullYear()}`
    },

    async checkPostExists(date) {
      try {
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`)
        return response.ok
      } catch (error) {
        console.error(`Error checking if post exists for ${date}:`, error)
        return false
      }
    },

    async findNextAvailablePost(startDate) {
      this.navigationLoading = true

      let currentDate = new Date(startDate)
      let attempts = 0
      const maxAttempts = 60 // Maximum days to search ahead

      while (attempts < maxAttempts) {
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)

        // Don't go beyond today's date
        if (currentDate > new Date()) {
          console.log('Reached current date, stopping search')
          this.navigationLoading = false
          return null
        }

        const formattedDate = this.formatDateStr(currentDate)
        console.log(`Checking if post exists for ${formattedDate}...`)

        const exists = await this.checkPostExists(formattedDate)

        if (exists) {
          this.navigationLoading = false
          return formattedDate
        }

        attempts++
      }

      console.log(`No posts found after checking ${maxAttempts} days`)
      this.navigationLoading = false
      return null
    },

    async findPreviousAvailablePost(startDate) {
      this.navigationLoading = true

      let currentDate = new Date(startDate)
      let attempts = 0
      const maxAttempts = 60 // Maximum days to search back

      while (attempts < maxAttempts) {
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1)

        // Don't go before the blog's start date
        if (currentDate < new Date(2010, 0, 1)) { // Assuming blog starts from Jan 1, 2010
          console.log('Reached blog start date, stopping search')
          this.navigationLoading = false
          return null
        }

        const formattedDate = this.formatDateStr(currentDate)
        console.log(`Checking if post exists for ${formattedDate}...`)

        const exists = await this.checkPostExists(formattedDate)

        if (exists) {
          this.navigationLoading = false
          return formattedDate
        }

        attempts++
      }

      console.log(`No posts found after checking ${maxAttempts} days`)
      this.navigationLoading = false
      return null
    },
  },

}
</script>

<style scoped>
.single-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 50px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.post-title {
  font-size: 2em;
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
  color: blue;
  font-size: 120%;
  text-decoration: none !important;
}

.thumbnail {
  width: 100%;
  height: auto;
  max-width: 800px;
  border: #333 1px solid;
  cursor: pointer; /* Add pointer cursor to indicate clickable image */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.thumbnail:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.markdown-container {
  padding-top: 10px;
  max-width: 100%;
  font-size: 1.4em;
  /* Adjusted for better readability */
  line-height: 1.6;
  /* Add an explicit line height if not already set */
}

.caption {
  margin-top: 5px;
  text-align: center;
  display: block;
  font-size: 0.8em;
}

.figure-wrapper {
  padding-top: 50px;
  margin: 0;
  position: relative;
  display: inline-block;
  max-width: 800px;
  aspect-ratio: 1/1;
  text-align: center;
}

.image-loading {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  color: #333;
  padding: 0;
  margin: 0;
}

.image-loading::after {
  /* Optional: add a subtle animation */
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

.toggle-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.exif-toggle-button,
.azeye-toggle-button {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
}

.exif-toggle-button:hover,
.azeye-toggle-button:hover {
  background-color: #e0e0e0;
}

.exif-container {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #e0e0e0;
}

.azeye-container {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #e0e0e0;
}

/* Tags and date row */
.tags-container {
  margin-top: 20px;
  padding: 20px 0px;
  border-top: 1px solid #eee;
}

.post-date,
.tag {
  font-size: 0.8rem;
  /* Explicitly enforce font size */
  font-weight: bold;
  /* Ensure bold font for both */
  text-decoration: none;
  /* Ensure consistent link styling */
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

.pagination-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 0 20px;
}

.pagination-button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid black;
  border-radius: 4px;
  cursor: pointer;
  min-width: 80px; /* Ensure consistent width when showing "Searching..." */
  transition: background-color 0.2s;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #e0e0e0;
}

/* Image Modal Styles */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 95%;
  max-height: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.full-resolution-image {
  max-width: 100%;
  max-height: calc(100vh - 100px);
  object-fit: contain;
}

.close-button-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.close-modal-button {
  background-color: white;
  color: black;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
}

.close-modal-button:hover {
  background-color: #f0f0f0;
}

body.modal-open {
  overflow: hidden;
}

@media (max-width: 768px) {
  .single-post {
    max-width: 600px;
    margin: 0 auto;
    padding: 10px;
    box-shadow: none;
    /* Remove box shadow for mobile screens */
  }

  .markdown-container {
    font-size: 0.8rem;
    /* Adjusted for better readability */
  }

  .full-resolution-image {
    max-height: calc(100vh - 80px);
  }
}
</style>
