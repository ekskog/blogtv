<template>
  <div class="flip-card" @click="flipCard">
    <div :class="{'flipped': isFlipped}">
      <div class="front">
        <div class="card-header" @click.stop="cardClicked">{{ header }}</div>
        <img :src="image" alt="Song Image" class="card-image">
        <audio v-if="audio" :src="audio" controls></audio>
      </div>
      <div class="back">
        <p>{{ lyrics }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    header: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    audio: {
      type: String,
      default: null
    },
    lyricsPath: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isFlipped: false,
      lyrics: ''
    };
  },
  created() {
    this.fetchLyrics();
  },
  methods: {
    flipCard() {
      this.isFlipped = !this.isFlipped;
    },
    async fetchLyrics() {
      try {
        const response = await fetch(this.lyricsPath);
        if (response.ok) {
          this.lyrics = await response.text();
        } else {
          console.error('Failed to fetch lyrics:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching lyrics:', error);
      }
    },
    cardClicked() {
      this.$emit('card-clicked');
    }
  }
};
</script>

<style scoped>
.flip-card {
  perspective: 1000px;
}

.flip-card > div {
  width: 100%;
  height: auto;
  padding-top: 75%; /* maintain aspect ratio */
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

.flip-card .flipped {
  transform: rotateY(180deg);
}

.flip-card .front, .flip-card .back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card .card-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
}

.flip-card .front img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.flip-card .card-image {
  max-width: 500px;
  max-height: 500px;
  width: 100%;
  height: auto;
}

.flip-card .back {
  transform: rotateY(180deg);
}
</style>
