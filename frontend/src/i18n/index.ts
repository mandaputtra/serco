import { createI18n } from "vue-i18n";

import zhHans from "./locales/zh-Hans.json";
import en from "./locales/en.json";
import id from "./locales/id.json";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  legacy: false,
  messages: {
    "zh-Hans": zhHans,
    en,
    id,
  },
});

export default i18n;
