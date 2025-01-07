<template>
    <header>
        <!-- Full Menu (visible on larger screens) -->
        <nav class="full-menu" v-if="!isSmallScreen">
            <ul>
                <li><router-link to="/">Home</router-link></li>
                <li><router-link to="/posts">Posts</router-link></li>
                <li><router-link to="/search">Search</router-link></li>
                <li><router-link to="/rimg">RandomImage</router-link></li>
            </ul>
        </nav>

        <!-- Hamburger Menu (visible on smaller screens) -->
        <HamburgerMenu v-if="isSmallScreen" />
    </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import HamburgerMenu from "./HamburgerMenu.vue";

export default {
    name: "Navbar",
    components: {
        HamburgerMenu,
    },
    setup() {
        const isSmallScreen = ref(false);

        // Function to check screen size
        const checkScreenSize = () => {
            isSmallScreen.value = window.innerWidth <= 768; // Small screen if width <= 768px
        };

        // Add event listener for window resize
        onMounted(() => {
            checkScreenSize();
            window.addEventListener("resize", checkScreenSize);
        });

        // Clean up event listener when component unmounts
        onUnmounted(() => {
            window.removeEventListener("resize", checkScreenSize);
        });

        return { isSmallScreen };
    },
};
</script>

<style scoped>
/* Navbar styles */
header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    position: fixed;
    /* Fix navbar at the top */
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    /* Fixed height for consistency */
    background-color: white;
    /* Ensure a background color for visibility */
    z-index: 1000;
    /* Ensure it stays above other elements */
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    /* Optional shadow for better visibility */
}

/* Full Menu (Visible on Larger Screens) */
.full-menu ul {
    list-style-type: none;
    display: flex;
    gap: 20px;
}

.full-menu ul li a {
    text-decoration: none;
    color: #333;
}

.full-menu ul li a:hover {
    color: #007bff;
    /* Add a hover effect */
}

/* Hamburger Menu Button (Hidden on Desktop) */
.hamburger {
    display: none;
    /* Hidden by default (only shown on small screens) */
}

/* Dropdown Menu for Hamburger (Not Visible on Desktop) */
.menu {
    display: none;
    /* Hidden by default */
}

/* Responsive Styles (Small Screens) */
/* Responsive Styles (Small Screens) */
@media (max-width: 768px) {
  header {
    height: 50px; /* Consistent height on small screens */
    padding: 5px 10px;
  }

  /* Hide full menu on small screens */
  .full-menu {
    display: none;
  }

  /* Hamburger Menu Button */
  .hamburger {
    display: flex;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1100;
  }

  /* Dropdown Menu Styling */
  .menu {
    position: fixed;
    top: 50px; /* Position below navbar */
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
    z-index: 1000;
  }

  .menu ul {
    list-style-type: none;
    padding: 10px;
    margin: 0;
  }

  .menu ul li {
    margin-bottom: 10px;
  }

  .menu ul li a {
    text-decoration: none;
    color: #333;
    display: block;
    padding: 10px;
  }
}
</style>
