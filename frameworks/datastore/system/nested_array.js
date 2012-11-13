/**
 * A wrapper around an array of nested records (used in conjunction with SC.NestedArrayAttribute).
 *
 * @extends SC.Object
 * @author Evin Grano
 * @author Sean Eidemiller
 */
SC.NestedArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.NestedArray.prototype */ {
    
  /**
    If set, it is the default record recordType
  
    @property {SC.Record}
  */
  defaultRecordType: null,
  
  /**
    If set, the parent record will be notified whenever the array changes so that 
    it can change its own state
    
    @property {SC.Record}
  */
  record: null,
  
  /**
    If set will be used by the many array to get an editable version of the
    storeIds from the owner.
    
    @property {String}
  */
  propertyName: null,
  
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property {SC.Store}
  */
  store: function() {
    return this.getPath('record.store');
  }.property('record').cacheable(),
  
  /**
    The storeKey for the parent record of this many array.  Editing this 
    array will place the parent record into a READY_DIRTY state.

    @property {Number}
  */
  storeKey: function() {
    return this.getPath('record.storeKey');
  }.property('record').cacheable(),
  
  /**
    Returns the hashes in read only mode.  Avoids modifying the record unnecessarily.

    @property {SC.Array}
  */
  readOnlyHashes: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),
  
  /**
    Returns an editable array of hashes.  Marks the owner records as modified.

    @property {SC.Array}
  */
  editableHashes: function() {
    var store = this.get('store'),
      storeKey = this.get('storeKey'),
      pname = this.get('propertyName'),
      ret, hash;

    ret = store.readEditableProperty(storeKey, pname);    

    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];
    }

    if (ret !== this._prevHashes) this.recordPropertyDidChange();

    return ret;

  }.property(),
    
  /** @private
    Returned length is a pass-through to the hashes array.

    @property {Number}
  */
  length: function() {
    var hashes = this.get('readOnlyHashes');
    return hashes ? hashes.length : 0;
  }.property('readOnlyHashes'),

  /** @private
    Looks up the corresponding hash in the array and materialzes a record.

    @returns {SC.Record}
  */
  objectAt: function(idx) {
    var recs = this._records, 
      hashes = this.get('readOnlyHashes'),
      hash, ret, pname = this.get('propertyName'),
      parent = this.get('record'),
      len = hashes ? hashes.length : 0;

    if (!hashes) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    if (!recs) this._records = recs = [] ; // create cache

    // If not a good index, return undefined.
    if (idx >= len) return undefined;
    hash = hashes.objectAt(idx);
    if (!hash) return undefined;
    
    // Not in cache; materialize.
    recs[idx] = ret = parent.registerNestedRecord(hash, '%@.%@'.fmt(pname, idx));

    return ret;
  },

  /** @private
    Pass-through to the underlying array.  The passed in objects must be
    records, which can be converted to hashes.
  */
  replace: function(idx, amt, recs) {
    var hashes = this.get('editableHashes'), 
      len = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
      parent = this.get('record'),
      pname = this.get('propertyName'),
      newRecs, cr, recordType, i, limit = idx + amt;

    newRecs = this._processRecordsToHashes(recs);

    // If removing records, unregister them from the parent path cache.
    if (amt) {
      for (i = idx; i < limit; ++i) {
        parent.unregisterNestedRecord('%@.%@'.fmt(pname, i));
      }
    }

    // Rerform the replace operation on the contained array.
    hashes.replace(idx, amt, newRecs);

    // Now change the registration path for all hashes after the replace area.
    var newIndex, oldIndex, length = hashes.get('length');

    for (newIndex = idx+len; newIndex < length; ++newIndex) {
      oldIndex = newIndex - len + amt;
      parent.replaceRegisteredNestedRecordPath('%@.%@'.fmt(pname, oldIndex),'%@.%@'.fmt(pname, newIndex));
    }

    // Notify that the record did change.
    parent.recordDidChange(pname);

    return this;
  },

  _processRecordsToHashes: function(recs) {
    var store, sk;
    recs = recs || [];
    recs.forEach(function(me, idx) {
      if (me.isNestedRecord){
        store = me.get('store');
        sk = me.storeKey;
        recs[idx] = store.readDataHash(sk);
      }
    });

    return recs;
  },

  /**
    Normalizes each nested record in the array.
  */
  normalize: function() {
    this.forEach(function(record,id) {
      if (record.normalize) record.normalize();
    });
  },

  /** @private 
    Invoked whenever the hashes array changes.  Observes changes.
  */
  recordPropertyDidChange: function(keys) {
    if (keys && !keys.contains(this.get('propertyName'))) return this;

    var hashes = this.get('readOnlyHashes');
    var prev = this._prevHashes, f = this._contentDidChange;

    if (hashes === prev) return this; // nothing to do

    if (prev) prev.removeObserver('[]', this, f);
    this._prevHashes = hashes;
    if (hashes) hashes.addObserver('[]', this, f);

    var rev = (hashes) ? hashes.propertyRevision : -1 ;
    this._contentDidChange(hashes, '[]', hashes, rev);
    return this;
  },

  /**
   * Overrides unknownProperty() to allow for index-based get() calls, which allows you to do
   * things like get an instance of a nested record within a nested record array from the parent
   * record. For example...
   *
   * var child = parent.get('children.0');
   *
   * Or even more simply...
   *
   * var child = children.get('0');
   *
   * Note that you can't set() nested records this way. In other words...
   *
   * children.set('0', child);
   *
   * ...won't work.
   */
  unknownProperty: function(key, value) {
    // First check to see if this is a reduced property.
    var ret = this.reducedProperty(key, value);

    // Nope; let any superclasses/mixins have a crack at it.
    if (ret === undefined) ret = sc_super();

    // Finally, try to call objectAt().
    if (ret === undefined && !SC.empty(key)) {
      var index = parseInt(key, 0);
      if (SC.typeOf(index) === SC.T_NUMBER) ret = this.objectAt(index);
    }

    return ret;
  },

  /** @private
    Invoked whenever the content of the array changes.  This will dump any
    cached record lookup and then notify that the enumerable content hash
    changed.
  */
  _contentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache
    this.enumerableContentDidChange();
  },
  
  /** @private */
  init: function() {
    sc_super();
    this.recordPropertyDidChange();
  }
});

