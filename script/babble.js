;(function() {
  var _babble = J.GetNamespace('J.Apps.Babble');
  

  _babble.Collection = function(rootEl) {
    // The root element of the interface...
    this._rootEl = rootEl;

    // Panel containing status message from the auth process
    this._auth_status_msg = rootEl.find('.bbl-auth-status');
    
    // Overlay that shows selected tweets...
    this._callout = rootEl.find('.bbl-callout');
    this._callout_visible = (this._callout.hasClass('bbl-hidden') === false);
    
    // The UI in which a new tweet is composed
    // Usually consists of a text box, confirm and cancel buttons
    // and a character count for the tweet
    this._composer = null;
    
    // We send a new tweet when this button is clicked
    this._composer_confirm = null;
    
    // Button that cancels the composition of a Tweet
    this._composer_cancel = null;
    
    // The textarea containing the tweet content
    this._focussed_tweet_text_box = null;
    
    // An element containing the character count of the tweet
    // being edited
    this._focussed_tweet_char_count = null;
    
    
    // Panel containing tags extracted from the Tweet stream
    this._tag_panel = rootEl.find('.bbl-ticker');
    this._selected_entity = null;
    
    this._timeline_panel = rootEl.find('.bbl-home');
    this._mentions_panel = rootEl.find('.bbl-mentions');
    this._messages_panel = rootEl.find('.bbl-messages');
    this._switcher = rootEl.find('.bbl-switcher');

    J.Mixin(this, J.Tagging.MxTagSource);

    var _notifications = J.Notifications;
    if (_notifications) {
      _notifications.Subscribe('j.twitter.have_user', $.proxy(this, '_have_user'));
      _notifications.Subscribe('j.twitter.have_timeline', $.proxy(this, '_have_home_timeline'));
      _notifications.Subscribe('j.twitter.have_mentions', $.proxy(this, '_have_mentions'));
      _notifications.Subscribe('j.twitter.have_messages', $.proxy(this, '_have_messages'));
      _notifications.Subscribe('j.twitter.not_authenticated', $.proxy(this, '_not_authenticated'));
      _notifications.Subscribe('j.twitter.authenticated', $.proxy(this, '_did_authenticate'));
    } else {
      console.warn('Babble: Cannot find notifications center won\'t be able to do much');
    }
    
    
    // Used to listen to changes in the content of a tweet composer text box
    this.__tweet_text_changed = $.proxy(this, '_tweet_text_changed');
    

    this._rootEl.on('click', '.bbl-refresh-button', $.proxy(this, '_do_refresh'));
    this._rootEl.on('focus', '.bbl-timeline-ctrls.bbl-tweet-box .bbl-text-area', $.proxy(this, '_new_tweet_focused'));
    this._rootEl.on('focus', '.bbl-tweet-box .bbl-text-area', $.proxy(this, '_composer_focused'));
    this._rootEl.on('click', '.bbl-tweet-box .bbl-dlg.confirm', $.proxy(this, '_send_tweet'));
    this._rootEl.on('click', '.bbl-tweet .bbl-dlg-cancel', $.proxy(this, '_cancel_tweet'));
    this._rootEl.on('click', '.bbl-timeline-ctrls .bbl-dlg-cancel', $.proxy(this, '_cancel_tweet'));
    this._rootEl.on('click', '.bbl-tweet-reply', $.proxy(this, '_start_reply'));
    this._rootEl.on('click', '.bbl-tweet-retweet', $.proxy(this, '_start_retweet'));
    this._rootEl.on('click', '.bbl-tag',$.proxy(this, '_select_tag'));
    this._callout.on('click', '.bbl-closer', $.proxy(this, '_close_callout'));
    this._switcher.on('click', '.bbl-switch', $.proxy(this, '_switch_panels'));
    
   
    this._tagging_vm = { _tags: this._tagging._tags, _selected: ko.observable([]) };
    var twitter_vm = J.Twitter.Instance.ViewModel;
    var that = this;
    this._tag_panel.each(function() { ko.applyBindings(that._tagging_vm, this); });
    this._rootEl.find('.bbl-callout').each(function() { ko.applyBindings(twitter_vm, this); });
    this._rootEl.find('.bbl-twitter-content').each(function() { ko.applyBindings(twitter_vm, this); });
  };
  
  _babble.Collection.prototype = {
    _did_authenticate: function() {
      this._rootEl.removeClass('bbl-authenticating')
        .removeClass('bbl-not-authenticated')
        .removeClass('bbl-need-auth')
        .addClass('bbl-authenticated');
    },
    
    _not_authenticated: function() {
      this._rootEl.
      addClass('bbl-need-auth').
      addClass('bbl-not-authenticated').
      removeClass('bbl-authenticating');
      this._auth_status_msg.text('Sign in to Twitter...');
    },
    
    _have_user: function(user) {
      this._did_authenticate();
      J.Twitter.Instance.Refresh();
    },
    
    _have_home_timeline: function(not_name, source, timeline) {
      this._rootEl.removeClass('bbl-refreshing');
      this._timeline_panel.find('time.bbl-timestamp').timeago();
      
      this._collect_tags(timeline, 'text', J.Tagging.POS_Types['proper noun']);
    },
    _have_mentions: function(not_name, source, timeline) {
      this._mentions_panel.find('time.bbl-timestamp').timeago();
    },
    _have_messages: function(not_name, source, messages) {
      this._messages_panel.find('time.bbl-timestamp').timeago();
    },
    
    
    _do_refresh: function(e){
      this._rootEl.addClass('bbl-refreshing');
      J.Twitter.Instance.Refresh();
    },
    
    
    
    // Show the reply UI for the selected tweet
    _start_reply: function(e) {
      var el = $(e.currentTarget);
      var tweet_rep = el.parents('.bbl-tweet:first');

      if (tweet_rep.length === 0) {
        console.warn('Could not get tweet when starting reply!');
        return;
      }
      
      tweet_rep.removeClass('bbl-displaying').removeClass('bbl-retweeting').addClass('bbl-replying');
      tweet_rep.find('.bbl-text-area').focus();
    },
    
    
    
    
    // Show the retweet UI for the selected tweet
    _start_retweet: function(e) {
      var el = $(e.currentTarget);
      var tweet_rep = el.parents('.bbl-tweet:first');
      
      if (tweet_rep.length === 0) {
        console.warn('Could not get tweet when starting reply!');
        return;
      }

      tweet_rep.removeClass('bbl-displaying').removeClass('bbl-replying').addClass('bbl-retweeting');
    },
      

    
    // The new tweet composer is focused
    _new_tweet_focused: function(e) {
      this._rootEl.addClass('bbl-composing');
    },


    // #region Tweet composition
    _composer_focused: function(e) {
      var text_area = $(e.currentTarget);
      this._composer = text_area.parents('.bbl-tweet-box:first');
      
      // Stop listening to any previous composer box
      if (this._focussed_tweet_text_box !== null)
        this._focussed_tweet_text_box.off('keyup', this.__tweet_text_changed);
        
      this._focussed_tweet_text_box = text_area;
      
      this._focussed_tweet_text_box.on('keyup', this.__tweet_text_changed);
      
      this._focussed_tweet_char_count = this._composer.find('.bbl-tweet-count');
      
      this._move_caret_to_end(text_area[0]);
      this._tweet_text_changed(e);
    },

    
    // This madness simply moves the caret to the end of a text area.
    // Javascript is awesome!
    _move_caret_to_end: function(ta) {
      if (typeof ta.selectionStart === "number") {
        ta.selectionStart = ta.selectionEnd = ta.value.length;
      } else if (typeof ta.createTextRange !== "undefined") {
        ta.focus();
        var range = ta.createTextRange();
        range.collapse(false);
        range.select();
      }
    },
    
    // The user has changed the text in the Tweet box - update the count
    // element
    _tweet_text_changed: function(e) {
      var ta = this._focussed_tweet_text_box;
      if (ta === null)
        return;
      
      var tc = this._focussed_tweet_char_count;
      if (tc === null)
        return;
      
      var text = ta.val();
      var count = 140 - text.length;
      
      tc.text(''+count);
      if (count < 0)
        this._composer.addClass('bbl-over-count');
      else
        this._composer.removeClass('bbl-over-count');
    },


    // The user wants to send a tweet...
    _send_tweet: function(e) {
      // NOTE: Can't use this._composer since the button clicked is not necc.
      // in the focussed composer
      var composer = $(e.currentTarget).parents('.bbl-tweet-box:first');
      
      var text_area = composer.find(".bbl-text-editor");
      var text = text_area.val();
      
      // reply_id will remain undefined if this is a new tweet (since jQuery will not
      // find a .bbl-tweet element)
      var reply_id = composer.parents('.bbl-tweet:first').attr('data-tweetid');
      
      J.Twitter.Instance.Tweet(text, reply_id);
    },


    // A tweet composition has been cancelled...
    _cancel_tweet: function(e){
      // NOTE: Can't use this._composer since the button clicked is not necc.
      // in the focussed composer
      var src = $(e.currentTarget);
      var composer = src.parents('.bbl-tweet-box:first');
      var text_area = composer.find('.bbl-text-area');
      var default_txt = text_area.attr('data-default') || "";
      
      text_area.val(default_txt);
      
      // If this is the new-tweet composer then switch of composing mode,
      // otherwise switch off reply/retweet mode...
      if (composer.hasClass('bbl-timeline-ctrls')) {
        this._rootEl.removeClass('bbl-composing');
      } else {
        src.parents('.bbl-tweet:first').removeClass('bbl-replying').removeClass('bbl-retweeting').addClass('bbl-displaying');
      }
    },

    // #endregion Tweet composition
    
    
    // Tag selection
    
    _select_tag: function(e) {
      console.log('hello');
      var trigger = $(e.currentTarget);
      var idx = $(e.currentTarget).attr('data-index');
      if (idx === undefined) {
        console.warn('Tag does not have an index');
        return;
      }
      
      var tagged_tweets = this._tagging._tags()[idx].items;
      var twitter = J.Twitter.Instance;
      twitter.SelectTweets(tagged_tweets, e.shiftKey);
      
      
      if (twitter.ViewModel.SelectedTweets().length > 0 && this._callout_visible === false) {
        this._callout.removeClass('bbl-hidden');
        this._callout_visible = true;
      }
      
      if (e.shiftKey === false)
        this._tag_panel.find('.bbl-selected').removeClass('bbl-selected');
        
      trigger.addClass('bbl-selected');
      
      this._callout.find('time.bbl-timestamp').timeago();
    },
    
    _close_callout: function() {
      this._rootEl.find('.bbl-tag.bbl-selected').removeClass('bbl-selected');
      this._callout.addClass('bbl-hidden');
      this._callout_visible = false;
    },
    

        
    // panel transitions
    
    _switch_panels: function(e) {
      var trigger = $(e.currentTarget);
      var panel = trigger.attr('data-panel');
      switch (panel) {
        case 'home':
          this._position_panels(0, 500, 1000);
          break;
        case 'mentions':
          this._position_panels(-500, 0, 500);
          break;
        case 'messages':
          this._position_panels(-1000, -500, 0);
          break;
        default:
          console.error("Don't know how to transition to " + panel);
          break;
      }
      
      this._switcher.find('.bbl-selected').removeClass('bbl-selected');
      trigger.addClass('bbl-selected');
    },
    
    // Not exactly elegant....
    _position_panels: function(timeline, mentions, messages) {
      this._timeline_panel.css('left', timeline + 'px');
      this._mentions_panel.css('left', mentions + 'px');
      this._messages_panel.css('left', messages + 'px');
    }
    
  };


}());