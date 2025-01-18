<!-- In BlogPost.vue -->
<template>
  <div class="single-post">
    <div v-if="post">
      <h2 class="post-title" >{{ extractTitle(post) }}</h2>

      <!-- Image -->
      <div class="post-image">
        <figure class="figure-wrapper">
          <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
          <figcaption v-if="extractGeotag(post)" class="image-caption">
            <a :href="extractGeotag(post)?.url" target="_blank" rel="noopener noreferrer">
              {{ extractGeotag(post)?.text }}
            </a>
          </figcaption>
        </figure>
      </div>

      <div class="markdown-container" v-html="renderMarkdown(removeGeotag(removeMetadata(post)))"></div>

      <!-- Clicable Tags with separators -->
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

    </div>
    <div v-else>Post not found</div>
  </div>
</template>

<script>
import { postStore } from '@/stores/posts'
import { marked } from 'marked'

export default {
  name: 'BlogPost',
  data() {
    return {
      date: this.$route.params.date,
      post: postStore.currentPost,
    }
  },
  methods: {
    displayPost() {
      if (this.post) {
        return this.post.content
      } else {
        return 'Post not found'
      }
    },
    renderMarkdown(markdown) {
      return marked(markdown)
    },
    getImageUrl(post) {
      const dateMatch = post.match(/Date:\s*(\d{2})(\d{2})(\d{4})/);
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
      const cleanedPost = this.removeMetadata(post);
      const geotagMatch = cleanedPost.match(/\[(.*?)\]\((https:\/\/maps\.app\.goo\.gl\/[^\s)]+)\)/)
      return geotagMatch
        ? {
          text: geotagMatch[1],
          url: geotagMatch[2],
        }
        : null
    },
    extractTitle(post) {
      const titleMatch = post.match(/Title:\s*([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
      return title
    },
    removeMetadata(post) {
      const cleanedPost = post.replace(/^(Date:.*|Tags:.*|Title:.*)$/gm, '').trim()
      return cleanedPost
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

.markdown-container {
  max-width: 100%;
  /* If you want the content to wrap */
  word-wrap: break-word;
}

.thumbnail {
  width: 100%;
  height: auto;
  max-width: 2800px;
  border: #333 1px solid;
}

.figure-wrapper {
  width: 100%;
  vertical-align: top;
  text-align: left;
}

@media (max-width: 768px) {
  .mobile-title {
    display: block;
    margin-bottom: 10px;
    font-size: 1.4em;
    text-align: left;
    /* Left-align the mobile title */
  }

  .desktop-title {
    display: none;
    border: 1px solid red;
  }

  .post-image {
    width: 100%;
    /* Ensure the image takes full width */
    padding: 0;
    /* Remove padding */
    text-align: left;
    /* Left-align the mobile image */
  }

  .thumbnail {
    max-width: 100%;
    height: auto;
    margin: 0;
    /* Remove margin */
  }

  .markdown-container {
    max-width: 100%;
    /* If you want the content to wrap */
    word-wrap: break-word;
  }

  .post-layout {
    display: block;
    text-align: left;
    /* Ensure mobile layout is left-aligned */
  }

  .post-image,
  .post-content {
    display: block;
    width: 100%;
    padding-left: 0;
    text-align: left;
    /* Left-align mobile content */
  }

  .thumbnail {
    margin-bottom: 20px;
  }

  .post-content {
    text-align: left;
    /* Left-align mobile content */
  }

  .post-date {
    margin-top: 3px;
    font-size: 0.5em;
    margin-bottom: 10px;
    text-align: left;
    /* Left-align mobile date */
  }
}
</style>
