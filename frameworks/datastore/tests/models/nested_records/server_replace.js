/**
 * Complex nested records that are persisted to the server and replaced with modified hashes.
 *
 * @author Evin Grano
 * @author Sean Eidemiller
 * @author Joe Shelby
 */
var NestedRecord, store, storeKeys; 

var initModels = function(){
  NestedRecord.Family = SC.Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,
    primaryKey: 'id',
    name: SC.Record.attr(String),
    members: SC.Record.toMany('NestedRecord.Person', { nested: true })
  });

  NestedRecord.Person = SC.Record.extend({
    nestedRecordNamespace: NestedRecord,
    primaryKey: 'id',
    name: SC.Record.attr(String),
    relationships: SC.Record.toMany('NestedRecord.Relationship', { nested: true })
  });
  
  NestedRecord.Relationship = SC.Record.extend({
    nestedRecordNamespace: NestedRecord,
    primaryKey: 'id',
    name: SC.Record.attr(String),
    members: SC.Record.toMany('NestedRecord.Person', { nested: true })
  });
};

module("SC.Record: Nested Record Data Modification", {

  setup: function() {
    NestedRecord = SC.Object.create({
      store: SC.Store.create()
    });
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    storeKeys = store.loadRecords(NestedRecord.Family, [
      {
        type: 'Family',
        name: 'Smith',
        id: 1,
        members: [
          {
            type: 'Person',
            name: 'Willie',
            id: 1
          }
        ]
      },
      // Second Family
      {
        type: 'Family',
        name: 'Doe',
        id: 2,
        members: [
          {
            type: 'Person',
            name: 'John',
            id: 2
          },
          {
            type: 'Person',
            name: 'Jane',
            id: 3
          }
        ]
      }
    ]);
    SC.RunLoop.end();
  },

  teardown: function() {
    delete NestedRecord.Relationship;
    delete NestedRecord.Person;
    delete NestedRecord.Family;
    NestedRecord = undefined;
    store = null;
    storeKeys = null;
  }
});

test("Proper Initialization",function() {
  var first, second;
  equals(storeKeys.get('length'), 2, "number of primary store keys should be 2");
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  ok(SC.kindOf(first, SC.Record), "first record is a kind of a SC.Record Object");
  ok(SC.instanceOf(first, NestedRecord.Family), "first record is a instance of a NestedRecord.Family Object");
  
  // Second
  second = store.materializeRecord(storeKeys[1]);
  ok(SC.kindOf(second, SC.Record), "second record is a kind of a SC.Record Object");
  ok(SC.instanceOf(second, NestedRecord.Family), "second record is a instance of a NestedRecord.Family Object");
});

test("Commit to server and data return",function() {
  var first;
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  equals(first.get('status'), SC.Record.READY_CLEAN, 'first record has a READY_CLEAN State');
  
  store.writeStatus(storeKeys[0], SC.Record.BUSY_LOADING);
  equals(store.peekStatus(storeKeys[0]), SC.Record.BUSY_LOADING, 'first record has a BUSY_LOADING right before we reset the data');
  store.dataSourceDidComplete(storeKeys[0], {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [
      {
        type: 'Person',
        name: 'Willie',
        id: 1
      }
    ]
  });
  equals(store.peekStatus(storeKeys[0]), SC.Record.READY_CLEAN, 'first record has a READY_CLEAN State after new data change');
});

test("Commit to server and new member addition",function() {
  var first, members, realHash, testHash;
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  store.writeStatus(storeKeys[0], SC.Record.BUSY_LOADING);
  store.dataSourceDidComplete(storeKeys[0], {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [
      {
        type: 'Person',
        name: 'Willie',
        id: 1
      }
    ]
  });
  
  // Add new member
  first.get('members').pushObject({type: 'Person', name: "Wilma"});
  testHash = {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [
      { type: 'Person', id: 1, name: 'Willie'},
      { type: 'Person', name: "Wilma" }
    ]
  };
  realHash = store.readDataHash(storeKeys[0]);
  equals(realHash.members.length, testHash.members.length, "Smith Family Members have the same length");
  equals(realHash.members[0].name, testHash.members[0].name, "Smith Family Member 1 have the same name");
  equals(realHash.members[0].id, testHash.members[0].id, "Smith Family Member 1 have the same id");
  equals(realHash.members[1].name, testHash.members[1].name, "Smith Family Member 2 have the same name");
  equals(realHash.members[1].id, testHash.members[1].id, "Smith Family Member 2 have the same id");
  store.writeStatus(storeKeys[0], SC.Record.BUSY_LOADING);
  store.dataSourceDidComplete(storeKeys[0], {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [
      { type: 'Person', id: 1, name: 'Willie'},
      { type: 'Person', id: 4, name: "Wilma"}
    ]
  });
  realHash = store.readDataHash(storeKeys[0]);
  members = first.get('members');
  testHash = {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [
      { type: 'Person', id: 1, name: 'Willie'},
      { type: 'Person', id: 4, name: "Wilma" }
    ]
  };
  equals(members.get('length'), 2, 'Smith Family has 2 members...length is correct');
  equals(realHash.members[0].name, testHash.members[0].name, "Smith Family Member 1 have the same name after save");
  equals(realHash.members[0].id, testHash.members[0].id, "Smith Family Member 1 have the same id after save");
  equals(realHash.members[1].name, testHash.members[1].name, "Smith Family Member 2 have the same name after save");
  equals(realHash.members[1].id, testHash.members[1].id, "Smith Family Member 2 have the same id after save");
});

test("Test Commit to server and new member addition",function() {
  var family, familyHash, firstMembers, secondMembers,
      first, second, firstHash, secondHash;
  
  // First
  family = store.materializeRecord(storeKeys[0]);
  firstMembers = family.get('members');
  first = firstMembers.objectAt(0);
  firstHash = first.get('attributes');
  store.writeStatus(storeKeys[0], SC.Record.BUSY_LOADING);
  store.dataSourceDidComplete(storeKeys[0], {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [
      {
        type: 'Person',
        name: 'Willie',
        id: 1
      }
    ]
  });
  
  // Second
  family = store.materializeRecord(storeKeys[0]);
  familyHash = store.readDataHash(storeKeys[0]);
  secondMembers = family.get('members');
  
  secondMembers._contentDidChange();
  second = secondMembers.objectAt(0);
  secondHash = second.get('attributes');
  
  // Tests
  equals(SC.guidFor(secondMembers), SC.guidFor(firstMembers), "verify that members NestedArrays are the same after save");
  equals(SC.guidFor(second), SC.guidFor(first), "verify that Member 1 are the same after save");
  equals(second.get('attributes'), first.get('attributes'), "verify that Member 1 attributes are the same after save");
  same(second, first, "the SC.ChildRecord should the be the same before and after the save");
  same(secondHash, firstHash, "the SC.ChildRecordHashes should the be the same before and after the save");
  same(second.get('id'), first.get('id'), "the SC.ChildRecord id should the be the same before and after the save");
  same(secondHash, familyHash.members[0], "the Family Record and the member id hash should match");
});

test("Commit to server and new member removal",function() {
  var first, members, realHash, testHash;
  
  // First 'save' the original with one item
  first = store.materializeRecord(storeKeys[0]);
  store.writeStatus(storeKeys[0], SC.Record.BUSY_LOADING);
  store.dataSourceDidComplete(storeKeys[0], {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [
      {
        type: 'Person',
        name: 'Willie',
        id: 1
      }
    ]
  });
  // now 'refresh' the item
  store.writeStatus(storeKeys[0], SC.Record.BUSY_REFRESH);
  store.dataSourceDidComplete(storeKeys[0], {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [ ]
  });
  realHash = store.readDataHash(storeKeys[0]);
  members = first.get('members');
  equals(members.get('length'), 0, 'Smith Family has 0 members...length is correct, everybody died');
  equals(realHash.members.length, 0, 'Smith Family hash has 0 members...length is correct, everybody died');
  // confirmed through console log - realHash.members[0] is undefined, just as it is where the error occurs.
});
