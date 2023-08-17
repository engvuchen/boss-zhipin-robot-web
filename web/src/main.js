import { createApp } from 'vue';
import App from './App.vue';
import {
  // create naive ui
  create,
  // component
  NInput,
  NDynamicInput,
  NInputNumber,
  NSelect,
  NButton,
  NSwitch,
  NSlider,
  NCard,
  NMessageProvider,
  NForm,
  NFormItem,
  NConfigProvider,
} from 'naive-ui';

const naive = create({
  components: [
    NInput,
    NDynamicInput,
    NInputNumber,
    NSelect,
    NButton,
    NSwitch,
    NSlider,
    NCard,
    NMessageProvider,
    NForm,
    NFormItem,
    NConfigProvider,
  ],
});

const app = createApp(App);
app.use(naive);
app.mount('#app');
