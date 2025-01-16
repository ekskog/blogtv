<template>
  <div class="single-post">
    <h1>Post from {{ date }}</h1>
    <!-- Add your post content here -->
  </div>
</template>

<script>
export default {
  name: "BlogPost",
  data() {
    return {
      date: this.$route.params.date
    }
  },
};
</script>

<style scoped>
.single-post {
  padding: 20px;
}
</style>
