/**
 * tweetbot - Limited Rate Twitter Automation system
 *
 * @author    Belin Fieldson @thebelin
 * @copyright 2017 (MIT)
 */
"use strict";
// The Twitter SDK, with a config object in the twitter.json file
// Get your credentials at https://apps.twitter.com/app/new
// twitter.json file format:
/**
 * {
 *   consumer_key: '',
 *   consumer_secret: '',
 *   access_token_key: '',
 *   access_token_secret: ''
 * }
 * @type {require}
 */
const Twitter = new require('twitter')(require("./twitter")),

// This keeps us from going over the rate limit established by Twitter
  RateLimiter = require('limiter').RateLimiter,

// Allow 150 requests per hour (the Twitter search limit). Also understands
// 'second', 'minute', 'day', or a number of milliseconds
  limiter = new RateLimiter(150, 'hour'),

// limited Twitter object literal, use to call Twitter with a limit
  LimitedTwitter = {
    get: (endpoint, data, cb) => {
      cb = (cb === undefined) ? () => {} : cb;
      limiter.removeTokens(1, (err, remainingRequests) => {
        return Twitter.get(endpoint, data)
          .then(returned => cb(returned))
          .catch(error => {
            console.log("ERROR: ", endpoint, data, error);
            throw error;
          })
      });
    },
    post: (endpoint, data, cb) => {
      cb = (cb === undefined) ? () => {} : cb;
      limiter.removeTokens(1, (err, remainingRequests) => {
        return Twitter.post(endpoint, data)
          .then(returned => cb(returned))
          .catch(error => {
            console.log("ERROR: ", endpoint, data, error);
            throw error;
          })
      });
    },
    stream: (endpoint, data, cb) => {
      cb = (cb === undefined) ? () => {} : cb;
      limiter.removeTokens(1, (err, remainingRequests) => {
        return Twitter.stream(endpoint, data, cb);
      });
    }
  },

// streamhandler processes response info
  streamHandler = (stream, debugNote) => {
    // Subscribe to the tweet event
    stream.on('data', tweet => {
      // This is an example action, logging data to the console about the tweet
      console.log("\r\n" + debugNote + "# incoming tweet: %s", tweet.text);
    });

    // ... when we get an error...
    stream.on('error', error => {
      //print out the error
      console.log(error);
    });
  };
// End const declaration

/**
 * EXAMPLE USAGE:
 */

// Stream Information about an area using a bounding box
// Examples from data obtained at https://www.mapdevelopers.com/geocode_bounding_box.php
// -105.096378,40.460904,-104.944250,40.609988  Fort Collins
// North Latitude: 40.609988 South Latitude: 40.460904 East Longitude: -104.944250 West Longitude: -105.096378

// -122.75,36.8,-121.75,37.8                    San Francisco

// Fort Collins local data about web marketing
var filter = {
  track: "web marketing, social marketing, marketing",
  locations: "-105.096378,40.460904,-104.944250,40.609988"
};
// call for the streamHandler
LimitedTwitter.stream('statuses/filter', filter, stream => {
  streamHandler(stream, 'FORT COLLINS:');
});

// San Francisco Web Marketing
filter = {
  track: "web marketing",
  locations: "-122.75,36.8,-121.75,37.8"
};
// call for the streamHandler
LimitedTwitter.stream('statuses/filter', filter, stream => {
  streamHandler(stream, 'SAN FRAN:');
});

// Filters are available as streaming search result or as pages of historic results
filter = {track: "social marketing"};
// call for the streamHandler
LimitedTwitter.stream('statuses/filter', filter, stream => {
  streamHandler(stream, 'SOCIAL MARKETING:');
});

// Get a list of the list entities for this user
LimitedTwitter.get('lists/ownerships', {}, lists => {
  console.log("user's lists: ", lists);
});
