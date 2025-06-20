import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
	.use(initReactI18next)
	.use({
		type: 'backend',
		init: () => {},
		read: async (language: string, namespace: string, callback: any) => {
			callback(
				null,
				await (
					await fetch(
						`/locales/${language}/${namespace}.json?${import.meta.env.VITE_APP_VERSION}`,
					)
				).json(),
			);
		},
	})
	.init({
		lng: 'vi', // mặc định
		fallbackLng: 'en',
		ns: ['common'],
		defaultNS: 'common',
	});

export default i18n;
