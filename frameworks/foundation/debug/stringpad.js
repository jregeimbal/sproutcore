SC.StringPad = {

  _t13yPad: function(value) {
    if (!value) value = "";
    value = value;
    var len = value.length;
    var i;
    for (i = 0; i <= len / 8; ++i) {
      value = value + "X";
    }
    value = value.replace(/%@/g, "|%@|");
    // value = value.replace(/\n/g, "\\\n");
    // value = value.replace(/"/g, "\\\"");
    value = "[X" + value + "]";
    // value = '"' + value + '"';
    return value; 
  },
  
  /**
    Localizes the string.  This will look up the reciever string as a key 
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.
    
    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
  
  loc: function() {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    if(!SC.Locale.currentLocale) SC.Locale.createCurrentLocale();
    var str = SC.Locale.currentLocale.locWithDefault(this);
    if (SC.typeOf(str) !== SC.T_STRING) str = '#' + this;// identify strings not translated by leading #
    else str = this._t13yPad(str);
    return str.fmt.apply(str,arguments) ;
  },

  /**
    Works just like loc() except that it will return the passed default 
    string if a matching key is not found.
    
    @param {String} def the default to return
    @param {Object...} args optional formatting arguments
    @returns {String} localized and formatted string
  */
  locWithDefault: function(def) {
    if(!SC.Locale.currentLocale) SC.Locale.createCurrentLocale();
    var str = SC.Locale.currentLocale.locWithDefault(this, def);
    if (SC.typeOf(str) !== SC.T_STRING) str = '#' + this;// identify strings not translated by leading #
    str = this._t13yPad(str);
    var args = SC.$A(arguments); args.shift(); // remove def param
    return str.fmt.apply(str,args) ;
  }
};

// Apply SC.StringPad mixin to built-in String object
// HACK: [JS] SC.supplement didn't work here :(
String.prototype.loc = SC.StringPad.loc;
String.prototype.locWithDefault = SC.StringPad.locWithDefault;
String.prototype._t13yPad = SC.StringPad._t13yPad;

