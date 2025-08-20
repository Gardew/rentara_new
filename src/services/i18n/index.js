import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
	en: {
		translation: {
			// ... existing code ...
		}
	},
	cs: {
		translation: {
			// ... existing code ...
		}
	}
};

// Load resources dynamically to keep file small
async function loadLocale(locale) {
	try {
		const data = await import(`./locales/${locale}.json`);
		return data.default || data;
	} catch (e) {
		return {};
	}
}

export async function initI18n() {
	const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
	const lng = stored || 'en';

	const [en, cs] = await Promise.all([loadLocale('en'), loadLocale('cs')]);

	i18n
		.use(initReactI18next)
		.init({
			resources: {
				en: { translation: en },
				cs: { translation: cs },
			},
			lng,
			fallbackLng: 'en',
			interpolation: { escapeValue: false },
		});

	return i18n;
}

export default i18n; 