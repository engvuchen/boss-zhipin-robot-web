<template>
    <n-config-provider :theme="theme">
        <n-card style="height: 100vh">
            <div class="main">
                <h2 class="title">BOSS直聘自动打招呼</h2>
                <n-message-provider>
                    <Main />
                </n-message-provider>
            </div>
        </n-card>
    </n-config-provider>
</template>

<script setup>
import { computed } from 'vue';
import { useOsTheme, darkTheme } from 'naive-ui';
import Main from './components/Main.vue';

const osThemeRef = useOsTheme();
const theme = computed(() => (osThemeRef.value === 'dark' ? darkTheme : null));
</script>

<style scoped>
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
}
.main {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 3rem;
}
.title {
    font-weight: 500;
    margin: 0 0 2rem 0;
    color: #4e9e5f;
}
</style>
