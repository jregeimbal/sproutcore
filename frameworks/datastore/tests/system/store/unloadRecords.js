// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var store;

module("SC.Store#unloadRecords", {
  setup: function() {
    SC.TestRecord2 = SC.Record.extend({
      nestedRecordNamespace: SC,
      primaryKey: 'id',
      name: SC.Record.attr(String)
    });

    SC.TestRecord = SC.Record.extend({
      nestedRecordNamespace: SC,
      primaryKey: 'id',
      name: SC.Record.attr(String),
      child: SC.Record.toOne('SC.TestRecord2', { isNested: YES })
    });

    store = SC.Store.create();

    store.loadRecords(SC.TestRecord, [
      { id: 1, name: 'Foo' },
      { id: 2, name: 'Bar' },
      { id: 3, name: 'Baz', child: { id: 1, name: 'Wang' }}
    ]);
  },

  teardown: function() {
    store = null;
    delete SC['TestRecord2'];
    delete SC['TestRecord'];
  }
});

test("Unload all records of a record type", function() {
  var records = store.find(SC.TestRecord);
  equals(records.get('length'), 3, "Store starts with 3 records loaded");
  store.unloadRecords(SC.TestRecord);
  records = store.find(SC.TestRecord);
  equals(records.get('length'), 0, "Number of TestRecord records left");
});

test("Unload single record (and its children)", function() {
  var records = store.find(SC.TestRecord);
  equals(records.get('length'), 3, "Store starts with 3 records loaded");

  var parent = records.objectAt(2);
  var child = parent.get('child');

  ok(store.parentRecords[parent.storeKey] !== undefined, "Parent store key is set");
  ok(store.childRecords[child.storeKey] !== undefined, "Child store key is set");

  store.unloadRecord(null, null, parent.storeKey);

  records = store.find(SC.TestRecord);
  equals(records.get('length'), 2, "After unload, fewer records in store");

  ok(store.parentRecords[parent.storeKey] === undefined, "Parent store key no longer set");
  ok(store.childRecords[child.storeKey] === undefined, "Child store key no longer set");

  equals(store.dataHashes[parent.storeKey], null, "Parent data hash was removed");
  equals(store.dataHashes[child.storeKey], null, "Child data hash was removed");
});
