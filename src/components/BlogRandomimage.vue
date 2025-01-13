<template>
  <div class="image-container">
    <!-- Resized image -->
    <img :src="imageUrl" alt="Random Image" class="thumbnail" @click="showOverlay = true" />

    <!-- Display the selected date -->
    <p class="selected-date">This picture was taken on {{ selectedDate }}
      <a href="#" class="refresh-link" @click.prevent="generateNewImage">(refresh)</a>
    </p>

    <!-- Full-size overlay -->
    <div v-if="showOverlay" class="overlay">
      <!-- Close button -->
      <button class="close-button" @click="showOverlay = false">✖</button>

      <!-- Full-size image -->
      <img :src="imageUrl" alt="Full Size Image" class="full-image" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlogRandomImage',
  data() {
    return {
      imageUrl: null,
      selectedDate: "", // Holds the formatted selected date
      showOverlay: false, // Controls the visibility of the overlay
    }
  },
  mounted() {
    const randomDate = this.generateRandomDate(
      new Date(2010, 2, 11), // Start date: March 11, 2010
      new Date(), // End date: Today
    )
    const formattedDate = this.formatDate(randomDate)
    this.imageUrl = `https://objects.hbvu.su/blotpix/${formattedDate.year}/${formattedDate.month}/${formattedDate.day}.jpeg`
    this.selectedDate = this.formatDateReadable(randomDate); // Format for display
  },
  methods: {
    generateRandomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return { year, month, day }
    },
    formatDateReadable(date) {
      const day = date.getDate();
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const year = date.getFullYear();
      return `${day}${this.getOrdinalSuffix(day)} of ${month}, ${year}`;
    },
    getOrdinalSuffix(day) {
      if (day % 10 === 1 && day !== 11) return 'st';
      if (day % 10 === 2 && day !== 12) return 'nd';
      if (day % 10 === 3 && day !== 13) return 'rd';
      return 'th';
    },
    generateNewImage() {
      const randomDate = this.generateRandomDate(
        new Date(2010, 2, 11), // Start date: March 11, 2010
        new Date() // End date: Today
      );
      const formattedDate = this.formatDate(randomDate);
      this.imageUrl = `https://objects.hbvu.su/blotpix/${formattedDate.year}/${formattedDate.month}/${formattedDate.day}.jpeg`;
      this.selectedDate = this.formatDateReadable(randomDate); // Update displayed date
    },
  },
}
</script>

<style scoped>
.image-container {
  position: relative;
  width: 100%; /* Ensure container takes full width */
  max-width: 500px; /* Limit max width on larger screens */
  margin: auto; /* Center the container */
}

.thumbnail {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1; /* Maintain square aspect ratio */
  object-fit: cover;
  cursor: pointer;
  border: rgba(0, 0, 0, 0.8) 1px solid;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.full-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain; /* Ensure image scales nicely within overlay */
}

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
  background-color: #f5f5f5;
}

.selected-date {
  font-size: 16px;
  color: #333;
  margin-top: 10px;
  text-align: center;
}

.refresh-link {
  margin-left: 10px;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

.refresh-link:hover {
  text-decoration: underline;
}
@media (max-width: 768px) {
  .selected-date {
    font-size: 14px;
  }

  .close-button {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
}

</style>
