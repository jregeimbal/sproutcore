// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/store');

/**
  @class

  A nested store can buffer changes to a parent store and then commit them
  all at once.  You usually will use a NestedStore as part of store chaining
  to stage changes to your object graph before sharing them with the rest of
  the application.
  
  Normally you will not create a nested store directly.  Instead, you can 
  retrieve a nested store by using the chain() method.  When you are finished
  working with the nested store, destroy() will dispose of it.
  
  @extends SC.Store
  @since SproutCore 1.0
*/
SC.NestedStore = SC.Store.extend(
/** @scope SC.NestedStore.prototype */ {

  /**
    This is set to YES when there are changes that have not been committed 
    yet.

    @property {Boolean}
    @default NO
  */
  hasChanges: NO,

  /**
    The parent store this nested store is chained to.  Nested stores must have
    a parent store in order to function properly.  Normally, you create a 
    nested store using the SC.Store#chain() method and this property will be
    set for you.
    
    @property {SC.Store}
  */
  parentStore: null,

  /**
    YES if the view is nested. Walk like a duck
    
    @property {Boolean}
  */
  isNested: YES,

  /**
    If YES, then the attribute hash state will be locked when you first 
    read the data hash or status.  This means that if you retrieve a record
    then change the record in the parent store, the changes will not be 
    visible to your nested store until you commit or discard changes.
    
    If NO, then the attribute hash will lock only when you write data.
    
    Normally you want to lock your attribute hash the first time you read it.
    This will make your nested store behave most consistently.  However, if
    you are using multiple sibling nested stores at one time, you may want
    to turn off this property so that changes from one store will be reflected
    in the other one immediately.  In this case you will be responsible for
    ensuring that the sibling stores do not edit the same part of the object
    graph at the same time.
    
    @property {Boolean} 
  */
  lockOnRead: YES,

  /** @private
    Array contains the base revision for an attribute hash when it was first
    cloned from the parent store.  If the attribute hash is edited and 
    commited, the commit will fail if the parent attributes hash has been 
    edited since.
    
    This is a form of optimistic locking, hence the name.
    
    Each store gets its own array of locks, which are selectively populated
    as needed.
    
    Note that this is kept as an array because it will be stored as a dense 
    array on some browsers, making it faster.
    
    @property {Array}
  */
  locks: null,

  /** @private
    An array that includes the store keys that have changed since the store
    was last committed.  This array is used to sync data hash changes between
    chained stores.  For a log changes that may actually be committed back to
    the server see the changelog property.
    
    @property {SC.Set}
  */
  chainedChanges: null,
    
  // ..........................................................
  // STORE CHAINING
  // 
  
  /**
    find() cannot accept REMOTE queries in a nested store.  This override will
    verify that condition for you.  See SC.Store#find() for info on using this
    method.
    
    @returns {SC.Record|SC.RecordArray}
  */
  find: function(query) {
    if (query && query.isQuery && query.get('location') !== SC.Query.LOCAL) {
      throw "SC.Store#find() can only accept LOCAL queries in nested stores";
    }
    return sc_super();
  },
  
  /**
    Propagate this store's changes to its parent.  If the store does not 
    have a parent, this has no effect other than to clear the change set.

    @param {Boolean} force if YES, does not check for conflicts first
    @returns {SC.Store} receiver
  */
  commitChanges: function(force) {
    if (this.get('hasChanges')) {
      var pstore = this.get('parentStore');
      pstore.commitChangesFromNestedStore(this, this.chainedChanges, force);
    }

    // clear out custom changes - even if there is nothing to commit.
    this.reset();
    return this ;
  },

  /**
    Discard the changes made to this store and reset the various data structures.
    
    @returns {SC.Store} receiver
  */
  discardChanges: function() {
    // Any locked records whose rev or lock rev differs from parent need to be notified.
    var records, locks;

    if ((records = this.records) && (locks = this.locks)) {
      var pstore = this.get('parentStore'), psRevisions = pstore.revisions;
      var revisions = this.revisions, storeKey, lock, rev;

      for (storeKey in records) {
        if (!records.hasOwnProperty(storeKey)) continue ;
        if (!(lock = locks[storeKey])) continue; // not locked.

        rev = psRevisions[storeKey];
        if ((rev !== lock) || (revisions[storeKey] > rev)) {
          this._notifyRecordPropertyChange(parseInt(storeKey, 10));
        }
      }
    }
 
    // We need a runloop around these calls to ensure that everything is shored up before the
    // enclosing runloop completes (can potentially cause nested store conflicts and internal
    // inconsistency errors without this).
    SC.RunLoop.begin();
    this.reset();
    this.flush();
    SC.RunLoop.end();

    return this;
  },
  
  /**
    When you are finished working with a chained store, call this method to 
    tear it down.  This will also discard any pending changes.
    
    @returns {SC.Store} receiver
  */
  destroy: function() {
    this.discardChanges();
    
    var parentStore = this.get('parentStore');
    if (parentStore) parentStore.willDestroyNestedStore(this);
    
    sc_super();  
    return this ;
  },

  /**
    Resets a store's data hash contents to match its parent.
    
    @returns {SC.Store} receiver
  */
  reset: function() {
    // Make sure there *is* a parent store (would be weird if there wasn't).
    var parentStore = this.get('parentStore');
    if (!parentStore) throw SC.Store.NO_PARENT_STORE_ERROR;

    // Inherit data hashes, revs and statuses via beget().
    this.dataHashes = SC.beget(parentStore.dataHashes);
    this.revisions = SC.beget(parentStore.revisions);
    this.statuses = SC.beget(parentStore.statuses);

    // Clone (deep) the child record and parent record mappings.
    this.childRecords = parentStore.childRecords ? SC.copy(parentStore.childRecords, YES) : {};
    this.parentRecords = parentStore.parentRecords ? SC.copy(parentStore.parentRecords, YES) : {};

    // Reset private temporary objects
    this.chainedChanges = this.locks = this.editables = null;
    this.changelog = null ;

    // TODO: Notify record instances.
    // NOTE: [SE] I don't think that's necessary, actually.
 
    this.set('hasChanges', NO);
  },
 
  /** @private
  
    Chain to parentstore
  */
  refreshQuery: function(query) {
    var parentStore = this.get('parentStore');
    if (parentStore) parentStore.refreshQuery(query);
    return this ;      
  },

  /**
    Returns the SC.Error object associated with a specific record.

    Delegates the call to the parent store.

    @param {Number} storeKey The store key of the record.
 
    @returns {SC.Error} SC.Error or null if no error associated with the record.
  */
  readError: function(storeKey) {
    var parentStore = this.get('parentStore');
    return parentStore ? parentStore.readError(storeKey) : null;
  },

  /**
    Returns the SC.Error object associated with a specific query.

    Delegates the call to the parent store.

    @param {SC.Query} query The SC.Query with which the error is associated.
 
    @returns {SC.Error} SC.Error or null if no error associated with the query.
  */
  readQueryError: function(query) {
    var parentStore = this.get('parentStore');
    return parentStore ? parentStore.readQueryError(query) : null;
  },
  
  // ..........................................................
  // CORE ATTRIBUTE API
  // 
  // The methods in this layer work on data hashes in the store.  They do not
  // perform any changes that can impact records.  Usually you will not need 
  // to use these methods.
  
  /**
    Returns the current edit status of a storekey.  May be one of INHERITED,
    and LOCKED.  Used mostly for unit testing.
    
    @param {Number} storeKey the store key
    @returns {Number} edit status
  */
  storeKeyEditState: function(storeKey) {
    var editables = this.editables, locks = this.locks;
    return (editables && editables[storeKey]) ? SC.Store.LOCKED : SC.Store.INHERITED ;
  },
   
  /*
   * Locks the data hash for the given store key so that it iterates independently from the parent
   * store.
   */
  _lock: function(storeKey) {
    var locks = this.locks, rev, editables;

    // If this isn't a top-level parent, get the key of the top-level parent and lock THAT instead.
    if (!this._isTopLevelParent(storeKey)) {
      return this._lock(this._getTopLevelParentKey(storeKey));
    }

    // If already locked, nothing to do.
    if (locks && locks[storeKey]) return this;

    // Create the locks array if needed.
    if (!locks) locks = this.locks = [];

    // Clone the hash from the parent store.
    var pstore = this.get('parentStore'), editState;
    if (!pstore) return this;

    this.dataHashes[storeKey] = SC.clone(pstore.dataHashes[storeKey], YES);
    editables = this.editables;
    if (!editables) editables = this.editables = [];
    editables[storeKey] = 1;
 
    // Also copy the status and revision entries for this store key.
    this.statuses[storeKey] = this.statuses[storeKey];
    rev = this.revisions[storeKey] = this.revisions[storeKey];

    // Set the lock revision.
    locks[storeKey] = rev || 1;    

    // Connect the child hashes in the dataHashes array (shared mem).
    this._connectChildren(storeKey);
 
    return this;
  },

  /*
   * Returns YES if the given key corresponds to a top-level parent record.
   */
  _isTopLevelParent: function(storeKey) {
    return (!this.childRecords || !this.childRecords[storeKey]);
  },

  /*
   * Returns the store key of the top-level parent of the record corresponding to the given store
   * key (yes, that was long-winded).
   */
  _getTopLevelParentKey: function(storeKey) {
    var parentKey = this.childRecords ? this.childRecords[storeKey] : null;

    if (!parentKey) {
      return storeKey;
    } else {
      return this._getTopLevelParentKey(parentKey);
    }
  },

  /*
   * Connects the children of the record corresponding to the given store key in the dataHashes
   * array (creates the shared memory connections).
   */
  _connectChildren: function(storeKey) {
    var children = this.parentRecords ? this.parentRecords[storeKey] : null;
    if (SC.typeOf(children) !== SC.T_HASH) return;

    var childKey, childPath, tokens, idx, parentHash, array, hash, rev;

    // Loop through all of the children and connect the memory in the dataHashes array.
    for (childKey in children) { 
      if (!children.hasOwnProperty(childKey)) continue;

      childKey *= 1;

      childPath = children[childKey];
      if (SC.empty(childPath)) continue;

      tokens = childPath.split('.');
      if (SC.typeOf(tokens) !== SC.T_ARRAY) continue;

      parentHash = this.dataHashes[storeKey];
      if (SC.typeOf(parentHash) !== SC.T_HASH) continue;

      if (tokens.length > 1) {
        array = parentHash[tokens[0]];
        idx = tokens[1] * 1;

        if (SC.typeOf(array) !== SC.T_ARRAY) continue;
        if (SC.typeOf(idx) !== SC.T_NUMBER) continue;

        this.dataHashes[childKey] = array[idx];

      } else {
        hash = parentHash[tokens[0]];
        if (SC.typeOf(hash) !== SC.T_HASH) continue;

        this.dataHashes[childKey] = hash;
      }

      // Set the various locking/status constructs.
      this.editables[childKey] = 1;
      this.statuses[childKey] = this.statuses[childKey];
      rev = this.revisions[childKey] = this.revisions[childKey];
      this.locks[childKey] = rev || 1;

      // Keep recursing downward.
      this._connectChildren(childKey);
    }
  },
  
  /** @private - adds chaining support */
  readDataHash: function(storeKey) {
    if (this.get('lockOnRead')) this._lock(storeKey);
    return this.dataHashes[storeKey];
  },
  
  /** @private - adds chaining support */
  readEditableDataHash: function(storeKey) {

    // lock the data hash if needed
    this._lock(storeKey);
    
    return sc_super();
  },

  /**
   * An implementation of writeDataHash() specific to nested stores (addressed locking issues).
   */
  writeDataHash: function(storeKey, hash, status) {
    var locks = this.locks, rev;

    // Lock if needed and set the revision.
    this._lock(storeKey);

    rev = this.revisions[storeKey] = this.revisions[storeKey]; // copy ref
    if (!locks) locks = this.locks = [];
    if (!locks[storeKey]) locks[storeKey] = rev || 1;

    // Let the implementation in SC.Store take over.
    return sc_super();
  },

  /** @private - adds chaining support */
  removeDataHash: function(storeKey, status) {
    
    // record optimistic lock revision
    var locks = this.locks;
    if (!locks) locks = this.locks = [];
    if (!locks[storeKey]) locks[storeKey] = this.revisions[storeKey] || 1;

    return sc_super();
  },
  
  /** @private - book-keeping for a single data hash. */
  dataHashDidChange: function(storeKeys, rev, statusOnly, key) {
    
    // update the revision for storeKey.  Use generateStoreKey() because that
    // gaurantees a universally (to this store hierarchy anyway) unique 
    // key value.
    if (!rev) rev = SC.Store.generateStoreKey();
    var isArray, len, idx, storeKey;
    
    isArray = SC.typeOf(storeKeys) === SC.T_ARRAY;
    if (isArray) {
      len = storeKeys.length;
    } else {
      len = 1;
      storeKey = storeKeys;
    }

    var changes = this.chainedChanges;
    if (!changes) changes = this.chainedChanges = SC.Set.create();
    
    for(idx=0;idx<len;idx++) {
      if (isArray) storeKey = storeKeys[idx];
      this._lock(storeKey);
      this.revisions[storeKey] = rev;
      changes.add(storeKey);
      this._notifyRecordPropertyChange(storeKey, statusOnly, key);
    }

    this.setIfChanged('hasChanges', YES);
    return this ;
  },

  // ..........................................................
  // SYNCING CHANGES
  // 
  
  /** @private - adapt for nested store */
  commitChangesFromNestedStore: function(nestedStore, changes, force) {

    sc_super();
    
    // save a lock for each store key if it does not have one already
    // also add each storeKey to my own changes set.
    var pstore = this.get('parentStore'), psRevisions = pstore.revisions, i;
    var myLocks = this.locks, myChanges = this.chainedChanges,len,storeKey;
    if (!myLocks) myLocks = this.locks = [];
    if (!myChanges) myChanges = this.chainedChanges = SC.Set.create();

    len = changes.length ;
    for(i=0;i<len;i++) {
      storeKey = changes[i];
      if (!myLocks[storeKey]) myLocks[storeKey] = psRevisions[storeKey]||1;
      myChanges.add(storeKey);
    }
    
    // Finally, mark store as dirty if we have changes
    this.setIfChanged('hasChanges', myChanges.get('length')>0);
    this.flush();
    
    return this ;
  },

  // ..........................................................
  // HIGH-LEVEL RECORD API
  // 
  
  
  /** @private - adapt for nested store */
  queryFor: function(recordType, conditions, params) {
    return this.get('parentStore').queryFor(recordType, conditions, params);
  },
  
  /** @private - adapt for nested store */
  findAll: function(recordType, conditions, params, recordArray, _store) { 
    if (!_store) _store = this;
    return this.get('parentStore').findAll(recordType, conditions, params, recordArray, _store);
  },

  // ..........................................................
  // CORE RECORDS API
  // 
  // The methods in this section can be used to manipulate records without 
  // actually creating record instances.
  
  /** @private - adapt for nested store
  
    Unlike for the main store, for nested stores if isRefresh=YES, we'll throw
    an error if the record is dirty.  We'll otherwise avoid setting our status
    because that can disconnect us from upper and/or lower stores.
  */
  retrieveRecords: function(recordTypes, ids, storeKeys, isRefresh) {
    var pstore = this.get('parentStore'), idx, storeKey, newStatus,
      len = (!storeKeys) ? ids.length : storeKeys.length,
      K = SC.Record, status;

    // Is this a refresh?
    if (isRefresh) {
      for(idx=0;idx<len;idx++) {
        storeKey = !storeKeys ? pstore.storeKeyFor(recordTypes, ids[idx]) : storeKeys[idx];
        status   = this.peekStatus(storeKey);
        
        // We won't allow calling retrieve on a dirty record in a nested store
        // (although we do allow it in the main store).  This is because doing
        // so would involve writing a unique status, and that would break the
        // status hierarchy, so even though lower stores would complete the
        // retrieval, the upper layers would never inherit the new statuses.
        if (status & K.DIRTY) {
          throw SC.Store.NESTED_STORE_RETRIEVE_DIRTY_ERROR;
        }
        else {
          // Not dirty?  Then abandon any status we had set (to re-establish
          // any prototype linkage breakage) before asking our parent store to
          // perform the retrieve.
          var dataHashes = this.dataHashes,
              revisions  = this.revisions,
              statuses   = this.statuses,
              editables  = this.editables,
              locks      = this.locks;

          var changed    = NO;
          var statusOnly = NO;
  
          if (dataHashes  &&  dataHashes.hasOwnProperty(storeKey)) {
            delete dataHashes[storeKey];
            changed = YES;
          }
          if (revisions   &&  revisions.hasOwnProperty(storeKey)) {
            delete revisions[storeKey];
            changed = YES;
          }
          if (editables) delete editables[storeKey];
          if (locks) delete locks[storeKey];

          if (statuses  &&  statuses.hasOwnProperty(storeKey)) {
            delete statuses[storeKey];
            if (!changed) statusOnly = YES;
            changed = YES;
          }
          
          if (changed) this._notifyRecordPropertyChange(storeKey, statusOnly);
        }
      }
    }
    
    return pstore.retrieveRecords(recordTypes, ids, storeKeys, isRefresh);
  },

  /** @private - adapt for nested store */
  commitRecords: function(recordTypes, ids, storeKeys) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  commitRecord: function(recordType, id, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  cancelRecords: function(recordTypes, ids, storeKeys) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  cancelRecord: function(recordType, id, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  // ..........................................................
  // DATA SOURCE CALLBACKS
  // 
  // Mathods called by the data source on the store

  /** @private - adapt for nested store */
  dataSourceDidCancel: function(storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  dataSourceDidComplete: function(storeKey, dataHash, newId) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  dataSourceDidDestroy: function(storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  dataSourceDidError: function(storeKey, error) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  // ..........................................................
  // PUSH CHANGES FROM DATA SOURCE
  // 
  
  /** @private - adapt for nested store */
  pushRetrieve: function(recordType, id, dataHash, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /** @private - adapt for nested store */
  pushDestroy: function(recordType, id, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },

  /** @private - adapt for nested store */
  pushError: function(recordType, id, error, storeKey) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  }
  
}) ;

