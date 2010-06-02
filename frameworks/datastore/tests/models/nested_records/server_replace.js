/**
 * Complex Nested Records that have a replaced data hash from the server
 *
 * @author Evin Grano
 */

// ..........................................................
// Basic Set up needs to move to the setup and teardown
// 
var NestedRecord, store, storeKeys; 

var initModels = function(){
  NestedRecord.Family = SC.Record.extend({
    /** Child Record Namespace */
    childRecordNamespace: NestedRecord,
    primaryKey: 'id',
    id: SC.Record.attr(String),
    name: SC.Record.attr(String),
    members: SC.Record.toMany('SC.Record', { nested: true })
  });
  
  NestedRecord.Person = SC.ChildRecord.extend({
    primaryKey: 'id',
    id: SC.Record.attr(String),
    name: SC.Record.attr(String),
    relationships: SC.Record.toMany('SC.Record', { nested: true })
  });
  
  NestedRecord.Relationship = SC.ChildRecord.extend({
    primaryKey: 'id',
    id: SC.Record.attr(String),
    name: SC.Record.attr(String),
    connectedId: SC.Record.attr(String)
  });
  
};

// ..........................................................
// Basic SC.Record Stuff
// 
module("Server Data Replace, SC.ChildRecord", {

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
            name: 'Willie'
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
    delete NestedRecord.Family;
    delete NestedRecord.Person;
    delete NestedRecord.Relationship;
    NestedRecord = null;
    store = null;
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

test("Test Commit to server and data return",function() {
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

test("Test Commit to server and new member addition",function() {
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
  equals(realHash.members[1].id, testHash.members[1].id, "Smith Family Member 1 have the same id");
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
  var family, first, second, members, firstHash, secondHash;
  
  // First
  family = store.materializeRecord(storeKeys[0]);
  members = family.get('members');
  first = members.objectAt(0);
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
  members = family.get('members');
  second = members.objectAt(0);
  same(first, second, "the SC.ChildRecord should the be the same before and after the save");
});


