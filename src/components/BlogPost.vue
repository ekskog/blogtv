<template>
  <div class="single-post">
    <div v-if="post">
      <h2 class="post-title">{{ extractTitle(post) }}</h2>
      <p v-if="extractGeotag(post)" class="geotag">@
        <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
          {{ extractGeotag(post)?.text }}
        </a>
      </p>
      <!-- Image -->
      <div class="post-image">
        <figure class="figure-wrapper">
          <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
        </figure>
      </div>

      <div class="markdown-container" v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"></div>

      <!-- Clickable Tags with separators -->
      <h6>
        <p class="post-date">{{ date }}</p>
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

      <!-- Navigation Buttons -->

      <div class="pagination-controls">
        <button @click="navigateToPreviousDay" class="pagination-button">
          {{ 'Previous Post' }}
        </button>

        <button @click="navigateToNextDay" class="pagination-button">
          {{ 'Next Post' }}
        </button>
      </div>

    </div>
    <div v-else>Post not found</div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { postStore } from '@/stores/posts';
import { marked } from 'marked';

export default {
  name: 'BlogPost',

  data() {
    return {
      date: this.$route.params.date,
      post: postStore.currentPost,
    };
  },
  watch: {
    '$route.params.date': {
      immediate: true,
      handler(newDate) {
        this.date = newDate;
        this.loadPost(newDate);
      },
    },
  },
  methods: {
    async getPost(date) {
      const posts = ref([]);
      try {
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`);
        if (!response.ok) {
          console.error(`No post found for ${date}`);
        }
        const data = await response.json();
        posts.value = data;
        const postContent = posts.value[0];
        postStore.setCurrentPost(postContent);
        this.$router.push({ name: 'Post', params: { date: date } });
      } catch (error) {
        alert(`${error.message} - No post found for ${date}`);
      }
    },
    async loadPost(date) {
      try {
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`);
        if (!response.ok) {
          throw new Error('loadPOST: Post not found');
        }
        const data = await response.json();
        const postContent = data[0];
        postStore.setCurrentPost(postContent);
        this.post = postContent;
      } catch (error) {
        alert(error.message + " >> THERE IS ERROR LOAD POST ERROR");
      }
    },
    created() {
      this.loadPost(this.date);
    },
    renderMarkdown(markdown) {
      return marked(markdown);
    },
    getImageUrl(post) {
      const dateMatch = post.match(/Date:\s*(\d{2})(\d{2})(\d{4})/);
      if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = dateMatch[3];
        let dateUrl = `https://objects.hbvu.su/blotpix/${year}/${month}/${day}.jpeg`;
        return dateUrl;
      }
      console.error('Invalid Date format in metadata:', post);
      return '';
    },
    extractTags(post) {
      const tagsMatch = post.match(/^Tags:\s*(.+)$/m);
      const tags = tagsMatch ? tagsMatch[1].trim() : 'No Tags';
      return tags;
    },
    removeGeotag(content) {
      return content
        .replace(/\[.*?\]\(https:\/\/maps\.app\.goo\.gl\/[^\s)]+\)\s*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    },
    extractGeotag(post) {
      const cleanedPost = this.removeMetadata(post);
      const geotagMatch = cleanedPost.match(/\[(.*?)\]\((https:\/\/maps\.app\.goo\.gl\/[^\s)]+)\)/);
      return geotagMatch
        ? {
          text: geotagMatch[1],
          url: geotagMatch[2],
        }
        : null;
    },
    extractTitle(post) {
      const titleMatch = post.match(/Title:\s*([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
      return title;
    },
    removeMetadata(post) {
      const cleanedPost = post.replace(/^(Date:.*|Tags:.*|Title:.*)$/gm, '').trim();
      return cleanedPost;
    },

    parseDateString() {
      const day = parseInt(this.date.slice(0, 2));
      const month = parseInt(this.date.slice(2, 4)) - 1;
      const year = parseInt(this.date.slice(4, 8));
      let parsedDate = new Date(year, month, day);
      return parsedDate;  // Return Date object
    },

    navigateToNextDay() {
      let inputDate = this.parseDateString();  // Get the Date object from the date string
      let nextDay = new Date(inputDate);
      nextDay.setDate(inputDate.getDate() + 1);  // Increment the day by 1
      let nextDayFormatted = this.formatDateStr(nextDay);  // Format the date to the desired format
      this.getPost(nextDayFormatted);  // Fetch the post for the next day
    },

    navigateToPreviousDay() {
      let inputDate = this.parseDateString();  // Get the Date object from the date string
      let previousDay = new Date(inputDate);
      previousDay.setDate(inputDate.getDate() - 1);  // Decrement the day by 1
      let previousDayFormatted = this.formatDateStr(previousDay);  // Format the date to the desired format
      this.getPost(previousDayFormatted);  // Fetch the post for the previous day
    },

    formatDateStr(date) {
      // Formats the date as DDMMYYYY
      return `${("0" + date.getDate()).slice(-2)}${("0" + (date.getMonth() + 1)).slice(-2)}${date.getFullYear()}`;
    }
  },
};
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
  /* Add some margin to separate geotag from other elements */
  text-decoration: none;
}

.markdown-container {
  max-width: 100%;
}

.thumbnail {
  width: 100%;
  height: auto;
  max-width: 2800px;
  border: #333 1px solid;
}

.figure-wrapper {
  width: 100%;
  margin-top: 20px;
  vertical-align: top;
  text-align: left;
}

@media (max-width: 768px) {
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
</style>
