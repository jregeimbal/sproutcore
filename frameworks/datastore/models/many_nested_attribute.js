sc_require('models/record');
sc_require('models/record_attribute');

SC.ManyNestedAttribute = SC.RecordAttribute.extend({
  
  isManyNestedAttribute: YES,
  
  typeKey: null,
  
  toType: function(record, key, value) {
    var ret;

    console.log('%@.toType(record: %@, key: %@, value: %@)'.fmt(this, record, key, value));
    
    return ret;
  },
  
  fromType: function(record, key, value) {
    var ret;

    console.log('%@.fromType(record: %@, key: %@, value: %@)'.fmt(this, record, key, value));

    return ret;
  }
  
});
