(function() {

  var MyApp, store, record, recordHash;

  module('SC.ManyNestedAttribute', {
    
    setup: function() {
      debugger;

      SC.RunLoop.begin();

      store = SC.Store.create();

      MyApp = SC.Object.create({
        store: store
      });

      MyApp.LeafRecord = SC.Record.extend({
        primaryKey: 'id'
      });

      MyApp.MiddleRecord = SC.Record.extend({
        primaryKey: 'id',
        leaves: SC.Record.toManyNested(MyApp.LeafRecord)
      });

      MyApp.RootRecord = SC.Record.extend({
        primaryKey: 'id',
        branches: SC.Record.toManyNested(MyApp.MiddleRecord)
      });

      recordHash = {
        id: '1000',
        branches: [
          {
            id: '2000',
            leaves: [
              {
                id: '3000'
              }
            ]
          },
          {
            id: '2001',
            leaves: [
              {
                id: '3001'
              },
              {
                id: '3002'
              }
            ]
          }
        ]
      };

      record = store.createRecord(MyApp.RootRecord, recordHash);

      SC.RunLoop.end();
    },
    
    teardown: function() {
      store.destroyRecord(MyApp.RootRecord, record.get('id'));
      store.reset();
      store = null;
    }
    
  });

  test('init', function() {
    debugger;
    var r = store.find(MyApp.RootRecord, recordHash.id);
    equals(r.get('id'), recordHash.id);
  });
  
})();
