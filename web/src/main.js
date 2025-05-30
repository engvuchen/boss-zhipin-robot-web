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
    NButtonGroup,
    NSwitch,
    NSlider,
    NCard,
    NMessageProvider,
    NForm,
    NFormItem,
    NConfigProvider,
    NModal,
    NDataTable,
    NPopover,
    NIcon,
} from 'naive-ui';

const naive = create({
    components: [
        NInput,
        NDynamicInput,
        NInputNumber,
        NSelect,
        NButton,
        NButtonGroup,
        NSwitch,
        NSlider,
        NCard,
        NMessageProvider,
        NForm,
        NFormItem,
        NConfigProvider,
        NModal,
        NDataTable,
        NPopover,
        NIcon,
    ],
});

const app = createApp(App);
app.use(naive);
app.mount('#app');
