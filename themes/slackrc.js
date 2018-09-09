/**
 * The preload script needs to stay in regular ole JavaScript, because it is
 * the point of entry for electron-compile.
 */

const allowedChildWindowEventMethod = [
  'windowWithTokenBeganLoading',
  'windowWithTokenFinishedLoading',
  'windowWithTokenCrashed',
  'windowWithTokenDidChangeGeometry',
  'windowWithTokenBecameKey',
  'windowWithTokenResignedKey',
  'windowWithTokenWillClose'
];

if (window.location.href !== 'about:blank') {
  const preloadStartTime = process.hrtime();

  require('./assign-metadata').assignMetadata();
  if (window.parentWebContentsId) {
    //tslint:disable-next-line:no-console max-line-length
    const warn = () => console.warn(`Deprecated: direct access to global object 'parentInfo' will be disallowed. 'parentWebContentsId' will be available until new interface is ready.`);
    Object.defineProperty(window, 'parentInfo', {
      get: () => {
        warn();
        return {
          get webContentsId() {
            warn();
            return parentWebContentsId;
          }
        };
      }
    });
  }

  const { ipcRenderer, remote } = require('electron');

  ipcRenderer
    .on('SLACK_NOTIFY_CHILD_WINDOW_EVENT', (event, method, ...args) => {
      try {
        if (!TSSSB || !TSSSB[method]) throw new Error('Webapp is not fully loaded to execute method');
        if (!allowedChildWindowEventMethod.includes(method)) {
          throw new Error('Unsupported method');
        }

        TSSSB[method](...args);
      } catch (error) {
        console.error(`Cannot execute method`, { error, method }); //tslint:disable-line:no-console
      }
    });

  ipcRenderer
    .on('SLACK_REMOTE_DISPATCH_EVENT', (event, data, origin, browserWindowId) => {
      const evt = new Event('message');
      evt.data = JSON.parse(data);
      evt.origin = origin;
      evt.source = {
        postMessage: (message) => {
          if (!desktop || !desktop.window || !desktop.window.postMessage) throw new Error('desktop not ready');
          return desktop.window.postMessage(message, browserWindowId);
        }
      };

      window.dispatchEvent(evt);
      event.sender.send('SLACK_REMOTE_DISPATCH_EVENT');
    });

  const { init } = require('electron-compile');
  const { assignIn } = require('lodash');
  const path = require('path');

  const { isPrebuilt } = require('../utils/process-helpers');

  //tslint:disable-next-line:no-console
  process.on('uncaughtException', (e) => console.error(e));

  /**
   * Patch Node.js globals back in, refer to
   * https://electron.atom.io/docs/api/process/#event-loaded.
   */
  const processRef = window.process;
  process.once('loaded', () => {
    window.process = processRef;
  });

  window.perfTimer.PRELOAD_STARTED = preloadStartTime;

  // Consider "initial team booted" as whether the workspace is the first loaded after Slack launches
  ipcRenderer.once('SLACK_PRQ_TEAM_BOOT_ORDER', (_event, order) => {
    window.perfTimer.isInitialTeamBooted = order === 1;
  });
  ipcRenderer.send('SLACK_PRQ_TEAM_BOOTED'); // Main process will respond SLACK_PRQ_TEAM_BOOT_ORDER

  const resourcePath = path.join(__dirname, '..', '..');
  const mainModule = require.resolve('../ssb/main.ts');
  const isDevMode = loadSettings.devMode && isPrebuilt();

  init(resourcePath, mainModule, !isDevMode);
}

// First make sure the wrapper app is loaded
document.addEventListener("DOMContentLoaded", function() {

   // Then get its webviews
   let webviews = document.querySelectorAll(".TeamView webview");

   // Fetch our CSS in parallel ahead of time
   const cssPath = 'https://raw.githubusercontent.com/mallowigi/slack-one-dark-theme/master/custom.css';
   let cssPromise = fetch(cssPath).then(response => response.text());

   let customCustomCSS = `
   :root {
     /* Modify these to change your theme colors: */
     --primary: #ffffff;
     --text: #13c35b;
     --background: #191919;
     --background-elevated: #232323;
     --accent: #545454;
   }

   .c-scrollbar__hider {
     background: none !important;
   }

   .client_main_container #client_body .c-message__sender_link {
     color: #f5f5f5 !important;
   }

   .client_main_container #client_body .c-timestamp__label {
    color: #a0a0a0 !important;
   }

   .c-message--light .c-message__gutter, .c-message--light .c-message__label__gutter {
    display: none !important;
   }

   .c-message--light .c-message__content {
     margin-left: 40px !important;
   }

   .client_channels_list_container #col_channels .p-channel_sidebar__link:hover, .client_channels_list_container #col_channels .p-channel_sidebar__link:link, .client_channels_list_container #col_channels .p-channel_sidebar__link:visited, .client_channels_list_container #col_channels .p-channel_sidebar__channel:hover, .client_channels_list_container #col_channels .p-channel_sidebar__channel:link, .client_channels_list_container #col_channels .p-channel_sidebar__channel:visited {
      color: rgb(121, 191, 148) !important;
   }

   .client_channels_list_container #col_channels .p-channel_sidebar__link--selected .c-presence, .client_channels_list_container #col_channels .p-channel_sidebar__channel--selected .c-presence {
      color: lime !important;
   }

   .client_channels_list_container #col_channels .p-channel_sidebar__link--selected, .client_channels_list_container #col_channels .p-channel_sidebar__channel--selected {
      background: #272727 !important;
      border: solid #545454;
      border-width: 1px 1px 1px 0;
      border-radius: 0 20px 20px 0;
    }

    .p-channel_sidebar__name .c-custom_status {
      display: none !important;
    }

    .c-message__sender .c-custom_status {
      display: none !important;
    }

    .client_channels_list_container #col_channels .p-channel_sidebar__section_heading {
       color: #c1c1c1 !important;
    }

    .client_main_container #client_body .c-message_list__day_divider__label__pill {
      color: #afafaf !important;
    }

    .p-channel_sidebar__channel--unread:not(.p-channel_sidebar__channel--muted):not(.p-channel_sidebar__channel--selected) .p-channel_sidebar__name, .p-channel_sidebar__link--unread:not(.p-channel_sidebar__link--selected) .p-channel_sidebar__name, .p-channel_sidebar__link--invites:not(.p-channel_sidebar__link--dim) .p-channel_sidebar__name, .p-channel_sidebar__section_heading_label--clickable:hover, .p-channel_sidebar__section_heading_label--unreads, .p-channel_sidebar__quickswitcher:hover {
     color: #7aff7a !important;
   }

   #messages_container {
     margin-bottom: 15px !important;
     border-bottom: 1px dashed gray !important;
   }

   .client_main_container .ql-container .ql-editor p {
     color: lime !important;
   }

   .c-message_list__day_divider__line {
     border-top: 1px dashed #e8e8e8 !important;
   }

   img {
     background: black !important;
     filter: brightness(80%) !important;
   }

   .c-message_attachment__border {
     background-color: #383838 !important;
   }

   pre {
     background: #222 !important;
     color: #819e7c !important;
     border-color: #333 !important;
   }

   .c-message_list__unread_divider__separator {
    border-color: lime !important;
   }

   .c-message_list__unread_divider__label {
      background: #1c711c !important;
      color: #c5c5c5 !important;
   }

   .client_channels_list_container #col_channels .p-channel_sidebar__badge {
     border: 1px solid;
     background-color: #2d982d !important;
     border-color: #2d982d !important;
     color: #ffffff !important;
   }

   .c-mrkdwn__mention, .c-mrkdwn__member--mention, .c-mrkdwn__broadcast--mention, .c-mrkdwn__subteam--mention, .c-mrkdwn__member--link, .c-mrkdwn__subteam--link, ts-mention {
     background: rgb(32, 64, 31);
     color: lime !important;
     padding: 2px 8px !important;
   }

   a, a:link, a:visited {
     color: lime !important;
   }

   .c-member_slug--link {
     background: #353535 !important;
     padding: 2px 3px !important;
   }

   .client_main_container #client_body .c-message_list__day_divider__label__pill {
     background: #222 !important;
   }

   .light_theme .emoji-only {
     background: var(--background);
     opacity: 0.6;
   }

   .emoji-sizer {
     -webkit-filter: drop-shadow(1px -2 0 var(--background)) drop-shadow(-1px 0 0 var(--background)) drop-shadow(0 1px 0 var(--background)) drop-shadow(0 -1px 0 var(--background))
   }

   #client_body:not(.onboarding):not(.feature_global_nav_layout):before {
     box-shadow: none;
     background: var(--background);
   }

   #msgs_overlay_div {
     background: var(--background) !important;
   }

   #notification_banner {
     background: var(--background) !important;
     border: 1px solid #3a3a3a;
   }

   #notification_banner:before {
     background: var(--background) !important;
     border-bottom: 1px solid #2b2b2b !important;
   }

   .messages_banner_image_wrapper {
     background: var(--background) !important;
   }

   #threads_view_banner.messages_banner {
     background: #545454 !important;
     border: none;
   }

   .clear_unread_messages {
     border-left: 1px solid #646465;
   }

   .p-message_pane .p-message_pane__top_banners:not(:empty)+div .c-message_list.c-virtual_list--scrollbar>.c-scrollbar__hider:before, .p-message_pane .p-message_pane__top_banners:not(:empty)+div .c-message_list:not(.c-virtual_list--scrollbar):before {
     box-shadow: 0 32px var(--background);
   }

   .p-message_pane__unread_banner__close--detached {
     background: #168616;
     border-left: 1px solid #509c4c;
   }
   `

   // Insert a style tag into the wrapper view
   cssPromise.then(css => {
      let s = document.createElement('style');
      s.type = 'text/css';
      s.innerHTML = css + customCustomCSS;
      document.head.appendChild(s);
   });

   // Wait for each webview to load
   webviews.forEach(webview => {
      webview.addEventListener('ipc-message', message => {
         if (message.channel == 'didFinishLoading')
            // Finally add the CSS into the webview
            cssPromise.then(css => {
               let script = `
                     let s = document.createElement('style');
                     s.type = 'text/css';
                     s.id = 'slack-custom-css';
                     s.innerHTML = \`${css + customCustomCSS}\`;
                     document.head.appendChild(s);
                     `
               webview.executeJavaScript(script);
            })
      });
   });
});
