sc_require('models/record');
sc_require('models/record_attribute');

/**
 * A subclass of RecordAttribute that handles one-to-ONE relationships between parent records and
 * nested records.
 *
 * You define the relationship in a model as follows:
 *
 * {{{
 *   nestedRecord: SC.Record.toOne('SC.NestedModel', { isNested: YES });
 * }}}
 *
 * @extends SC.RecordAttribute
 * @author Evin Grano
 * @author Sean Eidemiller
 */
SC.NestedAttribute = SC.RecordAttribute.extend(/** @scope SC.NestedAttribute.prototype */ {

  isNestedRecordTransform: YES,

  /**
   * Transforms an attribute hash to an instance of a nested record on behalf of a get() call on
   * the parent record.
   *
   * @param {SC.Record} record The parent record.
   * @param {String} key The name of the attribute on the parent record.
   * @param {Hash} value The hash of attributes with which to create the nested record.
   *
   * @returns {SC.Record} The nested record.
   */
  toType: function(record, key, value) {
    var ret = null, rel, recordType = this.get('typeClass');

    if (!record) {
      throw 'SC.NestedAttribute: Error during transform: Unable to retrieve parent record.';
    }

    if (!SC.none(value)) ret = record.registerNestedRecord(value, key);

    return ret;
  },

  /**
   * Transforms an attribute hash to an instance of a nested record on behalf of a set() call on
   * the parent record.
   *
   * @param {SC.Record} record The parent record.
   * @param {String} key The name of the attribute on the parent record.
   * @param {Hash} value The hash of attributes with which to create the nested record.
   *
   * @returns {SC.Record} The nested record.
   */
  fromType: function(record, key, value) {
    var sk, store, ret;

    if (record) {
      // Unregister the old nested record.
      if (record.readAttribute(key)) {
        record.unregisterNestedRecord(key);
      } 

      if (SC.none(value)) {
        // Handle null value.
        record.writeAttribute(key, value);
        ret = value;
      } else {
        // Register the nested record with this record (the parent).
        ret = record.registerNestedRecord(value, key);

        if (ret) {
          // Write the data hash of the nested record to the store.
          sk = ret.get('storeKey');
          store = ret.get('store');
          record.writeAttribute(key, store.readDataHash(sk));
        } else if (value) {
          // If registration failed, just write the value.
          record.writeAttribute(key, value);
        }
      }
    }

    return ret;
  },
 
  /**
   * The core handler; called from the property.
   *
   * @param {SC.Record} record The parent record.
   * @param {String} key The name of the attribute on the parent record.
   * @param {Hash} value The hash of attributes with which to create the nested record.
   *
   * @returns {SC.Record} The nested record.
   */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key;

    if (value !== undefined) {
      // Set the nested record on the parent.
      value = this.fromType(record, key, value);
    } else {
      // Get the nested record from the parent.
      value = record.readAttribute(attrKey);

      if (SC.none(value) && (value = this.get('defaultValue'))) {
        if (typeof value === SC.T_FUNCTION) {
          value = this.defaultValue(record, key, this);

          // Write default value so it doesn't have to be executed again.
          if (record.attributes()) record.writeAttribute(attrKey, value, true);
        }

      } else value = this.toType(record, key, value);
    }

    return value;
  }
});

