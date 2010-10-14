// ==========================================================================
// SC.FolderedListView
// ==========================================================================

/** @class
  
  @extends SC.DataView
  @author Brandon Blatnick
  @author Alex Percsi

*/

SC.FolderedListView = SC.ListView.extend(SC.FolderedListViewDelegate,
/** @scope SC.FolderedListView.prototype */ { 
  beginEditingSelection: '',
  
  /**
    Set to NO if you don't want to allow target/action on a folder.
  */
  allowActionOnFolder: YES,
    
  dragDidBegin: function(drag, loc) {
    var ghostView = drag.get('ghostView');
    ghostView.$().addClass('borderless') ;
  },
  
  insertionIndexForLocation: function(loc, dropOperation) {
    var idx = sc_super();
    var index = idx[0];
    
    var itemView = this.itemViewForContentIndex(index);
    var modelObject = itemView.get('content');
    if (modelObject && !modelObject.treeItemChildren) {
      var parentFolder = modelObject.get('folder');
      index = this.get('content').indexOf(parentFolder);
    }
    
    return [index, idx[1]];
  },
            
  _selectionDidChange: function() {
    var selectedObject = this.getPath('selection.firstObject');
    if (selectedObject) {
      var content = this.get('content');
      var itemView = this.itemViewForContentObject(selectedObject);
      var beginEditingSelection = this.get('beginEditingSelection');
      if (beginEditingSelection) { 
        itemView.beginEditing();
        this.set('beginEditingSelection', NO);
      }
    }
  }.observes('selection'),
  
  didReload: function() {
    if (this._needsScrollToSelection === YES) {
      var selectedObject = this.getPath('selection.firstObject');

      if (selectedObject) {
        var content = this.get('content');
        var itemView = this.itemViewForContentObject(selectedObject);
        itemView.scrollToVisible();
        this._needsScrollToSelection = NO;
      }
    }
  },
  
  _cv_performSelectAction: function(view, ev, delay, clickCount) {
    
    var disclosureState;
    if (view) disclosureState = view.get('disclosureState');
    var allowActionOnFolder = this.get('allowActionOnFolder');
    
    if (allowActionOnFolder || (!allowActionOnFolder && disclosureState === SC.LEAF_NODE)) {
      sc_super();
    }
  },
    
  ghostForColumn: function(column) {
		var nowShowing = this.get('nowShowing'),
			el = document.createElement('div');
			
		nowShowing.forEach(function(idx) {
		  var view = this.viewForCell(idx, column);
		  if (view)
		  {
		    if (view.get)
		    {
		      var layer=view.get('layer');
  			  el.appendChild(layer.cloneNode(YES));
			  }
			  else
			  {
			    if (view.cloneNode)
			    {
			      el.appendChild(view.cloneNode(YES));
			    }
			  }
		  }
		}, this);
		
		el.className = "column-" + column + " ghost";
		
		return el;
	},
	
	viewForCell: function(idx,column){
	  var row = this.itemViewForContentIndex(idx);
	  if (row && row.childViews && row.childViews.length>column)
	  {
	    return row.childViews[column];
	  }
	}
	
});

