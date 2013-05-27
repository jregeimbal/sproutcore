sc_require('system/locale');

// define all supported locales.
// (this will all be done via code gen.)

SC.Locale.locales['en-us'] = SC.Locale.extend({
  _deprecatedLanguageCodes: ['English'],
  dayNames: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.w(),
  abbreviatedDayNames: 'Sun Mon Tue Wed Thu Fri Sat'.w(),
  monthNames: 'January February March April May June July August September October November December'.w(),
  abbreviatedMonthNames: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.w(),
  amDesignator: 'AM',
  pmDesignator: 'PM',
  formats: {
    shortDate: '%m/%d/%Y', // 1/22/2012
    shortDateShortTime: '%m/%d/%Y %i:%M %p', // 1/22/2012 9:24 AM
    shortTime: '%i:%M %p' // 9:24 AM
  },
  strings: {},
});

SC.Locale.locales.en = SC.Locale.locales['en-us'].extend();

SC.Locale.locales.fr = SC.Locale.extend({ strings: {}, _deprecatedLanguageCodes: ['French'] });

SC.Locale.locales.de = SC.Locale.extend({ strings: {}, _deprecatedLanguageCodes: ['German'] });

SC.Locale.locales.ja = SC.Locale.extend({ strings: {}, _deprecatedLanguageCodes: ['Japanese', 'jp'] });

SC.Locale.locales.es = SC.Locale.extend({ strings: {}, _deprecatedLanguageCodes: ['Spanish'] });

SC.Locale.locales.cs = SC.Locale.extend({ strings: {} });

SC.Locale.locales.da = SC.Locale.extend({ strings: {} });

SC.Locale.locales.et = SC.Locale.extend({ strings: {} });

SC.Locale.locales.fi = SC.Locale.extend({ strings: {} });

SC.Locale.locales.hu = SC.Locale.extend({ strings: {} });

SC.Locale.locales.id = SC.Locale.extend({ strings: {} });

SC.Locale.locales.it = SC.Locale.extend({ strings: {} });

SC.Locale.locales.ko = SC.Locale.extend({ strings: {} });

SC.Locale.locales.nl = SC.Locale.extend({ strings: {} });

SC.Locale.locales.no = SC.Locale.extend({ strings: {} });

SC.Locale.locales.pl = SC.Locale.extend({ strings: {} });

SC.Locale.locales.pt = SC.Locale.extend({ strings: {} });

SC.Locale.locales.ru = SC.Locale.extend({ strings: {} });

SC.Locale.locales.sv = SC.Locale.extend({ strings: {} });

SC.Locale.locales.tr = SC.Locale.extend({ strings: {} });

SC.Locale.locales.zh = SC.Locale.extend({ strings: {} });

SC.Locale.locales['fr-ca'] = SC.Locale.extend({ strings: {} });

SC.Locale.locales['pt-br'] = SC.Locale.extend({ strings: {} });

SC.Locale.locales['zh-cn'] = SC.Locale.extend({ strings: {} });

SC.Locale.locales['zh-tw'] = SC.Locale.extend({ strings: {} });

// reset the current locale if it's already been created
SC.Locale.currentLanguage = null;
SC.Locale.currentLocale = null;
SC.Locale.createCurrentLocale();
