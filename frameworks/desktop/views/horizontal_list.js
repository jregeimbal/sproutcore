// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/collection');
sc_require('mixins/collection_column_delegate');

/** @class
  
  A horizontal list view renders horizontal lists of items.  It is a specialized form of
  collection view that is simpler than the table view, but more refined than
  a generic collection.
  
  You can use a horizontal list view just like a collection view, except that often you
  also should provide a default columnWidth.  Setting this value will allow 
  the HorizontalListView to optimize its rendering.
  
  h2. Variable column widths

  Normally you set the column width through the columnWidth property.  You can 
  also support custom column widths by implementing the 
  contentCustomColumnWidthIndexes property to return an index set.
  
  h2. Using HorizontalListView with Very Large Data Sets
  
  HorizontalListView implements incremental rendering, which means it will only render
  HTML for the items that are current visible on the screen.  You can use it
  to efficiently render lists with 100K+ items very efficiently.  
  
  If you need to work with very large lists of items, however, be aware that
  calculate variable columns widths can become very expensive since the list 
  view will essentially have to iterate over every item in the collection to
  collect its column width.  
  
  To work with very large lists, you should consider making your column widths
  uniform.  This will allow the list view to efficiently render content 
  without worrying about the overall performance.
  
  Alternatively, you may want to consider overriding the 
  offsetForColumnAtContentIndex() and widthForColumnAtContentIndex() methods to 
  perform some faster calculations that do not require inspecting every 
  item in the collection.
  
  Note that column widths and offsets are cached so once they are calculated
  the list view will be able to display very quickly.
  
  (Can we also have an 'estimate column widths' property that will simply 
  cheat for very long data sets to make rendering more efficient?)
  
  @extends SC.CollectionView
  @extends SC.CollectionColumnDelegate
  @since SproutCore 1.0
*/
SC.HorizontalListView = SC.CollectionView.extend(
  SC.CollectionColumnDelegate,
/** @scope SC.ListView.prototype */ {
  
  classNames: ['sc-horizontal-list-view'],

  acceptsFirstResponder: YES,
  
  /**
  * If set to YES, the default theme will show alternating columns
  * for the views this HorizontalListView created through exampleView property.
  *
  * @property {Boolean} 
  */
  showAlternatingColumns: NO,

  canScrollHorizontal: YES,
  
  // ..........................................................
  // METHODS
  //
  
  render: function(context, firstTime) {
    context.setClass('alternating', this.get('showAlternatingColumns'));
    
    return sc_super();
  },

  // ..........................................................
  // COLLECTION column DELEGATE SUPPORT
  // 
  
  
  /**
    Returns the current collectionRowDelegate.  This property will recompute
    everytime the content changes.
  */
  columnDelegate: function() {
    var del     = this.delegate,
        content = this.get('content');
    return this.delegateFor('isCollectionColumnDelegate', del, content);
  }.property('delegate', 'content').cacheable(),
  
  /** @private 
    Whenever the columnDelegate changes, begin observing important properties
  */
  _schlv_columnDelegateDidChange: function() {
    var last = this._schlv_columnDelegate,
        del  = this.get('columnDelegate'),
        func = this._schlv_columnWidthDidChange,
        func2 = this._schlv_customColumnWidthIndexesDidChange;
        
    if (last === del) return this; // nothing to do
    this._schlv_columnDelegate = del; 

    // last may be null on a new object
    if (last) {
      last.removeObserver('columnWidth', this, func);
      last.removeObserver('customColumnWidthIndexes', this, func2);
    }
    
    if (!del) {
      throw "Internal Inconsistancy: HorizontalListView must always have CollectionColumnDelegate";
    }
    
    del.addObserver('columnWidth', this, func);
    del.addObserver('customColumnWidthIndexes', this, func2);
    this._schlv_columnWidthDidChange()._schlv_customColumnWidthIndexesDidChange();
    return this ;
  }.observes('columnDelegate'),

  /** @private 
    called whenever the columnWidth changes.  If the property actually changed
    then invalidate all column widths.
  */
  _schlv_columnWidthDidChange: function() {
    var del = this.get('columnDelegate'),
        width = del.get('columnWidth'), 
        indexes;
        
    if (width === this._schlv_columnWidth) return this; // nothing to do
    this._schlv_columnWidth = width;

    indexes = SC.IndexSet.create(0, this.get('length'));
    this.columnWidthDidChangeForIndexes(indexes);
    return this ;
  },

  /** @private 
    called whenever the customColumnWidthIndexes changes.  If the property 
    actually changed then invalidate affected column widths.
  */
  _schlv_customColumnWidthIndexesDidChange: function() {
    var del     = this.get('columnDelegate'),
        indexes = del.get('customColumnWidthIndexes'), 
        last    = this._schlv_customColumnWidthIndexes,
        func    = this._schlv_customColumnWidthIndexesContentDidChange;
        
    // nothing to do
    if ((indexes===last) || (last && last.isEqual(indexes))) return this;

    // if we were observing the last index set, then remove observer
    if (last && this._schlv_isObservingCustomcolumnWidthIndexes) {
      last.removeObserver('[]', this, func);
    }
    
    // only observe new index set if it exists and it is not frozen.
    if (this._schlv_isObservingCustomcolumnWidthIndexes = indexes && !indexes.get('isFrozen')) {
      indexes.addObserver('[]', this, func);
    }
    
    this._schlv_customColumnWidthIndexesContentDidChange();
    return this ;
  },

  /** @private
    Called whenever the customColumnWidthIndexes set is modified.
  */
  _schlv_customColumnWidthIndexesContentDidChange: function() {
    var del     = this.get('columnDelegate'),
        indexes = del.get('customColumnWidthIndexes'), 
        last    = this._schlv_customColumnWidthIndexes, 
        changed;

    // compute the set to invalidate.  the union of cur and last set
    if (indexes && last) {
      changed = indexes.copy().add(last);
    } else changed = indexes || last ;
    this._schlv_customColumnWidthIndexes = indexes ? indexes.frozenCopy() : null; 

    // invalidate
    this.columnWidthDidChangeForIndexes(changed);
    return this ;
  },
  
  // ..........................................................
  // column PROPERTIES
  // 
  
  /**
    Returns the top offset for the specified content index.  This will take
    into account any custom column widths and group views.
    
    @param {Number} idx the content index
    @returns {Number} the column offset
  */
  columnOffsetForContentIndex: function(idx) {
    if (idx === 0) return 0 ; // fastpath

    var del       = this.get('columnDelegate'),
        columnWidth = del.get('columnWidth'),
        columnSpacing, ret, custom, cache, delta, max, content ;
        
    ret = idx * columnWidth;

    columnSpacing = this.get('columnSpacing');
		if(columnSpacing){ 
      ret += idx * columnSpacing; 
    } 

    if (del.customColumnWidthIndexes && (custom=del.get('customColumnWidthIndexes'))) {
      
      // prefill the cache with custom columns.
      cache = this._schlv_offsetCache;
      if (!cache) {
        cache = [];
        delta = max = 0 ;
        custom.forEach(function(idx) {
          delta += this.columnWidthForContentIndex(idx)-columnWidth;
          cache[idx+1] = delta;
          max = idx ;
        }, this);
        this._schlv_max = max+1;
        // moved down so that the cache is not marked as initialized until it actually is
        this._schlv_offsetCache = cache;
      }
      
      // now just get the delta for the last custom column before the current 
      // idx.
      delta = cache[idx];
      if (delta === undefined) {
        delta = cache[idx] = cache[idx-1];
        if (delta === undefined) {
          max = this._schlv_max;
          if (idx < max) max = custom.indexBefore(idx)+1;
          delta = cache[idx] = cache[max] || 0;
        }
      }

      ret += delta ;
    }
    
    return ret ;
  },
  
  /**
    Returns the column width for the specified content index.  This will take
    into account custom column widths and group columns.
    
    @param {Number} idx content index
    @returns {Number} the column width
  */
  columnWidthForContentIndex: function(idx) {
    var del = this.get('columnDelegate'),
        ret, cache, content, indexes;
    
    if (del.customColumnWidthIndexes && (indexes=del.get('customColumnWidthIndexes'))) {
      cache = this._schlv_widthCache ;
      if (!cache) {
        cache = [];
        content = this.get('content');
        indexes.forEach(function(idx) {
          cache[idx] = del.contentIndexColumnWidth(this, content, idx);
        }, this);
        // moved down so that the cache is not marked as initialized until it actually is
        this._schlv_widthCache = cache;
      }
      
      ret = cache[idx];
      if (ret === undefined) ret = del.get('columnWidth');
    } else ret = del.get('columnWidth');
    
    return ret ;
  },
  
  /**
    Call this method whenever a column width has changed in one or more indexes.
    This will invalidate the column width cache and reload the content indexes.
    Pass either an index set or a single index number.

    This method is called automatically whenever you change the columnWidth
    or customColumnWidthIndexes properties on the collectionRowDelegate.
    
    @param {SC.IndexSet|Number} indexes 
    @returns {SC.ListView} receiver
  */  
  columnWidthDidChangeForIndexes: function(indexes) {
    var len     = this.get('length');

    // clear any cached offsets
    this._schlv_widthCache = this._schlv_offsetCache = null;
    
    // find the smallest index changed; invalidate everything past it
    if (indexes && indexes.isIndexSet) indexes = indexes.get('min');
    this.reload(SC.IndexSet.create(indexes, len-indexes));
    return this ;
  },
  
  // ..........................................................
  // SUBCLASS IMPLEMENTATIONS
  // 
  
  /**
    The layout for a HorizontalListView is computed from the total number of columns 
    along with any custom column widths.
  */
  computeLayout: function() {
    // default layout
    var ret = this._schlv_layout;
    if (!ret) ret = this._schlv_layout = {};
    ret.minWidth = this.columnOffsetForContentIndex(this.get('length'));
    this.set('calculatedWidth',ret.minWidth);
    return ret ;
  },
  
  /**
  
    Computes the layout for a specific content index by combining the current
    column widths.
  
  */
  layoutForContentIndex: function(contentIndex) {
    return {
      top:    0,
      bottom:  0,
      width: this.columnWidthForContentIndex(contentIndex),
      left:   this.columnOffsetForContentIndex(contentIndex)
    };
  },
  
  /**
    Override to return an IndexSet with the indexes that are at least 
    partially visible in the passed rectangle.  This method is used by the 
    default implementation of computeNowShowing() to determine the new 
    nowShowing range after a scroll.
    
    Override this method to implement incremental rendering.
    
    The default simply returns the current content length.
    
    @param {Rect} rect the visible rect or a point
    @returns {SC.IndexSet} now showing indexes
  */
  contentIndexesInRect: function(rect) {
    var columnWidth = this.get('columnDelegate').get('columnWidth'),
        left       = SC.minX(rect),
        right    = SC.maxX(rect),
        width    = rect.width || 0,
        len       = this.get('length'),
        offset, start, end;

    // estimate the starting column and then get actual offsets until we are 
    // right.
    start = (left - (left % columnWidth)) / columnWidth;
    offset = this.columnOffsetForContentIndex(start);
    
    // go backwards until top of column is before top edge
    while(start>0 && offset>left) {
      start--;
      offset -= this.columnWidthForContentIndex(start);
    }
    
    // go forwards until bottom of column is after top edge
    offset += this.columnWidthForContentIndex(start);
    while(start<len && offset<=left) {
      start++;
      offset += this.columnWidthForContentIndex(start);
    }
    if (start<0) start = 0;
    if (start>=len) start=len;
    
    
    // estimate the final column and then get the actual offsets until we are 
    // right. - look at the offset of the _following_ column
    end = start + ((width - (width % columnWidth)) / columnWidth) ;
    if (end > len) end = len;
    offset = this.columnOffsetForContentIndex(end);
    
    // walk backwards until top of column is before or at bottom edge
    while(end>=start && offset>=right) {
      end--;
      offset -= this.columnWidthForContentIndex(end);
    }
    
    // go forwards until bottom of column is after bottom edge
    offset += this.columnWidthForContentIndex(end);
    while(end<len && offset<right) {
      end++;
      offset += this.columnWidthForContentIndex(end);
    }
    
    end++; // end should be after start
    
    // if width is greater than 0, on some platforms we should just render
    // to specific windows in order to minimize render time.
    // if (width > 0 && !SC.browser.msie) {
    //   start = start - (start % 50);
    //   if (start < 0) start = 0 ;
    //   end   = end - (end % 50) + 50;
    // }
    
    if (end<start) end = start;
    if (end>len) end = len ;
    
    // convert to IndexSet and return
    return SC.IndexSet.create(start, end-start);
  },
  
  // ..........................................................
  // DRAG AND ROP SUPPORT
  // 
  
  
  /**
    Default view class used to draw an insertion point.  The default 
    view will show a vertical line.  Any view you create
    should expect an outlineLevel property set, which should impact your left
    offset.
    
    @property 
    @type {SC.View}
  */
  insertionPointView: SC.View.extend({
    classNames: 'sc-list-insertion-point',
    
    render: function(context, firstTime) {
      if (firstTime) context.push('<div class="anchor"></div>');
    }
    
  }),

  /**
    Default implementation will show an insertion point
  */
  showInsertionPoint: function(itemView, dropOperation) {
    var view = this._insertionPointView;
    if (!view) {
      view = this._insertionPointView 
           = this.get('insertionPointView').create();
    }
    
    var index  = itemView.get('contentIndex'),
        len    = this.get('length'),
        layout = SC.clone(itemView.get('layout')),
        level  = itemView.get('outlineLevel'),
        indent = itemView.get('outlineIndent') || 0,
        group;

    // show item indented if we are inserting at the end and the last item
    // is a group item.  This is a special case that should really be 
    // converted into a more general protocol.
    if ((index >= len) && index>0) {
      group = this.itemViewForContentIndex(len-1);
      if (group.get('isGroupView')) {
        level = 1;
        indent = group.get('outlineIndent');
      }
    }
    
    if (SC.none(level)) level = -1;
    if (this._lastDropOnView) {
      this._lastDropOnView.set('isSelected', NO);
      this._lastDropOnView = null;
    }
      
    if (dropOperation & SC.DROP_AFTER) layout.left += layout.width;
      
    layout.width = 2;
    layout.bottom  = 0;
    layout.top   = 0;
    delete layout.height;

    view.set('layout', layout);
    this.appendChild(view);
  },
  
  hideInsertionPoint: function() {
    if (this._lastDropOnView) {
      this._lastDropOnView.set('isSelected', NO);
      this._lastDropOnView = null;
    }
    
    var view = this._insertionPointView;
    if (view) view.removeFromParent().destroy();
    this._insertionPointView = null;
  },

  /**
    Compute the insertion index for the passed location.  The location is 
    a point, relative to the top/left corner of the receiver view.  The return
    value is an index plus a dropOperation, which is computed as such:
    
    - if outlining is not used and you are within 5px of an edge, DROP_BEFORE
      the item after the edge.
      
    - if outlining is used and you are within 5px of an edge and the previous
      item has a different outline level then the next item, then DROP_AFTER
      the previous item if you are closer to that outline level.
      
    - if dropOperation = SC.DROP_ON and you are over the middle of a column, then
      use DROP_ON.
  */
  insertionIndexForLocation: function(loc, dropOperation) {
    var locRect = {x:loc.x, y:loc.y, width:1, height:1},
        indexes = this.contentIndexesInRect(locRect),
        index   = indexes.get('min'),
        len     = this.get('length'),
        min, max, diff, clevel, cindent, plevel, pindent, itemView, pgroup;

    // if there are no indexes in the rect, then we need to either insert
    // before the top item or after the last item.  Figure that out by 
    // computing both.
    if (SC.none(index) || index<0) {
      if ((len===0) || (loc.x <= this.columnOffsetForContentIndex(0))) index = 0;
      else if (loc.x >= this.columnOffsetForContentIndex(len)) index = len;
    }

    // figure the range of the column the location must be within.
    min = this.columnOffsetForContentIndex(index);
    max = min + this.columnWidthForContentIndex(index);
    
    // now we know which index we are in.  if dropOperation is DROP_ON, figure
    // if we can drop on or not.
    if (dropOperation == SC.DROP_ON) {
      // editable size - reduce width by a bit to handle dropping
      if (this.get('isEditable')) diff=Math.min(Math.floor((max-min)*0.2),5);
      else diff = 0;
      
      // if we're inside the range, then DROP_ON
      if (loc.x >= (min+diff) || loc.x <= (max+diff)) {
        return [index, SC.DROP_ON];
      }
    }
    
    
    
    // ok, now if we are in last 10px, go to next item.
    if ((index<len) && (loc.x >= max-10)) index++;
    
    // finally, let's decide if we want to actually insert before/after.  Only
    // matters if we are using outlining.
    if (index>0) {

      itemView = this.itemViewForContentIndex(index-1);
      pindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
      plevel   = itemView ? itemView.get('outlineLevel') : 0;
      
      if (index<len) {
        itemView = this.itemViewForContentIndex(index);
        clevel   = itemView ? itemView.get('outlineLevel') : 0;
        cindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
        cindent  *= clevel;
      } else {
        clevel = itemView.get('isGroupView') ? 1 : 0; // special case...
        cindent = pindent * clevel;  
      }

      pindent  *= plevel;

      // if indent levels are different, then try to figure out which level 
      // it should be on.
      if ((clevel !== plevel) && (cindent !== pindent)) {
        
        // use most inner indent as boundary
        if (pindent > cindent) {
          index--;
          dropOperation = SC.DROP_AFTER;
        }
      }
    }

    // we do not support dropping before a group item.  If dropping before 
    // a group item, always try to instead drop after the previous item.  If
    // the previous item is also a group then, well, dropping is just not 
    // allowed.  Note also that dropping at 0, first item must not be group
    // and dropping at length, last item must not be a group
    //
    if (dropOperation === SC.DROP_BEFORE) {
      itemView = (index<len) ? this.itemViewForContentIndex(index) : null;
      if (!itemView || itemView.get('isGroupView')) {
        if (index>0) {
          itemView = this.itemViewForContentIndex(index-1);
          
          // don't allow a drop if the previous item is a group view and we're
          // insert before the end.  For the end, allow the drop if the 
          // previous item is a group view but OPEN.
          if (!itemView.get('isGroupView') || (itemView.get('disclosureState') === SC.BRANCH_OPEN)) {
            index = index-1;
            dropOperation = SC.DROP_AFTER;
          } else index = -1;

        } else index = -1;
      }
      
      if (index<0) dropOperation = SC.DRAG_NONE ;
    } 
    
    // return whatever we came up with
    return [index, dropOperation];
  },
  
  mouseWheel: function(evt) {
    // The following commits changes in a list item that is being edited,
    // if the list is scrolled.
    var inlineEditor = SC.InlineTextFieldView.editor;
    if(inlineEditor && inlineEditor.get('isEditing')){
      if(inlineEditor.get('delegate').get('displayDelegate')===this){
        SC.InlineTextFieldView.commitEditing();
      }
    }
    return NO ;  
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  init: function() {
    sc_super();
    this._schlv_columnDelegateDidChange();
  }  
  
});

