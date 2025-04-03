<template>
  <div>
      <h3>The BLOGT Archive</h3>
    <div v-if="archive">
      <div class="year-display">
        <h2>{{ currentYear }}</h2>
        <div class="month-grid">
          <div v-for="month in sortedMonths(currentYear)" :key="month" class="month-tile" @click="toggleMonth(month)">
            <span>{{ getMonthName(month) }}</span>
            <div v-if="expandedMonth === month" class="days-grid">
              <div v-for="day in generateDays(month)" :key="day" class="day-tile"
                @click="handleDayClick(day, month, currentYear)">
                {{ day }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-controls">
        <button @click="prevYear" :disabled="currentYear === earliestYear" class="pagination-button">
          {{ 'Previous Year' }}
        </button>
        <button @click="nextYear" :disabled="currentYear === latestYear" class="pagination-button">
          {{ 'Next Year' }}
        </button>
      </div>
    </div>
    <div v-else class="loading">
      Loading...
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { postStore } from '@/stores/posts';

export default {
  data() {
    return {
      archive: null,
      currentYear: null,
      expandedMonth: null,
      earliestYear: null,
      latestYear: null,
    };
  },
  created() {
    this.fetchArchive();
  },
  methods: {
    async handleDayClick(day, month, currentYear) {
      const posts = ref([]);
      let postDate = `${day}${month}${currentYear}`;
      try {
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${postDate}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        posts.value = data;
        const postContent = posts.value[0];
        postStore.setCurrentPost(postContent);
        this.$router.push({ name: 'Post', params: { date: postDate } });
      } catch (error) {
        alert(error);
      }
    },
    async fetchArchive() {
      try {
        const response = await fetch('https://blogtbe.hbvu.su/posts/archives');
        const data = await response.json();
        this.archive = data;

        // Set the current year to the latest year with posts
        this.latestYear = Math.max(...Object.keys(this.archive));
        this.earliestYear = Math.min(...Object.keys(this.archive));
        this.currentYear = this.latestYear; // Start with the most recent year
      } catch (error) {
        console.error('Error fetching archive:', error);
      }
    },
    prevYear() {
      const years = Object.keys(this.archive)
        .map(Number)
        .sort((a, b) => a - b);

      const currentIndex = years.indexOf(this.currentYear);
      if (currentIndex > 0) {
        this.currentYear = years[currentIndex - 1];
        this.expandedMonth = null; // Collapse any expanded month
      }
    },
    nextYear() {
      const years = Object.keys(this.archive)
        .map(Number)
        .sort((a, b) => a - b);

      const currentIndex = years.indexOf(this.currentYear);
      if (currentIndex < years.length - 1) {
        this.currentYear = years[currentIndex + 1];
        this.expandedMonth = null; // Collapse any expanded month
      }
    },
    toggleMonth(month) {
      this.expandedMonth = this.expandedMonth === month ? null : month;
    },
    sortedMonths(year) {
      return Object.keys(this.archive[year]).sort((a, b) => parseInt(a) - parseInt(b));
    },
    getMonthName(month) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return monthNames[parseInt(month, 10) - 1];
    },
    generateDays(month) {
      // Fetch the days that have posts for the selected month
      const daysWithPosts = this.archive[this.currentYear][month] || [];
      return daysWithPosts;
    }
  }
};
</script>


<style scoped>
.year-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
/*
button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}
  */

.year-display {
  text-align: center;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.month-tile {
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

.month-tile:hover {
  background-color: #e0e0e0;
}

.month-tile.active {
  background-color: #007bff;
  color: white;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-top: 10px;
}

.day-tile {
  padding: 5px;
  background-color: #e0e0e0;
  border-radius: 4px;
  text-align: center;
}

.day-tile:hover {
  background-color: #ccc;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.loading {
  text-align: center;
  font-size: 18px;
  padding: 20px;
}
</style>

