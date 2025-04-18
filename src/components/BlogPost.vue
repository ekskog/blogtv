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
            v-show="!imageLoading" />
          <span class="caption" v-show="!imageLoading">{{ calculateCaption(post) }}</span>
        </figure>
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
        <button @click="navigateToPreviousDay" class="pagination-button">
          {{ '< 1' }} </button>
            <button @click="navigateToPreviousYear" class="pagination-button">
              {{ '< 365' }} </button>
                <button @click="navigateToNextYear" class="pagination-button">
                  {{ '> 365' }}
                </button>
                <button @click="navigateToNextDay" class="pagination-button">
                  {{ '> 1' }}
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
      loading: false,
      imageLoading: true, // Added for image loading state
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

    navigateToNextDay() {
      const inputDate = this.parseDateString()
      const nextDay = new Date(inputDate)
      nextDay.setDate(inputDate.getDate() + 1) // Increment the day by 1
      const nextDayFormatted = this.formatDateStr(nextDay) // Format the date
      console.log('Navigating to next day:', nextDayFormatted)
      this.$router.push({ name: 'post', params: { date: nextDayFormatted } }) // Route to next day
    },
    navigateToPreviousDay() {
      const inputDate = this.parseDateString()
      const previousDay = new Date(inputDate)
      previousDay.setDate(inputDate.getDate() - 1) // Decrement the day by 1
      const previousDayFormatted = this.formatDateStr(previousDay) // Format the date
      console.log('Navigating to previous day:', previousDayFormatted)
      this.$router.push({ name: 'post', params: { date: previousDayFormatted } }) // Route to previous day
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
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
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
  }
}
</style>
