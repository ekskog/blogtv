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
@import '@/assets/global.css';
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap');


/* Ensure content starts below navbar */
#app {
  padding-top: 60px; /* Adjust based on your navbar height */
  max-width: 1200px; /* Optional: limit content width */
  margin: 0 auto; /* Center content */
  padding-left: 15px;
  padding-right: 15px;
}

.h2 {
  text-transform: capitalize;
  font-size: 2.5em;
  border:#007bff 1px solid;
}
.tag {
  display: inline-block;
  font-size: 0.85em;
}

.tag-separator {
  margin: 0 8px;
  color: #666;
  font-size: 0.85em;
}

.tag a {
  text-decoration: none !important;
  color: #333;
}

.tag a:hover {
  color: #007bff;
  text-decoration: none !important;
}

.figure-wrapper {
  margin: 0;
  position: relative;
  display: inline-block;
  width: 100%;
  text-align: left;
  /* Left-align the figure */
}

.image-caption {
    font-size: 0.7em;
    margin-bottom: 10px;
    text-align: center;
    /* Left-align mobile caption */
  }

.image-caption {
  margin-top: 0px;
  font-size: 0.8em;
  /* Left-align the caption */
  padding: 0;
}

.image-caption a {
  color: #000;
  text-decoration: none;
}

.image-caption a:hover {
  text-decoration: underline;
}



</style>

