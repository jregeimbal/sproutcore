// ========================================================================
// SC.valueOfPath Tests
// ========================================================================
/*globals module test */

var objectA,objectB,objectC,objectD; //global variables

module("Array Check" , {
	
	setup: function(){
		objectA = {foo: {bar: 'baz'}};
		objectB = SC.Object.create(objectA);
		objectC = {};
		objectD = SC.Object.create(objectC);
	}
});

test("check valid value paths" ,function(){
	equals(SC.valueOfPath(objectA,'foo.bar'),'baz',"Path foo.bar of objectA is 'baz'");
	equals(SC.valueOfPath(objectA,'foo').bar,'baz',"Path foo.bar of objectA is Object[{bar: 'baz'}] with baz");

	equals(SC.valueOfPath(objectB,'foo.bar'),'baz',"Path foo.bar of objectB is 'baz'");
	equals(SC.valueOfPath(objectB,'foo').bar,'baz',"Path foo.bar of objectB is Object[{bar: 'baz'}] with baz");
});

test("check invalid value paths" ,function(){
	equals(SC.valueOfPath(objectC,'foo.bart'),undefined,"Path foo.bart of objectC is undefined");

	equals(SC.valueOfPath(objectD,'foo.bar'),undefined,"Path foo.bar of objectD is undefined");
});

