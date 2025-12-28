// Country list for the signup dropdown.
// Uses ISO 3166-1 alpha-2 codes via i18n-iso-countries (keeps this list complete and maintained).
import isoCountries from 'i18n-iso-countries';
import { getCountryCallingCode } from 'libphonenumber-js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import enLocale from 'i18n-iso-countries/langs/en.json';

isoCountries.registerLocale(enLocale);

export const countries = Object.entries(isoCountries.getNames('en', { select: 'official' }))
  .map(([code, name]) => {
    let dialCode = '';
    try {
      dialCode = `+${getCountryCallingCode(code)}`;
    } catch {
      dialCode = '';
    }
    return { code, name, dialCode };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const getCountryByCode = (code) => {
  return countries.find(country => country.code === code);
};

export const getCountryByName = (name) => {
  return countries.find(country => country.name === name);
};
