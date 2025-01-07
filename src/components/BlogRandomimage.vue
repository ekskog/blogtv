<template>
  <div class="image-container">
    <!-- Resized image -->
    <img 
      :src="imageUrl" 
      alt="Random Image" 
      class="thumbnail" 
      @click="showOverlay = true" 
    />

    <!-- Full-size overlay -->
    <div 
      v-if="showOverlay" 
      class="overlay"
    >
      <!-- Close button -->
      <button class="close-button" @click="showOverlay = false">✖</button>
      
      <!-- Full-size image -->
      <img :src="imageUrl" alt="Full Size Image" class="full-image" />
    </div>
  </div>
</template>

<script>
export default {
  name: "BlogRandomImage",
  data() {
    return {
      imageUrl: null,
      showOverlay: false, // Controls the visibility of the overlay
    };
  },
  mounted() {
    const randomDate = this.generateRandomDate(
      new Date(2010, 2, 11), // Start date: March 11, 2010
      new Date() // End date: Today
    );
    const formattedDate = this.formatDate(randomDate);
    this.imageUrl = `https://objects.hbvu.su/blotpix/${formattedDate.year}/${formattedDate.month}/${formattedDate.day}.jpeg`;
  },
  methods: {
    generateRandomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return { year, month, day };
    },
  },
};
</script>

<style scoped>
.image-container {
  position: relative;
}

/* Thumbnail styling (500x500 pixels) */
.thumbnail {
  width: 500px;
  height: 500px;
  object-fit: cover;
  cursor: pointer;
}

/* Overlay styling */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Full-size image in overlay */
.full-image {
  max-width: 90%;
  max-height: 90%;
}

/* Close button styling */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  font-weight: bold;
  color: black;
  cursor: pointer;
}

.close-button:hover {
  background-color: #f5f5f5; /* Slight hover effect */
}
</style>
