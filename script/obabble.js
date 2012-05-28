/* babble.js */
(function() {
  var _babble = J.GetNamespace('J.Apps.Babble');
  
  
  // The shared Babble application instance handles comms with the
  // Twitter proxy and finds all the Babble interfaces defined on the page.
  // Making this a singleton simplifies comms with the proxy and is good enough
  // for our purposes...
  _babble.Instance = function() {
    // The Twitter proxy we are using
    this._twitter = null;
    
    // The Babble interfaces on the current page
    this._babbles = [];
  };
  
  _babble.Instance.prototype = {
    Init: function(){
      this._twitter = J.Comm.Twitter.Default;
      if (!this._twitter)
        this._twitter = J.Comm.Twitter.CreateProxy();
        
      this._interfaces = [];
    },
    
    Start: function(){
      var babbles = $('.babble');
      var new_ifc = null;
      var Interface = J.Apps.Babble.Interface;
      
      for (var idx = babbles.length - 1; idx >= 0; idx--){
        try {
          new_ifc = new Interface(babble[idx]);
          this._interfaces.push(new_ifc);
        } catch(e) {
          console.warn('Could not create Babble interface: ' + e);
        }
      };
      
      ko.applyBindings(this._twitter.GetViewModel());
      
      this._twitter.CheckForAccount();
    }
  };

  // Logic for a Babble user interface - i.e. some DOM subtree that
  // will show a home timeline and one or more Tweet composers
  _babble.Interface = function(rootEl) {
    // Require jQuery
    // NOTE: Should this rather be a jQuery plug-in?
    if (J.IsJQueryObj(rootEl) === false)
      throw 'Root UI must be a jQuery object when constructing Babble instance';


    // The root (jQueried) DOM element of the interface
    this._rootEl = rootEl;
    
    // References the currently focused tweet composition textarea
    this._composer = null;
    this._composer_confirm = null;
    this._composer_cancel = null;
    
    // Panel containing the user's home timeline
    this._timeline_panel = null;

    // Panel containing any status message from the oauth dance
    this._auth_status_msg = null;
    
    // 
  };
}());