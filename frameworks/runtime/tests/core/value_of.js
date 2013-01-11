// ========================================================================
// SC.valueOf Tests
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
	equals(SC.valueOf(objectA,'foo.bar'),undefined,"Path foo.bar of objectA is undefined");
	equals(SC.valueOf(objectA,'foo').bar,'baz',"Path foo.bar of objectA is Object[{bar: 'baz'}] with baz");

	equals(SC.valueOf(objectB,'foo.bar'),undefined,"Path foo.bar of objectB is undefined");
	equals(SC.valueOf(objectB,'foo').bar,'baz',"Path foo.bar of objectB is Object[{bar: 'baz'}] with baz");
});

test("check invalid value paths" ,function(){
	equals(SC.valueOf(objectC,'foot'),undefined,"Path foot of objectC is undefined");

	equals(SC.valueOf(objectD,'foto'),undefined,"Path foto of objectD is undefined");
});

