<template>
  <div class="album">
    <h1>{{ albumName }}</h1>
    <div class="card-grid">
      <FlipCard
        v-for="(song, index) in songs"
        :key="index"
        :header="song.name"
        :image="song.image"
        :audio="song.audio"
        :lyricsPath="song.lyrics"
      />
    </div>
  </div>
</template>

<script>
import FlipCard from './FlipCard.vue';

export default {
  name: 'MusicAlbum',
  components: {
    FlipCard
  },
  props: {
    albumName: {
      type: String,
      required: true
    },
    songs: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
.album {
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
