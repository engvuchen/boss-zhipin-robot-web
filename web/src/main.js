import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import {
  // create naive ui
  create,
  // component
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NMessageProvider,
  NForm,
  NFormItem,
} from 'naive-ui';

const naive = create({
  components: [NButton, NInput, NInputNumber, NSelect, NMessageProvider, NForm, NFormItem],
});

const app = createApp(App);
app.use(naive);
app.mount('#app');
