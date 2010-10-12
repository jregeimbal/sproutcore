// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test myApp */
 
// test parsing of query string
var myApp = {}, scope1, scope2;
module("SC.Query#queryWithScope", {
  setup: function() {

    myApp = SC.Object.create({
      Person: SC.Record.extend({
        firstName: SC.Record.attr(String),
        lastName: SC.Record.attr(String)
      }),
      store: SC.Store.create().from(SC.DataSource.create())
    });
    myApp.PEOPLE_QUERY = SC.Query.local(myApp.Person);
    myApp.WHITE_QUERY  = SC.Query.local(myApp.Person, 'lastName = "White"');

    SC.RunLoop.begin();
    myApp.store.pushRetrieve(myApp.Person, 1, {firstName: 'Bo', lastName: 'Jeanes'});
    myApp.store.pushRetrieve(myApp.Person, 2, {firstName: 'Jo', lastName: 'White'});
    SC.RunLoop.end();

    myApp.q = SC.Query.create({
      conditions: "foo = bar",
      parameters: { foo: "bar" },
      orderBy: "foo",
      recordType: SC.Record,
      recordTypes: [SC.Record],
      location: SC.Query.REMOTE
    }).freeze();
    
    scope1 = SC.CoreSet.create();
    scope2 = SC.CoreSet.create();
  },
  
  teardown: function() {
    myApp = scope1 = scope2 = null;
  }
});

function verifyCopy(copy, original) {
  var keys = 'conditions orderBy recordType recordTypes parameters location'.w();
  keys.forEach(function(key) {
    equals(copy.get(key), original.get(key), 'copy.%@ should equal original.%@'.fmt(key, key));
  });
}

test("getting into scope first time", function() {
  
  var q2 = myApp.q.queryWithScope(scope1);
  verifyCopy(q2, myApp.q);
  equals(q2.get('scope'), scope1, 'new query should have scope1');
  
  var q3 = myApp.q.queryWithScope(scope1);
  equals(q3, q2, 'calling again with same scope should return same instance');
});

test("chained scope", function() {
  var q2 = myApp.q.queryWithScope(scope1) ;
  var q3 = q2.queryWithScope(scope2);
  
  verifyCopy(q3, q2);
  equals(q3.get('scope'), scope2, 'new query should have scope2');
  
  var q4 = q2.queryWithScope(scope2);
  equals(q4, q3, 'calling again with same scope should return same instance');
});

test("Scoped Query Should return correct results before and after store updates", function(){
  var people = myApp.store.find(myApp.PEOPLE_QUERY),
      white  = myApp.store.find(myApp.WHITE_QUERY.queryWithScope(people));

  equals(people.get('length'), 2, "should have found 2 records");
  ok(people.getEach('firstName').isEqual(["Bo", "Jo"]), "FirstNames of all people");

  equals(white.get('length'), 1, "should only find 1 white");
  equals(white.getEach('firstName').toString(), (["Jo"]).toString(), "FirstNames of the white");

  SC.RunLoop.begin();
  myApp.store.pushRetrieve(myApp.Person, 3, {firstName: 'Alex', lastName: 'White'});
  SC.RunLoop.end();

  equals(people.get('length'), 3, "should have found 3 records");
  ok(people.getEach('firstName').isEqual(["Bo", "Jo", "Alex"]), "FirstNames of all people");

  equals(white.get('length'), 2, "should only find 2 whites");
  equals(white.getEach('firstName').toString(), (["Jo", "Alex"]).toString(), "FirstNames of all whites");
});