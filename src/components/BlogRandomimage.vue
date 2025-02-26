<template>
  <div>
    <div class="image-container">
      <!-- Resized image -->
      <img :src="imageUrl" alt="Random Image" class="thumbnail" @click="showOverlay = true" />

      <!-- Display the selected date -->
      <p class="selected-date">This picture was taken on {{ selectedDate }}
        <a href="#" class="refresh-link" @click.prevent="generateNewImage">(refresh)</a>
      </p>
    </div>

    <!-- Display analysis results or loading indicator -->
    <div class="azure-eye">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Analyzing image...</p>
      </div>
      <div v-else-if="azResult" class="analysis-results">
        <h3>Analysis Results</h3>
        <p><strong>Description:</strong> {{ azResult.description }}</p>
        <p><strong>Tags:</strong> {{ azResult.tags.join(', ') }}</p>
        <div v-if="azResult.objects.length > 0">
          <p><strong>Objects:</strong></p>
          <ul>
            <li v-for="obj in azResult.objects" :key="obj.object">{{ obj.object }} (confidence: {{ obj.confidence }})
            </li>
          </ul>
        </div>
        <div v-if="azResult.faces.length > 0">
          <p><strong>Faces:</strong></p>
          <ul>
            <li v-for="(face, index) in azResult.faces" :key="index">Face detected at {{ face.faceRectangle.left }}, {{
              face.faceRectangle.top }} (width: {{ face.faceRectangle.width }}, height: {{ face.faceRectangle.height }})
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Full-size overlay -->
    <div v-if="showOverlay" class="overlay">
      <!-- Close button -->
      <button class="close-button" @click="showOverlay = false">✖</button>

      <!-- Full-size image -->
      <img :src="imageUrl" alt="Full Size Image" class="full-image" />
    </div>
  </div>
</template>

<script>
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { FaceClient } from '@azure/cognitiveservices-face';
import { ApiKeyCredentials } from '@azure/ms-rest-js';
import EXIF from 'exif-js';


// Computer Vision credentials
const azkey = '8egnbOy4cmBKTtVWFlKFz0Nsj5c4muen0DmiZYA075AV802X7QJUJQQJ99ALACi5YpzXJ3w3AAAFACOG9cDi';
const endpoint = 'https://blogt-eye.cognitiveservices.azure.com/';

// Face API credentials
const faceKey = '33PxLl50btDRbU99fdJwBpdNJpVzIMxhd48B9NQRDI9QJObxjWzPJQQJ99ALACi5YpzXJ3w3AAAKACOGvSJF';
const faceEndpoint = 'https://blogt-faces.cognitiveservices.azure.com/';

export default {
  name: 'BlogRandomImage',
  data() {
    return {
      imageUrl: null,
      selectedDate: "", // Holds the formatted selected date
      showOverlay: false, // Controls the visibility of the overlay
      computerVisionClient: null,
      faceClient: null,
      azResult: null, // Holds the analysis result
      loading: false  // Controls the loading state
    }
  },
  mounted() {
    this.computerVisionClient = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': azkey } }),
      endpoint
    );
    this.faceClient = new FaceClient(
      new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': faceKey } }),
      faceEndpoint
    );

    const randomDate = this.generateRandomDate(
      new Date(2010, 2, 11), // Start date: March 11, 2010
      new Date(), // End date: Today
    )
    const formattedDate = this.formatDate(randomDate)
    this.imageUrl = `https://objects.hbvu.su/blotpix/${formattedDate.year}/${formattedDate.month}/${formattedDate.day}.jpeg`
    this.selectedDate = this.formatDateReadable(randomDate); // Format for display

    // Analyze the image when it's loaded
    this.analyzeImage();
  },
  methods: {
    generateRandomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return { year, month, day }
    },
    formatDateReadable(date) {
      const day = date.getDate();
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const year = date.getFullYear();
      return `${day}${this.getOrdinalSuffix(day)} of ${month}, ${year}`;
    },
    getOrdinalSuffix(day) {
      if (day % 10 === 1 && day !== 11) return 'st';
      if (day % 10 === 2 && day !== 12) return 'nd';
      if (day % 10 === 3 && day !== 13) return 'rd';
      return 'th';
    },
    generateNewImage() {
      const randomDate = this.generateRandomDate(
        new Date(2010, 2, 11), // Start date: March 11, 2010
        new Date() // End date: Today
      );
      const formattedDate = this.formatDate(randomDate);
      this.imageUrl = `https://objects.hbvu.su/blotpix/${formattedDate.year}/${formattedDate.month}/${formattedDate.day}.jpeg`;
      this.selectedDate = this.formatDateReadable(randomDate); // Update displayed date

      // Reset result and analyze the new image
      this.azResult = null;
      this.analyzeImage();
    },

    /*
    async analyzeImage() {
      // Set loading state to true before starting analysis
      this.loading = true;

      try {
        // Analyze image features
        const features = ['Description', 'Tags', 'Objects'];
        const azResult = await this.computerVisionClient.analyzeImage(this.imageUrl, { visualFeatures: features });

        // Use the read API for text extraction
        const textResult = await this.computerVisionClient.read(this.imageUrl);
        const operationId = textResult.operationLocation.split('/').pop();

        let readResults;
        let status;
        // Polling the read result until it's done
        do {
          readResults = await this.computerVisionClient.getReadResult(operationId);
          status = readResults.status;
          if (status === 'notStarted' || status === 'running') {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } while (status === 'notStarted' || status === 'running');

        // Extract text content
        if (status === 'succeeded') {
          azResult.extractedText = readResults.analyzeResult.readResults
            .flatMap(page => page.lines)
            .map(line => line.text)
            .join(' ');
        }

        // Analyze faces using the Face API client
        const faceResults = await this.faceClient.face.detectWithUrl(this.imageUrl, {
          returnFaceId: false,
          returnFaceLandmarks: false,
          recognitionModel: 'recognition_01',
          detectionModel: 'detection_01'
        });

        azResult.faces = faceResults.map(face => ({
          faceRectangle: face.faceRectangle
        }));

        // Save the analysis result to display in the template
        this.azResult = {
          description: azResult.description.captions.map(caption => caption.text).join(', '),
          tags: azResult.tags.map(tag => tag.name),
          objects: azResult.objects,
          faces: azResult.faces
        };
      } catch (error) {
        console.error('Error:', error);
      } finally {
        // Set loading state to false after analysis completes (whether successful or not)
        this.loading = false;
      }
    },
    */
    async analyzeImage() {
        // Set loading state to true before starting analysis
        this.loading = true;
        console.log('ANALYZING IMAGE from this.imageUrl');

        try {
          // Create an image element to load the image
          const img = new Image();

          // Create a promise to handle image loading
          const imageLoaded = new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
          });

          // Set the image source to your URL
          img.src = this.imageUrl;
          img.crossOrigin = 'Anonymous'; // This might be needed for CORS issues

          // Wait for the image to load
          await imageLoaded;

          // Extract EXIF data
          EXIF.getData(img, () => {
            const exif = EXIF.getAllTags(img);
            console.log(exif);

            // Process your EXIF data here
            this.exifData = exif;

            // Set loading to false when done
            this.loading = false;
          });
        } catch (error) {
          console.error('Error analyzing image:', error);
          this.loading = false;
        }
    },
  },
}
</script>

<style scoped>
.image-container {
  position: relative;
  width: 100%;
  /* Ensure container takes full width */
  max-width: 500px;
  /* Limit max width on larger screens */
  margin: auto;
  /* Center the container */
}

.azure-eye {
  position: relative;
  width: 100%;
  /* Ensure container takes full width */
  max-width: 500px;
  /* Limit max width on larger screens */
  margin: auto;
  /* Center the container */
  min-height: 100px;
  /* Ensure minimum height for the loading indicator */
  padding: 15px;
}

.thumbnail {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  /* Maintain square aspect ratio */
  object-fit: cover;
  cursor: pointer;
  border: rgba(0, 0, 0, 0.8) 1px solid;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.full-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  /* Ensure image scales nicely within overlay */
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  font-weight: bold;
  color: black;
  cursor: pointer;
}

.close-button:hover {
  background-color: #f5f5f5;
}

.selected-date {
  font-size: 16px;
  color: #333;
  margin-top: 10px;
  text-align: center;
}

.refresh-link {
  margin-left: 10px;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

.refresh-link:hover {
  text-decoration: underline;
}

/* Loading indicator styles */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #007bff;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-text {
  font-size: 16px;
  color: #666;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .selected-date {
    font-size: 14px;
  }

  .close-button {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .loading-spinner {
    width: 30px;
    height: 30px;
  }

  .loading-text {
    font-size: 14px;
  }
}
</style>
