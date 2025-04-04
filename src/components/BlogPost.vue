<template>
  <div class="single-post">
    <div v-if="post">
      <h2 class="post-title">{{ extractTitle(post) }}</h2>
      <p v-if="extractGeotag(post)" class="geotag">
        @
        <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
          {{ extractGeotag(post)?.text }}
        </a>
      </p>

      <!-- Image -->
      <div class="post-image">
        <figure class="figure-wrapper">
          <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
          <span class="caption">{{ calculateCaption(post) }}</span>

          <!-- EXIF and Azure Eye Toggle Buttons Below the Caption -->
          <div class="toggle-buttons">
            <button @click="toggleExifData" class="exif-toggle-button">
              {{ showExifData ? 'Hide EXIF Data' : 'Show EXIF Data' }}
            </button>
            <button @click="toggleAzEyeData" class="azeye-toggle-button">
              {{ showAzEyeData ? 'Hide AzEye Data' : 'Show AzEye Data' }}
            </button>
          </div>
        </figure>
      </div>

      <!-- EXIF Viewer -->
      <div v-if="showExifData" class="exif-container">
        <ExifViewer :initialImageUrl="getImageUrl(post)" />
      </div>

      <!-- Azure Eye Viewer -->
      <div v-if="showAzEyeData" class="azeye-container">
        <AzureViewer :initialImageUrl="getImageUrl(post)" />
      </div>
      <!-- he Blog Post Text Markdown, Rendered -->
      <div
        class="markdown-container"
        v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"
      ></div>

      <!-- Clickable Tags with separators -->
      <div>
        <h6>
          <p class="post-date">{{ date }}</p>
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
            console.log('Detected route change, new date:', newDate);
            if (newDate) {
                this.date = newDate;
                this.loadPost(newDate); // Fetch the new post
            } else {
                console.error('No date provided in route params!');
                this.post = null; // Clear the post if date is invalid
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
        const inputDate = this.parseDateString();
        const nextDay = new Date(inputDate);
        nextDay.setDate(inputDate.getDate() + 1); // Increment the day by 1
        const nextDayFormatted = this.formatDateStr(nextDay); // Format the date
        console.log('Navigating to next day:', nextDayFormatted);
        this.$router.push({ name: 'post', params: { date: nextDayFormatted } }); // Route to next day
    },
    navigateToPreviousDay() {
        const inputDate = this.parseDateString();
        const previousDay = new Date(inputDate);
        previousDay.setDate(inputDate.getDate() - 1); // Decrement the day by 1
        const previousDayFormatted = this.formatDateStr(previousDay); // Format the date
        console.log('Navigating to previous day:', previousDayFormatted);
        this.$router.push({ name: 'post', params: { date: previousDayFormatted } }); // Route to previous day
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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.post-date {
  font-size: 0.5em;
  color: #666;
  font-style: bold;
  padding-right: 20px;
  display: inline;
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
  text-decoration: none;
}

.thumbnail {
  width: 100%;
  height: auto;
  max-width: 2800px;
  border: #333 1px solid;
}

.caption {
  margin-top: 5px;
  text-align: center;
  display: block;
  font-size: 0.4em;
}

.figure-wrapper {
  width: 100%;
  margin-top: 20px;
  vertical-align: top;
  text-align: left;
}

.toggle-buttons {
  margin-top: 10px;
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
  margin: 10px 0 20px;
  padding: 15px;
  border: 1px solid black;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.azeye-container {
  margin: 10px 0 20px;
  padding: 15px;
  border: 1px solid #000;
  border-radius: 4px;
  background-color: #f9f9f9;
}

@media (max-width: 768px) {
  .post-image {
    width: 100%;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
  }

  .figure-wrapper {
    margin-bottom: 0;
    padding-bottom: 5px;
    position: relative;
    z-index: 1;
    overflow: visible;
  }

  .post-image {
    width: 100%;
    padding-top: 30px;
    text-align: left;
  }

  .thumbnail {
    max-width: 100%;
    height: auto;
    margin: 0;
  }

  .navigation-buttons {
    display: flex;
    flex-direction: column;
  }
}

.post-title {
  font-size: 2em;
  margin-bottom: 0;
}

.tag-separator {
  margin: 0 5px;
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
</style>
