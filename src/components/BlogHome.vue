<template>
  <div class="p-6 bg-blue-200 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-blue-900 mb-4">Tailwind Test</h1>
    <p class="text-gray-700 mb-4">
      This text is styled with Tailwind classes.
    </p>
    <div class="my-box">
      This box is styled with scoped CSS.
    </div>
  </div>
</template>

<script>
export default {
  name: "BlogHome",
};
</script>

<style scoped>
.my-box {
  background-color: white;
  border: 2px solid red;
  padding: 1rem;
  border-radius: 0.5rem;
}
</style>
