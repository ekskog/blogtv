<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>

<script>
import Navbar from "./components/BlogNavbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>

<style>
/* Ensure content starts below navbar */
#app {
  padding-top: 60px; /* Adjust based on your navbar height */
  max-width: 1200px; /* Optional: limit content width */
  margin: 0 auto; /* Center content */
  padding-left: 15px;
  padding-right: 15px;
}
.markdown-container a {
  text-decoration: none !important;
}
/* Responsive adjustments */
@media (max-width: 768px) {
  #app {
    padding-top: 50px; /* Slightly less padding on small screens */
  }
}
</style>

