<template>
  <div class="blog-posts">
    <div v-for="(post, index) in posts" :key="index" class="post">
      <div class="padding"></div>

      <!-- Table layout for image and content -->
      <table class="post-layout">
        <tbody>
          <tr>
            <!-- Image -->
            <td class="post-image">
              <img :src="getImageUrl(post)" alt="Post Image" class="thumbnail" />
            </td>
            <!-- Title and Markdown-rendered content -->
            <td class="post-content">
              <table class="nested-table">
                <tbody>
                  <tr>
                    <td>
                      <h2 class="post-title">{{ extractTitle(post) }}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="markdown-container" v-html="renderMarkdown(removeMetadata(post))"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="padding"></div>

      <!-- Tags -->
      <h6 class="post-tags">
        <span v-for="(tag, index) in extractTags(post).split(',')" :key="index" class="tag">
          <a href="#" @click.prevent="fetchPostsByTag(tag.trim())">
            {{ tag.trim() }}
          </a>
        </span>
      </h6>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { marked } from "marked"; // Import the marked library

export default {
  name: "BlogPost",
  setup() {
    const posts = ref([]); // Holds the fetched posts

    // Fetch posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://blogt.hbvu.su/");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        posts.value = data; // Store the fetched array in `posts`
        //console.log("Fetched Posts:", posts.value); // Log fetched posts
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    // Extract title from post
    const extractTitle = (post) => {
      const titleMatch = post.match(/^Title:\s*(.+)$/m); // Regex to match Title line
      const title = titleMatch ? titleMatch[1].trim() : "Untitled"; // Return just the title text
      //console.log("Extracted Title:", title); // Log extracted title
      return title;
    };

    // Remove metadata lines (Date, Tags, Title) from post content
    const removeMetadata = (post) => {
      const cleanedPost = post.replace(/^(Date:.*|Tags:.*|Title:.*)$/gm, '').trim(); // Remove metadata lines
      //console.log("Cleaned Post Content:", cleanedPost); // Log cleaned post content
      return cleanedPost;
    };

    // Extract tags from post
    const extractTags = (post) => {
      const tagsMatch = post.match(/^Tags:\s*(.+)$/m); // Regex to match Tags line
      const tags = tagsMatch ? tagsMatch[1].trim() : "No Tags"; // Return tags or default
      //console.log("Extracted Tags:", tags); // Log extracted tags
      return tags;
    };

    // Render Markdown content as HTML
    const renderMarkdown = (markdown) => {
      return marked(markdown); // Convert Markdown to HTML
    };

    // Generate image URL based on Date metadata
    const getImageUrl = (post) => {
      const dateMatch = post.match(/^Date:\s*(\d{2})(\d{2})(\d{4})$/m); // Match Date in YYYYMMDD format
      if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = dateMatch[3];
        console.log(year, month, day); // Log extracted date
        let dateUrl = `https://objects.hbvu.su/blotpix/${year}/${month}/${day}.jpeg`; // Construct image URL correctly
        console.log(dateUrl); // Construct image URL correctly

        return dateUrl; // Construct image URL correctly
      }
      console.error("Invalid Date format in metadata:", post);
      return ""; // Return empty string if no valid date is found
    };

    // Fetch posts when the component is mounted
    onMounted(fetchPosts);

    return { posts, extractTitle, removeMetadata, extractTags, renderMarkdown, getImageUrl };
  },
};
</script>

<style scoped>
.markdown-container a {
  text-decoration: none !important; /* Force no underline */
  color: inherit; /* Optional: Match surrounding text color */
}

.markdown-container a:hover {
  text-decoration: underline !important; /* Optional: Add underline on hover */
}

.blog-posts {
  padding: 20px;
}

.post {
  margin-bottom: 60px;
  /* Increased vertical spacing between posts */
}

.post:not(:last-child)::after {
  content: '';
  display: block;
  width: 100%;
  border-top: 2px solid #e0e0e0;
  /* Subtle, light grey separator */
  margin-top: 40px;
  /* Space above the separator */
  margin-bottom: 40px;
  /* Space below the separator */
}

.post-title {
  font-size: 1.2em;
  /* Adjust size as needed */
  margin: 0;
  /* Remove default margin */
}

.padding {
  height: 20px;
  /* Add vertical spacing */
}

.post-layout {
  width: 100%;
  border-collapse: collapse;
}

.post-image {
  width: 200px;
  /* Updated from 150px to 200px for desktop */
  vertical-align: top;
}

.thumbnail {
  width: 100%;
  /* Full width of the container */
  height: auto;
  /* Maintain aspect ratio */
  max-width: 200px;
  /* Updated from 150px to 200px */
}

@media (max-width: 768px) {
  .post-image {
    width: calc(100% - 20px);
    /* Full width minus padding */
    padding: 10px;
    /* Add padding around the image */
  }

  .thumbnail {
    max-width: none;
    /* Remove desktop max-width restriction */
    width: 100%;
    /* Make the image take up the full container width */
    height: auto;
    /* Maintain aspect ratio */
  }
}

.post-content {
  padding-left: 20px;
}

.post-tags {
  font-size: 0.9em; /* Reduce font size for tags */
  margin-top: 10px; /* Add some spacing above the tags */
}

.tag {
  display: inline-block; /* Ensure tags don't overlap */
  margin: 5px 5px; /* Add spacing between tags */
  padding: 5px 5px; /* Add padding inside each tag */
  background-color: #f0f0f0; /* Light background color for tags */
  border-radius: 5px; /* Rounded corners for a cleaner look */
  font-size: 0.85em; /* Adjust font size within each tag */
}

.tag a {
  text-decoration: none; /* Remove underline from tag links */
  color: #333; /* Set a neutral color for links */
}

.tag a:hover {
  color: #007bff; /* Change color on hover for better interactivity */
  text-decoration: underline; /* Optional: add underline on hover */
}


/* Responsive Design */
@media (max-width: 768px) {
  .post-layout {
    display: block;
    /* Stack rows */
  }

  .post-image,
  .post-content {
    display: block;
    width: 100%;
    padding-left: 0;
  }

  .thumbnail {
    margin-bottom: 20px;
    /* Add spacing between image and content */
  }
}
</style>