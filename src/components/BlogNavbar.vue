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
    <!-- Full Menu (visible on larger screens) -->
    <nav class="full-menu" v-if="!isSmallScreen">
      <ul>
        <li><router-link to="/archive">Archive</router-link></li>
        <li><router-link to="/posts">Posts</router-link></li>
        <li><router-link to="/search">Search</router-link></li>
        <li><router-link to="/rimg">Random Picture</router-link></li>
      </ul>
    </nav>
    <!-- Mobile Menu -->
    <nav v-if="menuOpen && isSmallScreen" class="mobile-menu">
      <ul>
        <li><router-link to="/archive" @click="closeMenu">Archive</router-link></li>
        <li><router-link to="/posts" @click="closeMenu">Posts</router-link></li>
        <li><router-link to="/search" @click="closeMenu">Search</router-link></li>
        <li><router-link to="/rimg" @click="closeMenu">RandomImage</router-link></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "BlogNavbar",
  setup() {
    const isSmallScreen = ref(false);
    const menuOpen = ref(false);

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

    onMounted(() => {
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", checkScreenSize);
    });

    return { isSmallScreen, menuOpen, toggleMenu, closeMenu };
  },
};
</script>

<style scoped>
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
  gap: 10px;
  margin-left: 0; /* Changed from auto to 0 */
}

.logo img {
  width: 40px;
  height: 40px;
}

.full-menu {
  margin-left: auto; /* Added to push menu to the right */
  margin-right: 20px; /* Added for some spacing from the right edge */
}

.full-menu ul {
  list-style-type: none;
  display: flex;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.full-menu ul li {
  white-space: nowrap;
}

.full-menu ul li a {
  text-decoration: none;
  color: #333;
  padding: 5px 10px;
}

.full-menu ul li a:hover {
  color: #007bff;
}

/* Hamburger styles */
.hamburger-wrapper {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 24px;
  color: #333;
  transition: color 0.3s ease;
}

.hamburger:hover {
  color: #007bff;
}

/* Mobile menu styles */
.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.mobile-menu ul {
  list-style-type: none;
  margin: 0;
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
  font-weight: 500;
  font-size: 1.1rem;
  display: block;
  padding: 8px 0;
}

@media (max-width: 768px) {
  .full-menu {
    display: none;
  }
  .logo {
    margin-left: auto;
    margin-right: 20px;
  }
  .hamburger {
    display: block;
  }
}
</style>
