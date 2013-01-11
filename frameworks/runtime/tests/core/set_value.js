// ========================================================================
// SC.setValue Tests
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
	equals(SC.setValue(objectA,'foo','baz'),'baz',"Set path 'foo' to 'baz' on JSON");
	equals(SC.setValue(objectB,'foo','baz'),'baz',"Set path 'foo' to 'baz' on SC.Object");
});