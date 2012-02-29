<?php
include '../twitter/twitter-async/EpiCurl.php';
include '../twitter/twitter-async/EpiOAuth.php';
include '../twitter/twitter-async/EpiTwitter.php';
include '../twitter/twitter_secret.php';

$twitterObj = new EpiTwitter($consumer_key, $consumer_secret);
?>
<!DOCTYPE html>
<html>
  <head>
    <title>Babble</title>
    <link rel="stylesheet" href="./style/babble.css" />
    <link rel="stylesheet" href="../style/social_buttons.css" />
  </head>
  <body class='bbl-body'>
    <div style='height: 0px'>
    <svg width='0' height='0' >
      <linearGradient id="badge_gloss" gradientUnits="userSpaceOnUse" x1="0" y1="19.5498" x2="46.1357" y2="19.5498">
   			<stop  offset="0" style="stop-color:#FFFFFF;stop-opacity:0.5"/>
   			<stop  offset="1" style="stop-color:#FFFFFF;stop-opacity:0.1"/>
   		</linearGradient>
   		
   		<linearGradient id='chrome' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='48' y2='48'>
   		  <stop offset='0' style='stop-color: #ffffff; stop-opacity:0.7' />
   		  <stop offset='1' style='stop-color: #53534a; stop-opacity:1' />
   		</linearGradient>
    </svg>
    </div>
    <section class="babble bbl-authenticating">
      <header>
        <h1>Babble</h1>
      </header>
      <div class="bbl-ticker" data-bind='template: {name: "entities" }'></div>
      <div class='bbl-overlay'>
        <div class='bbl-auth-status'>checking twitter...</div>
        <div class='bbl-auth-ctrls'>
          <button class='social_buttons sb_24 sb_twitter j-twt-login'>
            <span>Sign in to twitter</span>
          </button>
          <div class='bbl-auth-help'>
            Sign in to Twitter to see your time line. Your password is sent straight to Twitter - we will not be able to see it.
          </div>
        </div>
      </div>
      <div class='bbl-callout bbl-hidden'>
        <div class='bbl-titlebar'>
          <span class='bbl-closer'>close</span>
        </div>
        <div class="bbl-card">
          <div data-bind='template: { name: "tweet" }'></div>
        </div>
      </div>
      <div class='bbl-timeline-ctrls bbl-tweet-box'>
        <div class='bbl-new-tweet-icon bbl-tweet-count'>
          140
        </div>
        <div class='bbl-new-tweet-text bbl-editor'>
            <textarea placeholder="tweet something..."></textarea>
          <div class='bbl-dlg-ctrls'>
            <span class='bbl-over-count-hint'>Too many characters</span>
            <span class='bbl-dlg-activate bbl-send-tweet'>tweet</span>
          </div>
        </div>
        <div class='bbl-tweet-ctrls'>
          <div class='bbl-refresh-button'>refresh</div>
          <div class='bbl-refresh-prog'>refreshing</div>
          <div class='bbl-dlg-ctrls bbl-dlg-cancel'>cancel</div>
        </div>
      </div>
      <div class="bbl-timeline" data-bind='template: { name: "timeline" }'>
      </div>
    </section>
    
    <?php include_once('./templates/selected_tweets.php') ?>
    <?php include_once('./templates/entities.php') ?>
    <?php include_once('./templates/timeline.php') ?>
    
    <script>
      TwitterAuthUrl = "<?= $twitterObj->getAuthenticateUrl(null, array('oauth_callback' => 'http://www.thebitflow.com/twitter/twitter_confirm.php')) ?>";
    </script>
    <script src='http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'></script>
    <script type="text/javascript" src='../script/jquery.tmpl.js'></script>
    <script type="text/javascript" src='../script/knockout-2.0.0.js'></script>
    <script type="text/javascript" src='../script/jspos/lexicon.js'></script>
    <script type="text/javascript" src='../script/jspos/lexer.js'></script>
    <script type="text/javascript" src='../script/jspos/POSTagger.js'></script>
    <script type="text/javascript" src='../script/base.js'></script>
    <script type="text/javascript" src='../script/notification_center.js'></script>
    <script type="text/javascript" src='../twitter/otwitter.js'></script>

    <script type="text/javascript" src='./script/babble2.js'></script>
  </body>
</html>