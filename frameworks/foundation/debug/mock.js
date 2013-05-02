// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2012 Oracle
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals SC */

/** @class
  A basic mocking class for sproutcore
 
  @since SproutCore 1.0
*/
SC.Mock = SC.Object.extend({
  
  /**
    Every item defined in this array will be added as a method on this class
    additionally a method named <item>WasCalled will be defined that will
    return the number of times that method was called
    
    @property {Array}
  */
  methods: [],



  init: function(){
    sc_super();
    
    var methods = this.get('methods');

    methods.forEach(function(m){
      this["_"+m+"_count"] = 0;
      this[m] = function(){
        this["_"+m+"_count"]+=1;
      };

      this[m+"WasCalled"] = function(){
        return this["_"+m+"_count"];
      };
    },this);

  }

});
