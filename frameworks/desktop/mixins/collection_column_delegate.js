// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================



/** 
  @namespace
  
  CollectionColumnDelegates are consulted by SC.HorizontalListView 
  
  You can implement a custom column width in one of two ways.  
  
*/
SC.CollectionColumnDelegate = {

  /** walk like a duck */
  isCollectionColumnDelegate: YES,
  
  /**
    Default column height.  Unless you implement some custom column height 
    support, this column height will be used for all items.
    
    @property
    @type Number
  */
  columnWidth: 100,

  /**
    Index set of columns that should have a custom column height.  If you need 
    certains columns to have a custom column height, then set this property to a 
    non-null value.  Otherwise leave it blank to disable custom column heights.
    
    @property
    @type SC.IndexSet
  */
  customColumnWidthIndexes: null,
  
  /**
    Called for each index in the customColumnHeightIndexes set to get the 
    actual column height for the index.  This method should return the default
    columnHeight if you don't want the column to have a custom height.
    
    The default implementation just returns the default columnHeight.
    
    @param {SC.CollectionView} view the calling view
    @param {Object} content the content array
    @param {Number} contentIndex the index 
    @returns {Number} column height
  */
  contentIndexColumnWidth: function(view, content, contentIndex) {
    return this.get('columnWidth');    
  }
  
  
};
