<script type='text/html' id='timeline'>
      {{each Home}}
      <div class="bbl-tweet bbl-displaying" data-tweetid='${ id_str }'>
        <div class="bbl-tweet-rep">
          <div class="bbl-stamp">
            <div class='bbl-moz-fix' style='position: relative'>
            <svg version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="48px"
            	 height="48px" viewBox="0 0 48 48" class='bbl-user-circ bbl-curr-user-circ'>
               <pattern  width="47.994" height="47.994" patternUnits="userSpaceOnUse" id="pic_${ User().id_str }" viewBox="1 -48.994 47.994 47.994" overflow="visible">
               	<g>
               		<polygon fill="none" points="1,-1 48.994,-1 48.994,-48.994 1,-48.994 		"/>

               			<image overflow="visible" width="48" height="48" xlink:href="${ User().profile_image_url }"  transform="matrix(0.9999 0 0 0.9999 1 -48.9941)">
               		</image>
               	</g>
               </pattern>
               <g>
               	<circle fill="url(#pic_${ User().id_str })" cx="24" cy="24" r="24"/>
               	<g>

               		<path opacity="0.7" fill="url(#badge_gloss)" d="M37.749,13.714c2.899,0,5.709,0.35,8.387,0.999C42.505,6.07,33.961,0,23.999,0
               			C10.746,0,0,10.745,0,24c0,5.723,2.006,10.976,5.35,15.1C7.861,24.709,21.408,13.714,37.749,13.714z"/>
               	</g>
               	<g>
               		<g opacity="0.7">
               			<path fill="url(#chrome)" d="M23.999,2C36.131,2,46,11.869,46,24s-9.869,22-22.001,22C11.869,46,2,36.131,2,24S11.869,2,23.999,2
               				 M23.999,0C10.746,0,0,10.745,0,24c0,13.255,10.746,24,23.999,24C37.254,48,48,37.255,48,24C48,10.745,37.254,0,23.999,0
               				L23.999,0z"/>
               		</g>
               	</g>
               </g>
            </svg>


            <svg version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="48px"
            	 height="48px" viewBox="0 0 48 48" class='bbl-user-circ bbl-orig-user'>
               <pattern  width="47.994" height="47.994" patternUnits="userSpaceOnUse" id="pic_${ id_str }" viewBox="1 -48.994 47.994 47.994" overflow="visible">
               	<g>
               		<polygon fill="none" points="1,-1 48.994,-1 48.994,-48.994 1,-48.994 		"/>

               			<image overflow="visible" width="48" height="48" xlink:href="${ user.profile_image_url }"  transform="matrix(0.9999 0 0 0.9999 1 -48.9941)">
               		</image>
               	</g>
               </pattern>
               <g>
               	<circle fill="url(#pic_${ id_str })" cx="24" cy="24" r="24"/>
               	<g>

               		<path opacity="0.7" fill="url(#badge_gloss)" d="M37.749,13.714c2.899,0,5.709,0.35,8.387,0.999C42.505,6.07,33.961,0,23.999,0
               			C10.746,0,0,10.745,0,24c0,5.723,2.006,10.976,5.35,15.1C7.861,24.709,21.408,13.714,37.749,13.714z"/>
               	</g>
               	<g>
               		<g opacity="0.7">
               			<path fill="url(#chrome)" d="M23.999,2C36.131,2,46,11.869,46,24s-9.869,22-22.001,22C11.869,46,2,36.131,2,24S11.869,2,23.999,2
               				 M23.999,0C10.746,0,0,10.745,0,24c0,13.255,10.746,24,23.999,24C37.254,48,48,37.255,48,24C48,10.745,37.254,0,23.999,0
               				L23.999,0z"/>
               		</g>
               	</g>
               </g>
            </svg>
            </div>
          </div>
          <div class="bbl-tweet-msg">
            {{html _j_html_text }}
          </div>
          <div class='bbl-tweet-ctrls'>
            <div class='bbl-tweet-ctrl bbl-tweet-reply'>reply</div>
            <div class='bbl-tweet-ctrl bbl-tweet-retweet'>retweet</div>
          </div>
          <div class='bbl-reply-editor-slider'>
          <div class="bbl-reply-editor bbl-tweet-box">
            <div class="bbl-stamp bbl-tweet-count"></div>
            <div class="bbl-editor">
              <div class='bbl-text-editor'>
                <textarea class="bbl-text-area" placeholder='Reply to @${ user.name }'>@${ user.screen_name } </textarea>
              </div>
              <div class="bbl-dlg-ctrls">
                <span class='bbl-over-count-hint'>Too many characters</span>
                <span class="bbl-dlg-activate bbl-send-tweet">send reply</span>
              </div>
            </div>
            <div class="bbl-tweet-ctrls">
              <div class="bbl-dlg-ctrls bbl-dlg-cancel">cancel</div>
            </div>
          </div>
          </div>
          <div class="bbl-retweet-editor">
            <div class="bbl-stamp"></div>
            <div class="bbl-editor">
              <div class="bbl-dlg-ctrls">
                <span class="bbl-dlg-activate bbl-send-retweet">send retweet</span>
              </div>
            </div>
            <div class="bbl-tweet-ctrls">
              <div class="bbl-dlg-ctrls bbl-dlg-cancel">cancel</div>
            </div>
          </div>
        </div>
      </div>
      {{/each}}
    </script>
