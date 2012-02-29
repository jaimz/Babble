/* babble.js */


(function() {
	var Babble = J.CreateNamespace('J.Apps.Babble');
	
  // Create an object implementing the Babble interface
	// TODO: This should be an object, not a closure...
	Babble.Create = function(rootEl) {
    // The rool DOM element of teh interface
		var _rootEl = rootEl;
		
    // The text area in which a new tweet is composed
		var _composer = null;

    // We send a new tweet when this buttonis clicked
		var _composer_confirm = null;

    // Button to cancel the copmosition of a Tweet
		var _composer_cancel = null;
		
    // The panel containing the user's home timeline
		var _timeline_panel = null;

    // The panel containig status messages from the auth process
		var _auth_status_msg = null;
		
    // The Babble application instance
		var _app = Babble.App;

    // Shortcut to the Twitter proxy used by the app
		var _twitter = Babble.App.Twitter;
		

    // The currently focused tweet textarea
		var _tweet_text_box = null;
    // The element displaying the number of characters left in the
    // tweet/reply the user is composing...
		var _tweet_count = null;
		

    // The overlay veil containing selected tweets
    var _call_out = null;
    var _call_out_visible = false;
    
    // The panel containing selected phrases from the tweet stream
    var _ticker_panel = null;
    // The selected phrases that have been, err, selected
    var _selected_entity = null;


    // Refresh the user's hometimeline...
    var _do_refresh = function() {
      _rootEl.addClass('bbl-refreshing');
      _twitter.UpdateHomeTimeline();
    };
    
    // Called when we have received the home timeline from the twitter
    // proxy
    var _have_home_timeline = function() {
      _rootEl.removeClass('bbl-refreshing');
    };


    // Called when we find the user is not authenticated with Twitter...
		var _not_authenticated = function(k, s, d) {
		  _rootEl.addClass('bbl-need-auth').addClass('bbl-not-authenticated').removeClass('bbl-authenticating');
		  _auth_status_msg.text('Sign in to Twitter...');
		};
		
    
    // Called when the user authenticates with Twitter...
    var _did_authenticate = function() {
      _rootEl.removeClass('bbl-authenticating').removeClass('bbl-not-authenticated').removeClass('bbl-need-auth').addClass('bbl-authenticated');
    };
    

    // Called when we have received the user's Twitter profile...
    var _have_user = function(user) {
      _did_authenticate();
      _twitter.UpdateHomeTimeline();
    };


    // Show the reply UI for the selected tweet
		var _show_reply_ui = function() {
		  var tweet_rep = $(this).parents('.bbl-tweet');
		  if (tweet_rep.length === 0) {
		    console.warn('Could not get tweet when starting reply!');
		    return;
		  }
		  
		  tweet_rep.removeClass('bbl-displaying').removeClass('bbl-retweeting').addClass('bbl-replying');
		  tweet_rep.find('.bbl-text-area').focus();
		};
		


    // Send a reply to the given tweet
		var _do_tweet_reply = function() {
		  var tweet_rep = $(this).parents('.bbl-tweet');
		  if (tweet_rep.length === 0) {
		    console.warn('Could not get tweet rep when starting reply!');
		    return;
		  }
		  
 		  var reply_to_id = tweet_rep.attr('data-tweetid');
		  if (!reply_to_id) {
		    console.warn("Can't get tweet ID when retweeting");
		    return;
		  }

      var ta = tweet_rep.find('.bbl-text-area');
      if (ta.length === 0) {
        console.warn('Babble._do_tweet_reply: Could not find tweet text when replying');
        return;
      }
      
      var text = ta.val();
      if (!text) {
        console.warn('Babble._do_tweet_reply: No text when replying');
        return;
      }
      
      tweet_rep.removeClass('bbl-replying').addClass('bbl-displaying');

      _twitter.Tweet(text, reply_to_id);
		};
		


    // Show the retweet UI for the selected tweet
		var _show_retweet_ui = function() {
 		  var tweet_rep = $(this).parents('.bbl-tweet');
		  if (tweet_rep.length === 0) {
		    console.warn('Could not get tweet when starting reply!');
		    return;
		  }
		  

		  tweet_rep.removeClass('bbl-displaying').removeClass('bbl-replying').addClass('bbl-retweeting');
		};
		

    // Retweet the selected tweet
		var _do_retweet = function() {
		  var tweet_rep = $(this).parents('.bbl-tweet');
		  if (tweet_rep.length === 0) {
		    console.warn('Could not get tweet rep when retweeting!');
		    return;
		  }
		  
		  var id = tweet_rep.attr('data-tweetid');
		  if (!id) {
		    console.log('Could not get tweet ID when retweeting');
		    return;
		  }
		  
		  tweet_rep.removeClass('bbl-retweeting').addClass('bbl-displaying');
		  

		  _twitter.Retweet(id);
		};


    // Hide the retweet/reply UI on the selected tweet...		
		var _cancel_dialog = function() {
		  var tweet_rep = $(this).parents('.bbl-tweet');
		  if (tweet_rep.length === 0) {
		    console.warn('Could not get tweet when cancelling dialog.');
		    return;
		  }
		  
		  tweet_rep.removeClass('bbl-replying').removeClass('bbl-retweeting').addClass('bbl-displaying');
		};
		

    // Called when the content of a tweet composition/reply changes - 
    // updates the character count left
    var _tweet_text_changed = function() {
      var text = _tweet_text_box.val();
      var l = text.length;
      count = 140 - l;

      _tweet_count.text('' + count);
      if (count < 0)
        _tweet_box.addClass('bbl-over-count');
      else
        _tweet_box.removeClass('bbl-over-count');
    };

    
    // The user has changed focus from one tweet textarea to another - make sure
    // we update the correct character counts
		var _refocus_tweet_count = function(ta) {
		  _tweet_box = $(ta).parents('.bbl-tweet-box');
		  if (_tweet_box.length === 0)
		    return;
		    
		  _tweet_count = _tweet_box.find('.bbl-tweet-count');
		  if (_tweet_text_box)
		    _tweet_text_box.off('keyup', _tweet_text_changed);

		  _tweet_text_box = $(ta);
		  _tweet_text_box.on('keyup', _tweet_text_changed);
		  
		  _tweet_text_changed();
		};

		
    // A tweet composer/reply composer has been focused, show the 
    // correct elements
		var _composer_focused = function() {
		  _rootEl.addClass('bbl-composing');
		  _refocus_tweet_count(this);
		};
		
    // A composition has been cancelled - reset the UI
		var _composer_reset = function() {
		  _rootEl.removeClass('bbl-composing');
		  _composer.val('');
		};
		

    // The user wants to send a tweet...
		var _composer_confirmed = function() {
		  var tweet_text = _composer.val();
		  _composer_reset();
		  _twitter.Tweet(tweet_text);
		};
		


    // Subscribe to various notifications from the Twitter service
    var _notifications = J.Notifications;
    if (_notifications) {
      _notifications.Subscribe('j.twitter.have_user', _have_user);
      _notifications.Subscribe('j.twitter.have_timeline', _have_home_timeline);
      _notifications.Subscribe('j.twitter.not_authenticated', _not_authenticated);
      _notifications.Subscribe('j.twitter.did_auth', _did_authenticate);
    } else {
      console.warn("No notifications center when setting up Babble - won't be able to do much...");
    }



    // This madness is simply places the caret at the end of a reply
    // textarea when it is first displayed
    var _move_caret_to_end = function() {
      if (typeof this.selectionStart === "number") {
        this.selectionStart = this.selectionEnd = this.value.length;
      } else if (typeof this.createTextRange !== "undefined") {
        this.focus();
        var range = this.createTextRange();
        range.collapse(false);
        range.select();
      }
      
      _refocus_tweet_count(this);
    };


    // Show the callout veil - an overlay panel that displays some
    // temporary UI
    var _show_call_out = function() {
      if (_call_out_visible === true)
        return;
        
      _call_out.removeClass('bbl-hidden');
      _call_out_visible = true;
    };
    

    // Hide the callout veil
    var _hide_call_out = function() {
      if (_call_out_visible === false)
        return;
        
      _call_out.addClass('bbl-hidden');
      _call_out_visible = false;  
      
      if (_selected_entity !== null) {
        _ticker_panel.find('.bbl-selected').removeClass('bbl-selected');
        _selected_entity = null;
      }
    };
    
    
    // An entity (an 'interesting' phrase we have pulled out of the
    // tweet stream) has been clicked - show the tweet(s) that contained
    // the phrase.
    var _select_entity = function(e) {
      _selected_entity = $(this);
      var tid = _selected_entity.attr('data-tid');
      
      if (_selected_entity.hasClass('bbl-selected')) {
      
        // TODO: This...
//        _selected_entity.removeClass('bbl-selected');
//        _twitter.DeselectTweet(tid);
        
      } else {
      
        if (e.shiftKey === false) {
          if (_selected_entity !== null) {
            var c = _ticker_panel.find('.bbl-selected');
            c.removeClass("bbl-selected");
          }
        }
        
        _selected_entity.addClass('bbl-selected');
        
        _twitter.SelectTweet(tid, e.shiftKey);
        
        _show_call_out();
      }
    };



    // Find various bits of UI...
    _ticker_panel = _rootEl.find('.bbl-ticker');
    _composer = _rootEl.find('.bbl-timeline-ctrls .bbl-new-tweet-text textarea');
    _call_out = _rootEl.find('.bbl-callout');
    _auth_status_msg = _rootEl.find('.bbl-auth-status');
		_timeline_panel = _rootEl.find('.bbl-timeline');
		
    // Wire up the necessary events
		_rootEl.on('click', '.bbl-tweet-reply', _show_reply_ui);
		_rootEl.on('click', '.bbl-tweet-retweet', _show_retweet_ui);
		_rootEl.on('click', '.bbl-dlg-cancel', _cancel_dialog);
		_rootEl.on('click', '.bbl-send-reply', _do_tweet_reply);
		_rootEl.on('click', '.bbl-send-retweet', _do_retweet);
		_rootEl.on('focus', '.bbl-text-area', _move_caret_to_end);
		_rootEl.on('click', '.bbl-entity', _select_entity);
		_rootEl.on('click', '.bbl-callout .bbl-closer', _hide_call_out);
		_rootEl.on('click', '.bbl-refresh-button', _do_refresh);
		_rootEl.on('click', '.bbl-timeline-ctrls .bbl-dlg-activate', _composer_confirmed);
		_rootEl.on('click', '.bbl-timeline-ctrls .bbl-dlg-cancel', _composer_reset);
		_composer.on('focus', _composer_focused);
		

    // This is probably wrong - make this function a constructor
		return {};
	};


  // The Babbble app is an application instance shared by all Babbles
  // It finds all the Babble UIs on the page and holds an instance of
  // a Twitter proxy
  Babble.App = (function() {
		var _twitter = J.Comm.Twitter.Default;
		if (!_twitter)
			_twitter = J.Comm.Twitter.CreateProxy();
	 
    var _start = function () {
      var _createBabble = Babble.Create;
      var _hasTwitterAuth = J.Comm.Twitter.HasAuth;
    
      var _createBabbleJQF = (function(i, v) { _createBabble($(v)); });
      var _hasTwitterAuthJQF = (function(i, v) { _hasTwitterAuth($(v)); });

      var babbles = $('.babble');

      babbles.each(_createBabbleJQF);
      babbles.each(_hasTwitterAuthJQF);
      
      ko.applyBindings(_twitter.GetViewModel());
  
      _twitter.CheckForAccount();
    };
    
    return {
      Start: _start,
      Twitter: _twitter
    };
	}());

	
  // Start the Babble app on page load...
	$(document).ready(function() {
		Babble.App.Start();
	});
}());