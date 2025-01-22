<template>
  <div class="the-harp">
    <h1>The Harp</h1>
    <div class="card-grid-container">
      <div class="card-grid">
        <FlipCard
          v-for="(album, index) in albums"
          :key="index"
          :header="album.name"
          :image="album.cover"
          :lyricsPath="album.info"
          @card-clicked="navigateToAlbum(album.route)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import FlipCard from './FlipCard.vue';
import loadAlbums from '../utils/loadAlbums';

export default {
  name: 'TheHarp',
  components: {
    FlipCard
  },
  data() {
    return {
      albums: loadAlbums()
    };
  },
  created() {
    console.log('Loaded albums:', this.albums); // Debugging log
  },
  methods: {
    navigateToAlbum(route) {
      this.$router.push(route);
    }
  }
};
</script>

<style scoped>
.the-harp {
  padding: 20px;
  text-align: center; /* Centers the title */
}

.the-harp h1 {
  margin-bottom: 10px; /* Reduce space below the title */
}

.card-grid-container {
  display: flex;
  justify-content: center; /* Centers the grid container horizontally */
  align-items: center; /* Centers the grid container vertically */
  margin: 0 auto;
  max-width: 80%; /* Adds a max width for the container */
  padding: 20px;
  border: red 1px solid;

}

.card-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  width: 100%;
}

@media (max-width: 600px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
