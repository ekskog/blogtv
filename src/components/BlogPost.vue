<!-- In BlogPost.vue -->
<template>
  <div class="single-post">
    <h1>{{ date }}</h1>
    <div v-if="post">
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
    </div>
    <div v-else>Post not found</div>
  </div>
</template>

<script>
import { postStore } from '@/stores/posts'

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
        console.log(this.post)
        return this.post.content
      } else {
        return 'Post not found'
      }
    },
    getImageUrl(post) {
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
    removeMetadata(post) {
      const cleanedPost = post.replace(/^(Date:.*|Tags:.*|Title:.*)$/gm, '').trim()
      return cleanedPost
    },
  },
}
</script>

<style scoped>
.thumbnail {
  width: 100%;
  height: auto;
  max-width: 2800px;
  border: #333 1px solid;
}

.figure-wrapper {
  width: 500px;
  vertical-align: top;
  text-align: left;
}
</style>
