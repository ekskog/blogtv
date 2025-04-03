<template>
  <header>
    <div v-if="isSmallScreen" class="hamburger-wrapper">
      <button class="hamburger" @click="toggleMenu">
        <i :class="['fas', menuOpen ? 'fa-times' : 'fa-bars']"></i>
      </button>
    </div>
    <div class="logo">
      <img src="@/assets/logo.png" alt="App Logo" />
    </div>

    <!-- Full Menu (Desktop) -->
    <nav class="full-menu" v-if="!isSmallScreen">
      <ul>
        <li><router-link to="/posts">Posts</router-link></li>
        <li>
          <input type="date" v-model="selectedDate" @change="goToPost" class="nav-input" />
        </li>
        <li class="search-container">
          <input type="text" v-model="searchTag" placeholder="Search by tag" class="nav-input search-input"
            @keyup.enter="searchByTag" />
          <i class="fas fa-search search-icon" @click="searchByTag"></i>
        </li>
      </ul>
    </nav>

    <!-- Mobile Menu -->
    <nav v-if="menuOpen && isSmallScreen" class="mobile-menu">
      <ul>
        <li><router-link to="/posts" @click="closeMenu">Posts</router-link></li>
        <li>
          <input type="date" v-model="selectedDate" @change="goToPost" class="nav-input" />
        </li>
        <li class="search-container">
          <input type="text" v-model="searchTag" placeholder="Search by tag" class="nav-input search-input"
            @keyup.enter="searchByTag" />
          <i class="fas fa-search search-icon" @click="searchByTag"></i>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "BlogNavbar",
  setup() {
    const router = useRouter();
    const isSmallScreen = ref(false);
    const menuOpen = ref(false);
    const selectedDate = ref(null);
    const searchTag = ref("");

    const checkScreenSize = () => {
      isSmallScreen.value = window.innerWidth <= 768;
      if (!isSmallScreen.value) menuOpen.value = false;
    };

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
    };

    const closeMenu = () => {
      menuOpen.value = false;
    };

    const goToPost = () => {
      if (!selectedDate.value) return;

      // Format date as DDMMYYYY
      const dateObj = new Date(selectedDate.value);
      const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}${String(dateObj.getMonth() + 1).padStart(2, "0")}${dateObj.getFullYear()}`;

      // Redirect to the blog post
      router.push({ name: "post", params: { date: formattedDate } });

      // Close menu on mobile
      if (isSmallScreen.value) closeMenu();
    };

    const searchByTag = () => {
      if (!searchTag.value.trim()) return;

      // Navigate to the BlogSearch component with the tag parameter
      router.push({ name: 'search', query: { tag: searchTag.value.trim() } });

      if (isSmallScreen.value) closeMenu();
    };

    onMounted(() => {
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", checkScreenSize);
    });

    return { isSmallScreen, menuOpen, toggleMenu, closeMenu, selectedDate, searchTag, goToPost, searchByTag };
  },
};
</script>

<style scoped>
/* Navbar Styling */
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: white;
  z-index: 1000;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 40px;
  height: 40px;
}

.full-menu {
  margin-left: auto;
  margin-right: 20px;
}

.full-menu ul {
  list-style: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
}

.full-menu ul li {
  display: flex;
  align-items: center;
}

/* Inputs */
.nav-input {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 150px;
}

/* Search Input */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding-right: 35px;
}

.search-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
  color: #555;
  transition: color 0.2s;
}

.search-icon:hover {
  color: #007bff;
}

/* Mobile Menu */
.hamburger-wrapper {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #333;
  transition: color 0.3s ease;
}

.hamburger:hover {
  color: #007bff;
}

.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.mobile-menu ul {
  list-style-type: none;
  padding: 20px;
}

.mobile-menu ul li {
  margin-bottom: 15px;
}

.mobile-menu ul li:last-child {
  margin-bottom: 0;
}

.mobile-menu ul li a {
  text-decoration: none;
  color: #333;
  font-size: 1.1rem;
  display: block;
  padding: 8px 0;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .full-menu {
    display: none;
  }

  .logo {
    margin-left: auto;
    margin-right: 20px;
  }

  .mobile-menu ul {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mobile-menu ul li {
    display: flex;
    align-items: center;
  }
}
</style>
