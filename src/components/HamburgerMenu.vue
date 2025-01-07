<template>
    <div>
      <!-- Hamburger button -->
      <button class="hamburger" @click="toggleMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
  
      <!-- Menu -->
      <nav v-if="isMenuOpen" class="menu">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/posts">Posts</router-link></li>
          <li><router-link to="/tags">Tags</router-link></li>
          <li><router-link to="/search">Search</router-link></li>
        </ul>
      </nav>
    </div>
  </template>
  
  <script>
  export default {
    name: "HamburgerMenu",
    data() {
      return {
        isMenuOpen: false, // Controls whether the menu is open or closed
      };
    },
    methods: {
      toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen; // Toggle the menu state
      },
    },
  };
  </script>
  
  <style scoped>
  /* Hamburger button styling */
  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 25px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .bar {
    width: 100%;
    height: 4px;
    background-color: #333;
  }

  /* Menu styling */
  .menu {
    position: absolute;
    top: 50px;
    left: 10px; /* Changed from right to left */
    background-color: white;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }

  .menu ul {
    list-style-type: none;
    margin: 0;
    padding: 10px;
  }

  .menu ul li {
    margin-bottom: 10px;
  }

  .menu ul li:last-child {
    margin-bottom: 0;
  }

  /* Responsive behavior */
  @media (max-width: 768px) {
    .hamburger {
      display: flex; /* Show hamburger button on small screens */
      position: absolute;
      top: 10px;
      left: 10px; /* Changed from right to left */
      z-index: 10;
    }

    .menu ul li a {
      text-decoration: none;
      color: #333;
      font-weight: bold;
      font-size: large;
      padding-left :8 px
    }
  }
</style>
