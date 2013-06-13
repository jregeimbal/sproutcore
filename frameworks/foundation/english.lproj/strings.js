// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');
// FIXME: [JS][CC][AD][I18N] we need to deal with these in a multi-language manner without the need to add every
// language to sproutcore.  this was "English", but the locale for E10 is now en-us
SC.stringsFor('en-us', {
  '_SC.DateTime.dayNames': 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday',
  '_SC.DateTime.abbreviatedDayNames': 'Sun Mon Tue Wed Thu Fri Sat',
  '_SC.DateTime.monthNames': 'January February March April May June July August September October November December',
  '_SC.DateTime.abbreviatedMonthNames': 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'
}) ;
