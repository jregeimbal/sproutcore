// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('validators/validator') ;

/**
  Requires a valid email format.
  
  @class
  @extends SC.Validator
  @version 1.0
*/
SC.Validator.Email = SC.Validator.extend(
/** @scope SC.Validator.Email.prototype */ {
  
  regex: /.+@.+\...+/,
  
  /*
    runs the validation
  */
  validateCommit: function(value) {
    return this._validateFunction(value);
  },
  
  /* the actual validation happens here */
  _validateFunction: function(value) {
    var matcher = this.get('regex');
    var ret = value;
    if(!matcher.test(value)) {
      ret = SC.Error.create({errorValue: value, message: "Invalid Email"});
    }
    return ret;
  }
}) ;

/**
  This variant allows an empty field as well as an email address.
  
  @class
  @extends SC.Validator.Email
  @author Charles Jolley
  @version 1.0
*/
SC.Validator.EmailOrEmpty = SC.Validator.Email.extend(
/** @scope SC.Validator.EmailOrEmpty.prototype */ {
  validate: function(form, field) {
    var value = field.get('fieldValue') ; 
    return (value && value.length > 0) ? value.match(/.+@.+\...+/) : true ;
  }
}) ;
