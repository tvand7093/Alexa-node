var request = require('request-promise'),
	parser = require('xml2js').parseString,
	Promise = require('promise');

var endpoints = {
	search: 'http://services.tvrage.com/feeds/search.php?show=',
	list_episodes: 'http://services.tvrage.com/feeds/episode_list.php?sid='
};

var shows = [];

function searchForShow(show) {
	
	return new Promise(function (fulfill, reject) {
		//first check cache
		for(var i = 0; i < shows.length; i++){
			var cachedShow = shows[i];
			if(cachedShow.name == show){
				//we want this one!
				fulfill(cachedShow);
				return;
			}
		}
		
		var url = endpoints.search + encodeURIComponent(show);
		request(url)
			.then(function (result) {
				parser(result, function (err, result) {
					if (err) reject(err);

					var array = result.Results.show;
					shows = [];
					
					for(var i = 0; i < array.length; i++){
						var show = array[i];

						shows.push({
							id: show.showid,
							name: show.name[0]
						});
					}

					fulfill(shows.length == 1 ? shows[0] : shows);

				});
			})
			.catch(reject);
	});
}

function getEpisodeCount(showId) {
	return new Promise(function (fulfill, reject) {
		var url = endpoints.list_episodes + encodeURIComponent(showId);
		
		request(url)
			.then(function(result){
				//got the show episodes!
				parser(result, function (err, result) {
					if (err) reject(err);
					
					//count episodes
					var count = 0;
					var categories = result.Show.Episodelist;

					for(var i in categories){
						//this is divided into specials and seasons
						var category = categories[i];
						var keys = Object.keys(category);
						
						for(var j = 0; j < keys.length; j++){
							var seasons = category[keys[j]];
							
							for (var k = 0; k < seasons.length; k++){
								count += seasons[k].episode.length;
							}
						}
					}

					fulfill(count);
				});
			})
			.catch(reject);
	});
}

module.exports = {
	//SEE: http://services.tvrage.com/info.php?page=main for definition or urls
	searchForShow: searchForShow,
	getEpisodeCount: getEpisodeCount
};