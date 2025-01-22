<template>
  <div class="the-harp">
    <h1>The Harp</h1>
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
}

.card-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

@media (max-width: 600px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
