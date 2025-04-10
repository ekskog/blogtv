<template>
  <div class="single-post">
    <div v-if="post">
      <h2 class="post-title">{{ extractTitle(post) }}</h2>
      <div v-if="extractGeotag(post)">
        <a
          :href="extractGeotag(post)?.url"
          target="_blank"
          rel="noopener noreferrer"
          class="geotag"
        >
          @ {{ extractGeotag(post)?.text }}
        </a>
      </div>

      <!-- Image -->
      <div class="post-image">
        <figure class="figure-wrapper">
          <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
          <span class="caption">{{ calculateCaption(post) }}</span>
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
      <div
        class="markdown-container"
        v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"
      ></div>

      <!-- Clickable Tags with separators -->
      <div class="tags-container">
        <span class="post-date">{{ date }}</span> <!-- Changed from <p> to <span> -->
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

      <!-- Navigation Buttons -->
      <div class="pagination-controls">
        <button @click="navigateToPreviousDay" class="pagination-button">
          {{ '<' }}
        </button>
        <button @click="navigateToNextDay" class="pagination-button">
          {{ '>' }}
        </button>
      </div>
    </div>
    <div v-else>Post not found</div>
  </div>
</template>

<script>
import { ref } from 'vue'
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
    }
  },
  watch: {
    '$route.params.date': {
      immediate: true,
      handler(newDate) {
        console.log('Detected route change, new date:', newDate)
        if (newDate) {
          this.date = newDate
          this.loadPost(newDate) // Fetch the new post
        } else {
          console.error('No date provided in route params!')
          this.post = null // Clear the post if date is invalid
        }
      },
    },
  },

  methods: {
    toggleExifData() {
      this.showExifData = !this.showExifData
    },
    toggleAzEyeData() {
      this.showAzEyeData = !this.showAzEyeData
    },
    /*
    async getPost(date) {
      const posts = ref([])
      try {
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`)
        if (!response.ok) {
          console.error(`No post found for ${date}`)
        }
        const data = await response.json()
        posts.value = data
        const postContent = posts.value[0]
        postStore.setCurrentPost(postContent)
        this.$router.push({ name: 'Post', params: { date: date } })
      } catch (error) {
        console.log(`${error.message} - No post found for ${date}`)
      }
    },
    */
    async loadPost(date) {
      try {
        const posts = ref([])
        console.log(posts.value)

        console.log('Loading post for date:', date)
        this.loading = true
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`)
        if (!response.ok) {
          throw new Error('loadPOST: Post not found')
        }
        const data = await response.json()
        const postContent = data[0]
        console.log('Post content:', postContent)
        postStore.setCurrentPost(postContent)
        this.post = postContent
      } catch (error) {
        alert(error.message + ' >> THERE IS ERROR LOAD POST ERROR')
      }
    },
    created() {
      this.loadPost(this.date)
    },
    renderMarkdown(markdown) {
      return marked(markdown)
    },
    getImageUrl(post) {
      const dateMatch = post.match(/Date:\s*(\d{2})(\d{2})(\d{4})/)
      if (dateMatch) {
        const day = dateMatch[1]
        const month = dateMatch[2]
        const year = dateMatch[3]
        let dateUrl = `https://objects.hbvu.su/blotpix/${year}/${month}/${day}.jpeg`
        return dateUrl
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
  font-size: 1.4em; /* Adjusted for better readability */
  line-height: 1.6; /* Add an explicit line height if not already set */
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
  text-align: left;
  /* Left-align the figure */
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
      box-shadow: none; /* Remove box shadow for mobile screens */
    }
  }
}
</style>
