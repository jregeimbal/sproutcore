sc_require('models/record');
sc_require('models/record_attribute');
sc_require('models/nested_attribute');

/**
 * A subclass of RecordAttribute that handles one-to-MANY relationships between parent records and
 * nested records.
 *
 * You define the relationship in a model as follows:
 *
 * {{{
 *   nestedRecords: SC.Record.toMany('SC.NestedModel', { isNested: YES });
 * }}}
 *
 * @extends SC.NestedAttribute
 * @author Evin Grano
 * @author Sean Eidemiller
 */
SC.NestedArrayAttribute = SC.NestedAttribute.extend(
  /** @scope SC.NestedArrayAttribute.prototype */ {

  /**
   * Returns an SC.NestedArray on behalf of the get() call.
   *
   * @param {SC.Record} record The parent record.
   * @param {String} key The name of the attribute on the parent record.
   *
   * @returns {SC.NestedArray} The array of nested records.
   */
  toType: function(record, key) {
    var attrKey = this.get('key') || key,
      arrayKey = SC.keyFor('__nestedArray__', SC.guidFor(this)),
      ret = record[arrayKey],
      recordType = this.get('typeClass'), rel;

    // Lazily create the NestedArray and then cache it.
    if (!ret) {
      ret = SC.NestedArray.create({ 
        record: record,
        propertyName: attrKey,
        defaultRecordType: recordType
      });

      // Cache the array on the parent record.
      record[arrayKey] = ret;

      // Add to the relationships structure.
      rel = record.get('relationships');
      if (!rel) record.set('relationships', rel = []);
      rel.push(ret);
    }

    return ret;
  },

  /**
   * Returns an SC.NestedArray on behalf of the set() call.
   *
   * @param {SC.Record} record The parent record.
   * @param {String} key The name of the attribute on the parent record.
   * @param {Array} value The array of nested record hashes.
   *
   * @returns {SC.NestedArray} The array of nested records.
   */ 
  fromType: function(record, key, value) {
    var sk, store, 
      arrayKey = SC.keyFor('__nestedArray__', SC.guidFor(this)),
      ret = record[arrayKey];

    if (record) {
      record.writeAttribute(key, value);
      if (ret) ret = ret.recordPropertyDidChange();
    }

    return ret;
  }
});

