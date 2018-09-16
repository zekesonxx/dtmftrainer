/* jshint esversion:6 */
(function() {
  'use strict';
  var app = angular.module('dtmftrainer', []);
  var keys = [1,2,3,4,5,6,7,8,9,0,'A','B','C','D','*','#'];
  app.controller('main', ['$scope', 'audio_player', function ($s, audio_player) {
    $s.keys = keys;
    $s.keypad = [['1', '2', '3', 'A'], ['4', '5', '6', 'B'], ['7', '8', '9', 'C'], ['*', '0', '#', 'D']];
    $s.checkedKeys = {};
    $s.playTone = function(key) {
      audio_player.playTone(key, 0.1);
    };
    $s.playSeries = function(number) {
      audio_player.playSeries(number, 0.1, 0.2);
    };
    $s.currentlyChecked = function() {
      var checked = [];
      Object.keys($s.checkedKeys).forEach((key) => $s.checkedKeys[key] ? checked.push(key) : angular.noop());
      return checked;
    };
    $s.massCheck = function(state, keys) {
      keys.forEach((key) => {
        $s.checkedKeys[key.toString()] = state;
      });
    };

    $s.challengeActive = false;
    $s.challengeLength = 4;

    $s.challengeGenerate = function() {
      var checked = $s.currentlyChecked();
      if (checked.length === 0) {
        window.alert("You have to select some keys first!");
        return;
      }

      $s.challengeCheckResult = "";
      $s.challengeAttempt = "";
      $s.challengeActive = true;
      var challenge = [];
      while (challenge.length < $s.challengeLength) {
        challenge.push(checked[Math.floor(Math.random()*checked.length)]);
      }
      $s.challengeCurrent = challenge.join('');
      $s.playSeries($s.challengeCurrent);
    };
    $s.challengeCheck = function() {
      if ($s.challengeAttempt == $s.challengeCurrent) {
        $s.challengeCheckResult = "Correct!";
        $s.challengeGenerate();
      } else {
        $s.challengeCheckResult = "Incorrect. :(";
      }
    };
  }])
  .factory('audio_player', [function() {
    var contextClass = (window.AudioContext ||
      window.webkitAudioContext ||
      window.mozAudioContext ||
      window.oAudioContext ||
      window.msAudioContext);

    if (contextClass) {
      // Web Audio API is available.
      var context = new contextClass();
    }
    var audio_player = {
      frequencies: {
      	"1": {f1: 697, f2: 1209},
      	"2": {f1: 697, f2: 1336},
      	"3": {f1: 697, f2: 1477},
      	"4": {f1: 770, f2: 1209},
      	"5": {f1: 770, f2: 1336},
      	"6": {f1: 770, f2: 1477},
      	"7": {f1: 852, f2: 1209},
      	"8": {f1: 852, f2: 1336},
      	"9": {f1: 852, f2: 1477},
      	"*": {f1: 941, f2: 1209},
      	"0": {f1: 941, f2: 1336},
      	"#": {f1: 941, f2: 1477},
        "A": {f1: 697, f2: 1633},
        "B": {f1: 770, f2: 1633},
        "C": {f1: 852, f2: 1633},
        "D": {f1: 941, f2: 1633}
      }
    };
    audio_player.playTone = function(key, duration, cb) {
      var oscillator1 = context.createOscillator();
      oscillator1.type = 'sine';
      oscillator1.frequency.value = audio_player.frequencies[key.toString()].f1;
      var gainNode = context.createGain ? context.createGain() : context.createGainNode();
      oscillator1.connect(gainNode,0,0);
      gainNode.connect(context.destination);
      gainNode.gain.value = 0.1;
      oscillator1.start ? oscillator1.start(0) : oscillator1.noteOn(0); //jshint ignore:line

      var oscillator2 = context.createOscillator();
      oscillator2.type = 'sine';
      oscillator2.frequency.value = audio_player.frequencies[key.toString()].f2;
      gainNode = context.createGain ? context.createGain() : context.createGainNode();
      oscillator2.connect(gainNode);
      gainNode.connect(context.destination);

      gainNode.gain.value = 0.1;
      oscillator2.start ? oscillator2.start(0) : oscillator2.noteOn(0); //jshint ignore:line

      setTimeout(() => {
        oscillator1.disconnect();
        oscillator2.disconnect();
        if (cb) cb();
      }, duration*1000);
    };
    audio_player.playSeries = function(series, duration, delay) {
      var keys = series.split('').reverse();
      function nextKey() {
        if (keys.length == 0) {
          return;
        }
        audio_player.playTone(keys.pop(), duration, () => setTimeout(nextKey, delay*1000));
      }
      nextKey();
    };
    console.log(audio_player);
    return audio_player;
  }]);
})();
