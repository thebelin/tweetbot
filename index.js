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
/*

{
  "consumer_key": "",
  "consumer_secret": "",
  "access_token_key": "",
  "access_token_secret": ""
}

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
      tweetShow(debugNote, tweet);

      // If you wanted to do other actions on each incoming tweet, they would be called here
    });

    // ... when we get an error...
    stream.on('error', error => {
      //print out the error
      console.log(error);
    });
  },

// Show a tweet's information
// This only debugs the data to the local screen,
// as opposed to taking action on the tweet
  tweetShow = (debugNote, tweet) => {
    if (tweet.in_reply_to_screen_name)
      console.log(
        "\r\n%s#%s reply to @%s - from @%s at %s:\r\n%s",
        debugNote,
        tweet.place ? tweet.place.full_name : '',
        tweet.in_reply_to_screen_name,
        tweet.user.screen_name,
        tweet.created_at,
        tweet.text);
    else if (tweet.in_reply_to_status_id_str)
      console.log(
        "\r\n%s#%s reply to status: %s - from @%s at %s:\r\n%s",
        debugNote,
        tweet.place ? tweet.place.full_name : '',
        tweet.in_reply_to_status_id_str,
        tweet.user.screen_name,
        tweet.created_at,
        tweet.text);
    else if (tweet.in_reply_to_user_id_str)
      console.log(
        "\r\n%s#%s reply to user: %s - from @%s at %s:\r\n%s",
        debugNote,
        tweet.place ? tweet.place.full_name : '',
        tweet.in_reply_to_user_id_str,
        tweet.user.screen_name,
        tweet.created_at,
        tweet.text);
    else
      console.log(
        "\r\n%s#%s tweet - from @%s at %s:\r\n%s",
        debugNote,
        tweet.place ? tweet.place.full_name : '',
        tweet.user.screen_name,
        tweet.created_at,
        tweet.text);
  },

  // Data about LaunchNOCO
  filter = {
    // These are the search parameters for the data fed to the bot
    track: "Northern Colorado, Colorado Business, Colorado Marketing, Fort Collins, NOCO, launchNOCO, LAUNCHNO.CO",
    filter_level: "low"
  };
// End const declaration

/**
 * EXAMPLE USAGE:
 */
// call for the streamHandler
LimitedTwitter.stream('statuses/filter', filter, stream => {
  streamHandler(stream, '');
});
