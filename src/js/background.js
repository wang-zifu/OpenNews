// all the referers we can use
const referers = {
    facebook: "https://facebook.com",
    googleNews: "https://news.google.com",
    google: "https://google.com/"
};

// new http header parameters to override
function generateHeader(site) {
    var referer;

    if (site.referer == null)
        referer = referers[Object.keys(referers)[Math.floor(Math.random() * Object.keys(referers).length)]];
    else
        referer = referers[site.referer];

    var baseHeader = {
        referer: {
            name: "Referer",
            value: referer,
        },
        cookie: {
            name: "Cookie",
            value: ""
        },
        cachecontrol: {
            name: "Cache-Control",
            value: "max-age=0"
        }
    };

    return baseHeader;
}

// sites with blocking strategy
const sites = {
    "washingtonpost.com": {
        js: ["*://*.washingtonpost.com/*pwapi/*.js*", "*://*.washingtonpost.com/*drawbridge/drawbridge.js?_*"]
    },
    "wsj.com": {
        url: "*://*.wsj.com/*",
        js: ["*://sts3.wsj.net/iweb/static_html_files/cxense-candy.js", "*://tags.tiqcdn.com/utag/wsjdn/wsj/prod/utag*"],
        referer: "google"
    },
    "ft.com": {
        url: "*://*.ft.com/*"
    },
    "nytimes.com": {
        url: "*://*.nytimes.com/*",
        js: ["*://meter-svc.nytimes.com/meter.js*", "*://cdn.optimizely.com/public/*/s/vi_article.js"],
        referer: "google"
    },
    "bloomberg.com": {
        url: "*://*.bloomberg.com/*",
        js: ["*://*.bwbx.io/s3/fence/v4/app.bundle.js"]
    },
    "bizjournals.com": {
        url: "*://*.bizjournals.com/*",
        js: ["*://*.bizjournals.com/dist/js/58.min.js?*"],
        cookies: true
    },
    "philly.com": {
        url: "*://*.philly.com/*",
        cookies: true
    },
    "kleinezeitung.at": {
        url: "*://*.kleinezeitung.at/*",
        cookies: true
    },
    "theglobeandmail.com": {
        url: "*://*.theglobeandmail.com/*",
        js: ["*://*.theglobeandmail.com/pb/gr/c/default/*/story-bundle-js/*.js*"]
    },
    "nydailynews.com": {
        url: "*://*.nydailynews.com/*",
        js: ["*://*.tribdss.com/reg/tribune/*"]
    },
    "mercurynews.com": {
        url: "*://*.mercurynews.com/*",
        js: ["*://*.mercurynews.com/_static/*.js"],
        cookies: true
    },
    "wired.com": {
        url: "*://*.wired.com/*",
        cookies: true
    },
    "medium.com": {
        url: "*://*.medium.com/*",
        js: ["*://cdn-static-1.medium.com/_/fp/gen-js/main-notes.bundle.*.js"]
    },
    "bostonglobe.com": {
        url: "*://*.bostonglobe.com/*",
        js: ["*://meter.bostonglobe.com/js/meter.js"]
    },
    "newyorker.com": {
        url: "*://*.newyorker.com/*",
        cookies: true
    },
    "latimes.com": {
        url: "*://*.latimes.com/*",
        js: ["*://*.tribdss.com/meter/*"]
    },
    "theage.com.au": {
        url: "*://*.theage.com.au/*",
        cookies: true
    },
    "chicagotribune.com": {
        url: "*://*.chicagotribune.com/*",
        cookies: true
    },
    "hbr.org": {
        url: "*://*.hbr.org/*",
        js: ["*://*.hbr.org/resources/js/*"]
    },
    "economist.com": {
        url: "*://*.economist.com/*",
        cookies: true
    },
    "seattletimes.com": {
        url: "*://*.seattletimes.com/*",
        js: ["*://*.matheranalytics.com/*"],
        cookies: true
    },
    "dn.se": {
        url: "*://*.dn.se/*",
        js: ["*://auth.dn.se/*"]
    },
    "barrons.com": {
        url: "*://*.barrons.com/*",
        cookies: true
    },
    "dailypress.com": {
        url: "*://*.dailypress.com/*",
        js: ["*://*.tribdss.com/meter/*"]
    },
    "denverpost.com": {
        url: "*://*.denverpost.com/*",
        js: ["*://*.matheranalytics.com/*"],
        cookies: true
    },
    "dynamed.com": {
        url: "*://*.dynamed.com/*",
        cookies: true
    },
    "newyorker.com": {
        url: "*://*.newyorker.com/*",
        cookies: true
    },
    "technologyreview.com": {
        url: "*://*.technologyreview.com/*",
        js: ["*://cdn.technologyreview.com/_/dist/js/article.js?v=*"]
    },
    "foreignpolicy.com": {
        url: "*://*.foreignpolicy.com/*",
        js: ["*://validate.onecount.net/js/all.min.js"],
        cookies: true
    },
    "sun-sentinel.com": {
        url: "*://*.sun-sentinel.com/*",
        js: ["*://ssor.tribdss.com/*"]
    },
    "businessinsider.com": {
        url: "*://*.businessinsider.com/*",
        js: ["*://*.tinypass.com/*"]
    },
    "vanityfair.com": {
        url: "*://*.vanityfair.com/*",
        js: ["*://*.vanityfair.com/verso/static/presenter-articles.*.js"]
    }
};

// extract all script urls we want to block
var scriptURLs = Object.values(sites).map(site => site.js).filter(Array.isArray).reduce((prev, curr) => prev.concat(curr), []);

// extract all main_frame urls we want to override
var mainFrameURLs = Object.values(sites).map(site => site.url).filter(url => url);

// extract all cookie based blocking
var cookieBasedURLs = Object.values(sites).filter(site => {
    return site.cookies == true
}).map(site => site.url);

// add firefox and edge support with the global `browser` object #5
browser = typeof browser !== "undefined" ? browser : chrome;

// script blocking
browser.webRequest.onBeforeRequest.addListener(function(details) {
    var url = new URL(details.url).hostname
    console.log(`OpenNews [DEBUG]: Blocking Paywall Javascripts from ${url}`);
    return {
        cancel: true
    };
}, {
    urls: scriptURLs,
    types: ["script"]
}, ["blocking"]);

// WSJ blocking
browser.webRequest.onBeforeRequest.addListener(function(details) {
    if (details.url.indexOf("mod=rsswn") !== -1) {
        return;
    }

    var url = new URL(details.url);
    var searchParams = new URLSearchParams(url.search);

    searchParams.set('mod', 'rsswn');
    url.search = searchParams.toString();

    cleanedURL = url.toString();

    console.log("OpenNews [DEBUG]: Redirecting WSJ from " + details.url);

    return {
        redirectUrl: cleanedURL
    };
}, {
    urls: [sites["wsj.com"].url],
    types: ["main_frame"]
}, ["blocking"]);

// header blocking
browser.webRequest.onBeforeSendHeaders.addListener(function(details) {
    var url = new URL(details.url).hostname
    const newHeader = generateHeader(sites[url]);
    console.log(`OpenNews [DEBUG]: Modifying Request Headers on ${url}.`);
    // remove existing referer and cookie
    for (let i = 0; i < details.requestHeaders.length; i++) {
        if (details.requestHeaders[i].name === newHeader.referer.name || details.requestHeaders[i].name === newHeader.cookie.name) {
            details.requestHeaders.splice(i, 1);
            i--;
        }
    }
    // add new referer
    details.requestHeaders.push(newHeader.referer);
    // remove cache
    details.requestHeaders.push(newHeader.cachecontrol);
    return {
        requestHeaders: details.requestHeaders
    };
}, {
    urls: mainFrameURLs,
    types: ["main_frame"]
}, ["blocking", "requestHeaders", "extraHeaders"]);

// cookie blocking
browser.webRequest.onCompleted.addListener(function(details) {
    var url = new URL(details.url).hostname;
    var baseURL = url.replace("www", ""); // temporay work around
    browser.cookies.getAll({
        domain: baseURL
    }, function(cookies) {
        for (var i = 0; i < cookies.length; i++) {
            console.log(`OpenNews [DEBUG]: Clearing Cookies After Load from ${url}`);
            browser.cookies.remove({
                url: (cookies[i].secure ? "https://" : "http://") + cookies[i].domain + cookies[i].path,
                name: cookies[i].name
            });
        }
    });
}, {
    urls: cookieBasedURLs
});

// analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-124175680-1']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();