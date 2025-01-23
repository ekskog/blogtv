<template>
  <div>
    <div class="tabs">
      <button v-for="(tab, index) in tabs" :key="index" :class="{ active: currentTab === index }"
        @click="currentTab = index">
        {{ tab }}
      </button>
    </div>
    <div class="tab-content">
      <img :src="currentContent.image" alt="Cover Image" />
      <p>{{ currentContent.text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 0,
      tabs: ['ma-mom', 'v2', 'dlu'], // Define your tab labels (folder names) here
      content: {} // Store the fetched content here
    };
  },
  computed: {
    currentContent() {
      return this.content[this.tabs[this.currentTab]] || {};
    }
  },
  created() {
    this.tabs.forEach(tab => {
      this.loadContent(tab);
    });
  },
  methods: {
    async loadContent(tab) {
      try {
        const image = new URL(`../assets/albums/${tab}/cover.png`, import.meta.url).href;

        // Use import for text file instead of fetch
        const textModule = await import(`../assets/albums/${tab}/info.txt?raw`);
        const text = textModule.default;

        this.content[tab] = {
          image: image,
          text: text
        };
      } catch (error) {
        console.error(`Failed to load content for ${tab}:`, error);
      }
    }
  }
};
</script>

<style>
.tabs {
  display: flex;
  border-bottom: 1px solid #ccc;
  flex-wrap: wrap;
}

.tab-content img {
  max-width: 100%;
  /* Ensures image is not wider than its container */
  height: auto;
  /* Maintains aspect ratio */
  object-fit: contain;
  /* Keeps entire image visible */
  max-height: 500px;
  /* Optional: limit maximum height */
  border: #333 1px solid;
}

button {
  padding: 10px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: none;
  outline: none;
  margin-right: 5px;
}

button.active {
  border-bottom: 2px solid #42b983;
}

.tab-content {
  padding: 10px;
  border: 1px solid #ccc;
  margin-top: 10px;
}

@media (max-width: 600px) {
  .tabs {
    flex-direction: column;
  }

  button {
    width: 100%;
    margin-right: 0;
    margin-bottom: 5px;
  }
}
</style>
