import { DEFAULT_LOCALE } from '@/lib/constants';
import { getDateLocale, getTextDirection } from '@/lib/lang';
import enUS from '../../../public/intl/messages/en-US.json';

const messages = {
  'en-US': enUS,
};

export function useLocale() {
  const locale = DEFAULT_LOCALE;
  const dir = getTextDirection(locale);
  const dateLocale = getDateLocale(locale);

  return { locale, messages, dir, dateLocale };
}
