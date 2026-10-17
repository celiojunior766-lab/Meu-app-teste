/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "2a2c9c3e4db2706459826aa581e178f4"
  }, {
    "url": "pwa-512x512.png",
    "revision": "72b974d5336032dcf9423ae57c9888fb"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d70400768d479b62b6dd5ecbb0194cd8"
  }, {
    "url": "index.html",
    "revision": "89c21987fcf1481696c72195757b6b90"
  }, {
    "url": "icon.svg",
    "revision": "9cd99f6df1bc17abe6931fe213682a1f"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b689e02c762a03e622b16ff0e45d8ea8"
  }, {
    "url": "assets/index-IS3hwIQH.css",
    "revision": null
  }, {
    "url": "assets/index-CPu5ymkA.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b689e02c762a03e622b16ff0e45d8ea8"
  }, {
    "url": "icon.svg",
    "revision": "9cd99f6df1bc17abe6931fe213682a1f"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d70400768d479b62b6dd5ecbb0194cd8"
  }, {
    "url": "pwa-512x512.png",
    "revision": "72b974d5336032dcf9423ae57c9888fb"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "2a2c9c3e4db2706459826aa581e178f4"
  }, {
    "url": "manifest.webmanifest",
    "revision": "aaf51201295b004dc8cfccc1340f01ec"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
