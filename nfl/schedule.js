///<reference path='../_references.js' />

var request = require('request');
var Promise = require('promise');
var Regex = require('regex');
var Cheerio = require('cheerio');

function scheduler() {
	this.endpoint = 'http://www.nfl.com/schedules';
	this.channels = [
		{ name: 'fox', channel: 12, spellOut: false },
		{ name: 'cbs', channel: 6, spellOut: true },
		{ name: 'espn', channel: 0, spellOut: true },
		{ name: 'nbc', channel: 8, spellOut: true }
	];
	
	
	this.__getHTML = function() {
		///<summary>Gets the NFL channel's HTML page for parsing.</summary>
		///<returns type='Promise'>A promise with the html body or the response if it had failed.</returns>
		var self = this;
		return new Promise(function(success, error){
			request(self.endpoint, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					success(body); // Show the HTML for the Google homepage. 
				}
				else {
					error(error);
				}
			});
		});
	};
	
	this.__parseHTML = function(teamName, html) {
		///<summary>Parses the HTML page and determines the channel title for which the game is on.</summary>
		///<param name='teamName' type='String'>The team to find the channel for.</param>
		///<param name='html' type='String'>The html page from the endpoint.</param>
		///<returns type='String'>The title of the channel it is on, or undefined if not yet determined.</returns>
		var $ = Cheerio.load(html);
		var games = $("div.list-matchup-row-center");
		for(var i = 0; i < games.length; i++){
			var game = games[i];
			var teams = $(game).find('span.team-name');
			
			var home = teams[0].children[0].data;
			var away = teams[1].children[0].data;
			
			if(teamName.endsWith(home) || teamName.endsWith(away)){
				//this is our game, so extract the name of the channel
				var title = $(game).find('span.nflicon');
				if(title.length > 0){
					return title[0].attribs.title;
				}
			}
		}
	};

	this.__determineChannel = function(channelName) {
		///<summary>Extracts the channel number based off of the channels title.</summary>
		///<param name='channelName' type='String'>The channel name to use for the parsing.</param>
		///<returns type='Object'>The local channel number that matches the specified channe.</returns>
		var toReturn = { name: 'Not Available', channel: -1, spellOut: false };		
		
		if(channelName == undefined){
			//game must have passed, so just return nothing.
			return toReturn;
		}
		
		channelName = channelName.toLowerCase();
		
		for(var i = 0; i < this.channels.length; i++){
			var channelInfo = this.channels[i];
			if(channelInfo.name == channelName){
				toReturn = channelInfo;
				break;
			}
		}
	
		return toReturn;
	};
	
	this.findChannel = function(teamName) {
		///<summary>Finds the channel that the next game is on for the specified team.</summary>
		///<param name='teamName' type='String'>The team to search for.</param>
		///<returns type='Promise'>A promise that represents the current operation.</returns>
		var self = this;
		return new Promise(function(success, fail){
			self.__getHTML()
				.then(function(html){
					var title = self.__parseHTML(teamName, html);
					var channel = self.__determineChannel(title);
					success(channel);
				}, fail)
				.catch(function(ex){
					fail(ex);
				});
		});
	}
}

module.exports = scheduler;