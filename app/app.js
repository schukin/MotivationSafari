(function(){

var $  = document.getElementById.bind(document);
var $$ = document.querySelectorAll.bind(document);

var App = function($el){
  this.$el = $el;
  this.load();
  this.renderAgeLoop();

  console.log("Test 1");
};

App.fn = App.prototype;

App.fn.load = function(){
  var value;

  this.dob = null;

  if (value = localStorage.dob) {
    this.dob = new Date(parseInt(value));
  }

  var lastUpdated;

  if (lastUpdated = localStorage.lastUpdated) {
    this.lastUpdated = new Date(parseInt(lastUpdated));
  }

  this.fetchHorizon();
};

App.fn.save = function(){
  if (this.dob) {
    localStorage.dob = this.dob.getTime();
    localStorage.lastUpdated = (new Date()).getTime();
  }
};

App.fn.fetchHorizon = function() {
  var app = this;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://obsr-plex-test.herokuapp.com/horizon.json", true);
  xhr.setRequestHeader("Content-Type", "*/*");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      var timestampString = resp.timestamp;
      var timestamp = new Date(timestampString);
      app.dob = timestamp;
      app.save();
      app.lastUpdatedString = '';
    } else {
      app.lastUpdatedString = app.newLastUpdatedString();
    }
  }
  xhr.send();
};

App.fn.renderAgeLoop = function(){
  this.interval = setInterval(this.renderAge.bind(this), 100);
};

App.fn.calculateAge = function(){
  var now   = new Date
  var age   = now.getFullYear() - this.dob.getFullYear();
  var mDiff = now.getMonth() - this.dob.getMonth();

  if (mDiff < 0 || (mDiff === 0 && now.getDate() < this.dob.getDate())) {
    age--;
  }

  return age;
};

App.fn.calculateMS = function(){
  var now            = new Date
  var janOne         = new Date(now.getFullYear(), 0, 1);
  var comingBirthday = new Date(this.dob.getTime());
  var ms;

  comingBirthday.setYear(now.getFullYear());
  ms = (now.getTime() - janOne.getTime()) / (comingBirthday.getTime() - janOne.getTime());

  return ms.toFixed(9).toString().split('.')[1];
};

App.fn.renderAge = function(){
  var now       = new Date();
  var duration  = this.dob - now;
  var years     = duration / 31556900000;
  var days      = duration / 86400000;

  var majorMinor = days.toFixed(9).toString().split('.');
  var app = this;
  var lastUpdatedString = this.lastUpdatedString;

  requestAnimationFrame(function(){
    this.html(this.view('age')({
      year:         majorMinor[0],
      milliseconds: majorMinor[1],
      noticeText:   lastUpdatedString
    }));
  }.bind(this));
};

App.fn.newLastUpdatedString = function() {
  if (this.lastUpdated == undefined || this.lastUpdated == null) {
    return "Last updated: never"
  }

  var now = new Date();
  var durationSinceLastUpdated = (now - this.lastUpdated) / 1000;

  durationSinceLastUpdated = 60 * 60 * 25 * 3;

  if (durationSinceLastUpdated > 5) {
    var timeAgoInWords = this.timeAgoInWords(durationSinceLastUpdated);
    var result = "Last updated: " + timeAgoInWords + " ago";
    
    if (durationSinceLastUpdated > (60 * 60 * 24)) {
      result = "WARNING: We haven't been able to contact server to get latest end time in " + timeAgoInWords + "."
    }

    return result;
  } else {
    return "";
  }
};

App.fn.timeAgoInWords = function(seconds) {
  if (seconds < 60) {
    return "" + Math.round(seconds) + " seconds";
  }

  var minutes = seconds / 60;
  if (minutes < 60) {
    return "" + Math.round(minutes) + " minutes";
  }

  var hours = minutes / 60;
  if (hours < 24) {
    return "" + Math.round(hours) + " hours";
  }

  var days = hours / 24;
  return "" + Math.round(days) + " days";
};

App.fn.$$ = function(sel){
  return this.$el.querySelectorAll(sel);
};

App.fn.html = function(html){
  this.$el.innerHTML = html;
};

App.fn.view = function(name){
  var $el = $(name + '-template');
  return Handlebars.compile($el.innerHTML);
};

window.app = new App($('app'))

})();