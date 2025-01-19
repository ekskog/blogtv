<template>
  <div>
    <h3>Blog Archive</h3>
    <div v-if="archive">
      <ul class="year-list">
        <li v-for="(months, year) in archive" :key="year">
          <strong @click="toggleYear(year)" :class="{ active: expandedYear === year }">{{ year }}</strong>
          <ul v-if="expandedYear === year" class="month-list">
            <li v-for="month in sortedMonths(months)" :key="month">
              <span @click="toggleMonth(month)" :class="{ active: expandedMonth === month }">{{ getMonthName(month) }}</span>
              <div v-if="expandedMonth === month" class="day-grid">
                <span v-for="day in months[month]" :key="day" @click="getPost(`${day}${month}${year}`)" class="clickable-day">{{ day }}</span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div v-else>
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
      expandedYear: null,
      expandedMonth: null,
    };
  },
  created() {
    this.fetchArchive();
  },
  methods: {
    async fetchArchive() {
      try {
        const response = await fetch('https://blogtbe.hbvu.su/posts/archives');
        this.archive = await response.json();
      } catch (error) {
        console.error('Error fetching archive:', error);
      }
    },
    toggleYear(year) {
      if (this.expandedYear === year) {
        this.expandedYear = null;
        this.expandedMonth = null;
      } else {
        this.expandedYear = year;
        this.expandedMonth = null;
      }
    },
    toggleMonth(month) {
      if (this.expandedMonth === month) {
        this.expandedMonth = null;
      } else {
        this.expandedMonth = month;
      }
    },
    async getPost(date) {
      const posts = ref([]);
      try {
        const response = await fetch(`https://blogtbe.hbvu.su/posts/${date}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        posts.value = data;
        const postContent = posts.value[0];
        postStore.setCurrentPost(postContent);
        const postDate = this.formatDate(date);
        console.log('Navigating to post:', postDate);
        this.$router.push({ name: 'Post', params: { date: postDate } });
      } catch (error) {
        alert(error);
      }
    },
    sortedMonths(months) {
      return Object.keys(months).sort((a, b) => parseInt(a) - parseInt(b));
    },
    getMonthName(month) {
      console.log('Archive >>> month:', month);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return monthNames[parseInt(month, 10) - 1];
    },
    formatDate(dateStr) {
      console.log('dateStr:', dateStr);
      if (!dateStr) return '';
      const day = dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const year = dateStr.substring(4, 8);
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const monthIndex = parseInt(month, 10) - 1;
      return `${day} ${months[monthIndex]} ${year}`;
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
.archive-container {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
}

.year-list,
.month-list {
  list-style: none;
  padding: 0;
}

.year-list>li {
  margin: 10px 0;
}

strong,
span {
  display: block;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

strong:hover,
span:hover {
  background-color: #e0e0e0;
}

strong.active,
span.active {
  background-color: #007bff;
  color: white;
}

.month-list {
  margin-left: 20px;
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  gap: 5px;
  margin-left: 40px;
}

.clickable-day {
  cursor: pointer;
  color: #007bff;
  text-decoration: none;
}

.clickable-day:hover {
  color: #0056b3;
}
</style>
