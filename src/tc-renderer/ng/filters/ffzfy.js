import angular from 'angular';

/**
 * @ngdoc filter
 * @name ffzfy
 * @type function
 *
 * @param parts {MessagePart[]}
 * @return {MessagePart[]}
 */
angular.module('tc').filter('ffzfy', function(emotesFfz) {
  var potentialEmoteRegex = /[a-zA-Z_]{3,}/g;

  function isEmote(emote, emotes) {
    return !!emotes.find((e) => e.emote === emote);
  }

  function makeEmote(url, emote) {
    return '<img class="emoticon" data-emote-name="' + emote + '" data-emote-description="FrankerFaceZ Emote" src="' + url + '">';
  }

  return function(channel, parts) {

    var emotes = emotesFfz(channel);
    var newParts = [];

    parts.forEach(function(part) {

      // if it's not plain text, ignore this bit
      if (part.isElement) {
        newParts.push(part);
        return;
      }

      var endIndexOfPreviousEmote = 0;
      var string = part.string;
      var match;

      // for each character sequence that could potentially be a string
      while ((match = potentialEmoteRegex.exec(string)) !== null) {
        // TODO refactor inefficient algorithm

        // if it's indeed an emote
        if (isEmote(match[0], emotes)) {
          // Save previous bit as a non emote
          if (match.index > endIndexOfPreviousEmote) {
            var before = string.substring(endIndexOfPreviousEmote, match.index);
            add(before, false);
          }

          // Save emote as tag
          const url = emotes.find((e) => e.emote === match[0]).url;
          const img = makeEmote(url, match[0]);
          add(img, true);

          // Track progress through string
          endIndexOfPreviousEmote = potentialEmoteRegex.lastIndex;
        }
      }

      // Check if there's string left over after the last emote, add it
      if (endIndexOfPreviousEmote < string.length) {
        add(string.substring(endIndexOfPreviousEmote), false);
      }
    });

    /** Helper */
    function add(string, isElement) {
      newParts.push({string, isElement});
    }

    return newParts;
  }
});