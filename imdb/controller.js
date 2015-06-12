var request = require('request-promise'),
	parser = require('xml2js').parseString,
	Promise = require('promise');

var endpoints = {
	search: 'http://services.tvrage.com/feeds/search.php?show=',
	list_episodes: 'http://services.tvrage.com/feeds/episode_list.php?sid='
};

function searchForShow(show) {
	return new Promise(function (fulfill, reject) {
		var url = endpoints.search + encodeURIComponent(show);
		request(url)
			.then(function (result) {
				parser(result, function (err, result) {
					if (err) reject(err);
					fulfill(result);
				});
			})
			.catch(console.error);
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