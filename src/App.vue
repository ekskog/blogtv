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


#app {
  font-family: 'Calibri', sans-serif;
}

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
  text-decoration: none;
  color: #333;
}

.tag a:hover {
  color: #007bff;
  text-decoration: underline;
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

.markdown-container {
  line-height: 1.5; /* Maintain consistent vertical spacing */
  margin-top: 30px;
  padding-top: 10px;
  max-width: 100%;
  position: relative;
  z-index: 1;
  clear: both;
  font-size : 0.8em; /* Adjusted for better readability */
}

.markdown-container sup {
  font-size: 40%;
  vertical-align: text-top; /* Aligns the superscript at the top of the text */
  line-height: inherit; /* Inherits the line height to prevent disruption */
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

