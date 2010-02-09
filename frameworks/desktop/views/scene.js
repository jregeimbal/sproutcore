// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Displays several views as scenes that can slide on and off the screen.  The
  scene view is a nice way to provide a simple effect of moving from a 
  higher level screen to a more detailed level screen.  You will be able to
  optionally choose the kind of animation used to transition the two scenes 
  as well if supported on the web browser.
  
  h1. Using The View
  
  To setup the scene view, you should define the 'scenes' property with an 
  array of scene names.  These will be the properties on the scene view that
  you can shift in an out of view as needed.  You can edit the scenes property
  at any time.  It will only be used when you start to transition from one
  scene to another.
  
  Next you should set your nowShowing property to the name of the scene you 
  would like to display.  This will cause the view to transition scenes if it
  is visible on screen.  Otherwise, it will simply make the new scene view 
  the current content view and that's it.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SceneView = SC.ContainerView.extend(
  /** @scope SC.SceneView.prototype */ {

  /**
    Array of scene names.  Scenes will slide on and off screen in the order
    that you specifiy them here.  That is, if you shift from a scene at index
    2 to a scene at index 1, the scenes will animation backwards.  If you
    shift to a scene at index 3, the scenes will animate forwards.
    
    The default scenes defined are 'master' and 'detail'.  You can replace or 
    augment this array as you like.
    
    @property {Array}
  */
  scenes: ['master', 'detail'],

  /**
    The currently showing scene.  Changing this property will cause the 
    scene view to transition to the new scene.  If you set this property to 
    null, an empty string, or a non-existant scene, then the scene will appear
    empty.
  */
  nowShowing: null,
  
  /**
    Speed of transition.  Should be expressed in msec.
  */
  transitionDuration: 200,
  
  _transitions:{
    left:0.2
  },
  
  init: function()
  {
    sc_super();
    this.get('_transitions').left=this.get('transitionDuration')/1000;
  },

  /** @private
  
    Whenever called to change the content, save the nowShowing state and 
    then animate in by adjusting the layout.
    
  */
  replaceContent: function(content) {
    if (content) this.animateScene(content);
    else this.replaceScene(content);
    return this ;
  },

  /** @private
  
    Invoked whenever we just need to swap the scenes without playing an
    animation.
  */
  replaceScene: function(newContent) {
    var oldContent = this._targetView,
        layout     = this.STANDARD_LAYOUT,
        scenes     = this.get('scenes'),
        idx        = scenes ? scenes.indexOf(this.get('nowShowing')) : -1;

    // cleanup animation here too..
    this._targetView = newContent ;
    this._targetIndex  = idx;
    
    this._leftView = this._rightView = this._start = this._end = null;
    
    this.removeAllChildren();
    
    var isAnimatable=false;

    if (oldContent) {
      if (oldContent.get('isAnimatable'))
      {
        isAnimatable=true;
        oldContent.disableAnimation();
      }
      oldContent.set('layout', layout);
      if (isAnimatable)
      {
        oldContent.updateStyle();
        oldContent.enableAnimation();
      }
    }
    
    isAnimatable=false;
    if (newContent) {
      if (newContent.get('isAnimatable'))
      {
        isAnimatable=true;
        newContent.disableAnimation();
      }
      newContent.set('layout', layout);
      if (isAnimatable)
      {
        newContent.updateStyle();
        newContent.enableAnimation();
      }
    }
    
    if (newContent) this.appendChild(newContent);
  },

  /** @private
  
    Invoked whenever we need to animate in the new scene.
  */
  animateScene: function(newContent) {
    var oldContent = this._targetView,
        outIdx     = this._targetIndex,
        scenes     = this.get('scenes'),
        inIdx      = scenes ? scenes.indexOf(this.get('nowShowing')) : -1,
        layout;

    if (outIdx<0 || inIdx<0 || outIdx===inIdx) {
      return this.replaceScene(newContent);
    }

    this._targetView = newContent ;
    this._targetIndex = inIdx; 
    
    //check if _targetView isAnimatable, mixin SC.Animatable if not
    if (!this._targetView.get('isAnimatable'))
    {
      SC.mixin(this._targetView, SC.Animatable);
    }

    // setup views
    this.removeAllChildren();

    if (oldContent) 
    { 
      this.appendChild(oldContent);
      if (SC.none(oldContent.get('transitions')))
      {
        oldContent.set('transitions',this.get('_transitions'));
      }
      this._slideOffScreen(oldContent,outIdx,inIdx);
    }
    if (newContent) 
    {
      this.appendChild(newContent);
      if (SC.none(newContent.get('transitions')))
      {
        newContent.set('transitions',this.get('_transitions'));
      }
      this._slideOnScreen(newContent,outIdx,inIdx);
    }

  },

  /** @private - standard layout assigned to views at rest */
  STANDARD_LAYOUT: { top: 0, left: 0, bottom: 0, right: 0 },
  
  //This method makes the view come on screen from the right
  _showFromRight: function(target){
    target.disableAnimation();
    target.adjust('left', screen.width+1);
    target.updateLayout();
    target.enableAnimation();
    target.adjust('left',0); 
  },
  
  //This method makes the view go off screen to the right
  _hideToRight: function(target){
    target.disableAnimation();
    target.adjust("left", 0);
    target.updateLayout();
    target.enableAnimation();
    target.adjust('left',screen.width+1);
  },
  
  //This method makes the view come on screen from the left
  _showFromLeft: function(target){
    target.disableAnimation();
    target.adjust("left", 0-screen.width-1);
    target.updateLayout();
    target.enableAnimation();
    target.adjust('left',0);
  },
  
  //This method makes the view go off screen to the left
  _hideToLeft: function(target){
    target.disableAnimation();
    target.adjust("left", 0);
    target.updateLayout();
    target.enableAnimation();
    target.adjust('left',0-screen.width-1);
  },
  
  // This method makes a view come on screen and decides whether it should come in from the left or right
  _slideOnScreen: function(target,previousSlideNumber,currentSlideNumber){
    if (previousSlideNumber<currentSlideNumber)
    {
      this._showFromLeft(target);
    }
    else
    {
      this._showFromRight(target);
    }
  },
  
  // This method makes a view go off screen and decides whether it should go to the left or to the right
  _slideOffScreen: function(target,previousSlideNumber,currentSlideNumber){
    
    if (previousSlideNumber<currentSlideNumber){
      this._hideToLeft(target);
    }
    else
    {
      this._hideToRight(target);
    }
  },
  
  _transitions:{
    left:0.2
  }
  
});
