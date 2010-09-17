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
    name: SC.Record.attr(String),
    members: SC.Record.toMany('SC.Record', { nested: true })
  });
  
  NestedRecord.Person = SC.ChildRecord.extend({
    childRecordNamespace: NestedRecord,
    primaryKey: 'id',
    name: SC.Record.attr(String),
    relatedTo: SC.Record.toMany('SC.Record', { nested: true })
  });
  
  NestedRecord.Relationship = SC.ChildRecord.extend({
    primaryKey: 'id',
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
      },
      // Third Family
      {
        type: 'Family',
        name: 'Doe',
        id: 3,
        members: [
          {
            type: 'Person',
            name: 'John',
            id: 30
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
  var first, second, third;
  equals(storeKeys.get('length'), 3, "number of primary store keys should be 3");
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  ok(SC.kindOf(first, SC.Record), "first record is a kind of a SC.Record Object");
  ok(SC.instanceOf(first, NestedRecord.Family), "first record is a instance of a NestedRecord.Family Object");
  
  // Second
  second = store.materializeRecord(storeKeys[1]);
  ok(SC.kindOf(second, SC.Record), "second record is a kind of a SC.Record Object");
  ok(SC.instanceOf(second, NestedRecord.Family), "second record is a instance of a NestedRecord.Family Object");

  // Third
  third = store.materializeRecord(storeKeys[2]);
  ok(SC.kindOf(third, SC.Record), "third record is a kind of a SC.Record Object");
  ok(SC.instanceOf(third, NestedRecord.Family), "third record is a instance of a NestedRecord.Family Object");
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
      { type: 'Person', name: 'Willie', id: 1}
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
      { type: 'Person', name: 'Willie', id: 1}
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
  var family, familyHash, firstMembers, secondMembers,
      first, second, firstHash, returnHash, secondHash;
  
  // First
  family = store.materializeRecord(storeKeys[0]);
  returnHash = {
    type: 'Family',
    name: 'Smith',
    id: 1,
    members: [{type: 'Person', name: 'Willie', id: 1, childRecordKey: 'cr2'}]
  };
  store.writeStatus(storeKeys[0], SC.Record.BUSY_LOADING);
  store.dataSourceDidComplete(storeKeys[0], returnHash);
  firstMembers = family.get('members');
  first = firstMembers.objectAt(0);
  firstHash = first.get('attributes');
  same(firstHash, returnHash.members[0], "the SC.ChildRecord should the be the same before and after the save");
  
  // Second
  family = store.materializeRecord(storeKeys[0]);
  familyHash = store.readDataHash(storeKeys[0]);
  secondMembers = family.get('members');
  second = secondMembers.objectAt(0);
  secondHash = second.get('attributes');
  
  // Tests
  equals(SC.guidFor(secondMembers), SC.guidFor(firstMembers), "verify that members ChildArrays are the same after save");
  equals(SC.guidFor(second), SC.guidFor(first), "verify that Member 1 are the same after save");
  equals(second.get('attributes'), first.get('attributes'), "verify that Member 1 attributes are the same after save");
  same(second, first, "the SC.ChildRecord should the be the same before and after the save");
  same(secondHash, firstHash, "the SC.ChildRecordHashes should the be the same before and after the save");
  same(second.get('id'), first.get('id'), "the SC.ChildRecord id should the be the same before and after the save");
  same(secondHash, familyHash.members[0], "the Family Record and the member id hash should match");
});

test("", function() {
  var family, members, realHash, testHash, john, wilma, rel;
  
  // third family
  family = store.materializeRecord(storeKeys[2]);
  
  // Add new member
  family.get('members').pushObject({ id: -31, type: 'Person', name: "Wilma"});
  john = family.get('members').objectAt(0);
  john.get('relatedTo').pushObject({ type: 'Relationship', id: -310, name: 'wife', connectedId: -31 });

  testHash = {
    type: 'Family',
    name: 'Doe',
    id: 3,
    members: [
      { type: 'Person', id: 30, name: 'John', relatedTo: [{ type: 'Relationship', id: -310, name: 'wife', connectedId: -31 }] },
      { type: 'Person', id: -31, name: "Wilma" }
    ]
  };
  realHash = store.readDataHash(storeKeys[2]);
  equals(realHash.members.length, testHash.members.length, "Doe Family Members have the same length");
  equals(realHash.members[0].name, testHash.members[0].name, "Doe Family Member 1 have the same name");
  equals(realHash.members[0].id, testHash.members[0].id, "Doe Family Member 1 have the same id");
  equals(realHash.members[1].name, testHash.members[1].name, "Doe Family Member 2 have the same name");
  equals(realHash.members[1].id, testHash.members[1].id, "Doe Family Member 1 have the same id");
  equals(realHash.members[0].relatedTo.length, testHash.members[0].relatedTo.length, "John has same number of relatedTo");
  equals(realHash.members[0].relatedTo[0].name, testHash.members[0].relatedTo[0].name, "John has a wife");
  equals(realHash.members[0].relatedTo[0].id, testHash.members[0].relatedTo[0].id, "Relationship ID is the same");
  equals(realHash.members[0].relatedTo[0].connectedId, testHash.members[0].relatedTo[0].connectedId, "Relationship connectedId maintained");

  store.writeStatus(storeKeys[2], SC.Record.BUSY_LOADING);
  store.dataSourceDidComplete(storeKeys[2], {
    type: 'Family',
    name: 'Doe',
    id: 3,
    members: [
      { type: 'Person', id: 30, name: 'John', relatedTo: [{ type: 'Relationship', id: 310, name: 'wife', connectedId: 31 }] },
      { type: 'Person', id: 31, name: "Wilma"}
    ]
  });
  
  realHash = store.readDataHash(storeKeys[2]);
  members = family.get('members');
  testHash = {
    type: 'Family',
    name: 'Doe',
    id: 3,
    members: [
      { type: 'Person', id: 30, name: 'John', relatedTo: [{ type: 'Relationship', id: 310, name: 'wife', connectedId: 31 }] },
      { type: 'Person', id: 31, name: "Wilma"}
    ]
  };
  equals(members.get('length'), 2, 'Smith Family has 2 members...length is correct');
  equals(realHash.members[0].name, testHash.members[0].name, "Doe Family Member 1 have the same name after save");
  equals(realHash.members[0].id, testHash.members[0].id, "Doe Family Member 1 have the same id after save");
  equals(realHash.members[1].name, testHash.members[1].name, "Doe Family Member 2 have the same name after save");
  equals(realHash.members[1].id, testHash.members[1].id, "Doe Family Member 2 have the same id after save");
  equals(realHash.members[0].relatedTo.length, testHash.members[0].relatedTo.length, "John has same number of relatedTo");
  equals(realHash.members[0].relatedTo[0].name, testHash.members[0].relatedTo[0].name, "John has a wife");
  equals(realHash.members[0].relatedTo[0].id, testHash.members[0].relatedTo[0].id, "Relationship ID is the same");
  equals(realHash.members[0].relatedTo[0].connectedId, testHash.members[0].relatedTo[0].connectedId, "Relationship connectedId maintained");
  
  // make sure the record instances match the data hashes
  john = family.get('members').objectAt(0);
  wilma = family.get('members').objectAt(1);
  equals(john.get('id'), testHash.members[0].id, "John's record ID matches his hash ID");
  equals(wilma.get('id'), testHash.members[1].id, "Wilma's record ID matches her hash ID");
  
  rel = john.get('relatedTo').objectAt(0);
  equals(rel.get('id'), testHash.members[0].relatedTo[0].id, "John's relationship record ID matches the hash value");
  equals(rel.get('connectedId'), testHash.members[0].relatedTo[0].connectedId, "John's record 'connectedId' matches what's in the data hash");
});