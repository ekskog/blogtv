<template>
  <div id="app">
    <BlogTabs>
      <template v-slot:tab-0>
        <h2>Mainly a Map of Me</h2>
        <p>This is the content for the first tab.</p>
      </template>
      <template v-slot:tab-1>
        <h2>Wernher Won</h2>
        <p>This is the content for the second tab.</p>
      </template>
      <template v-slot:tab-2>
        <h2>Dictators Like Us</h2>
        <p>Or the best of O.S.B.O.A.</p>
      </template>
    </BlogTabs>
  </div>
</template>

<script>
import BlogTabs from '@/components/BlogTabs.vue';

export default {
  components: {
    BlogTabs
  }
};
</script>
