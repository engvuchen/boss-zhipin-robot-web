<script setup>
import Main from './components/Main.vue';
</script>

<template>
  <div class="main">
    <h2 class="title">BOSS直聘自动打招呼</h2>
    <n-message-provider>
      <Main />
    </n-message-provider>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  box-sizing: border-box;
  padding-top: 3rem;
}
.title {
  font-weight: 500;
  margin-bottom: 2rem;
  color: #4e9e5f;
}
</style>
