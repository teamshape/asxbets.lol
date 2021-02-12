/* globals Chart:false, feather:false */

Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
   draw: function(ease) {
	  Chart.controllers.line.prototype.draw.call(this, ease);

	  if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
		 var activePoint = this.chart.tooltip._active[0],
			 ctx = this.chart.ctx,
			 x = activePoint.tooltipPosition().x,
			 topY = this.chart.legend.bottom,
			 bottomY = this.chart.chartArea.bottom;

		 // draw line
		 ctx.save();
		 ctx.beginPath();
		 ctx.moveTo(x, topY);
		 ctx.lineTo(x, bottomY);
		 ctx.lineWidth = 1;
		 ctx.strokeStyle = '#000';
		 ctx.stroke();
		 ctx.restore();
	  }
   }
});

function random_rgba() {
	var o = Math.round, r = Math.random, s = 255;
	//return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
	return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
}

(function () {
  'use strict'

  feather.replace()

	$.get("query.json", function (data) {
		var date = [];
		var users = [];
		for (var i in data.usercount) {
			date.push(i);
			users.push(data.usercount[i]);
		}

		var ctx = document.getElementById('userChart').getContext('2d');
		var chart = new Chart(ctx, {
			type: 'LineWithLine',
			data: {
				labels: date,
				datasets: [{
					label: 'Cumulative user count',
					backgroundColor: 'rgb(255, 99, 132)',
					borderColor: 'rgb(255, 99, 132)',
					data: users,
				}]
			},
			options: {
				tooltips: {
					mode: 'index',
					axis: 'x',
					intersect: false
				},
				scales: {
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
			  		}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Users'
						}
					}]
				}
			}
		});

		var chatDate = [];
		var chatCount = [];
		for (var i in data.chatcount) {
			chatDate.push(i);
			chatCount.push(data.chatcount[i]);
		}
		var ctx = document.getElementById('chatChart').getContext('2d');
		var chart = new Chart(ctx, {
			type: 'LineWithLine',
			data: {
				labels: chatDate,
				datasets: [{
					label: 'Daily chat lines',
					borderColor: 'rgb(75, 192, 192)',
					fill: false,
					data: chatCount,
				}]
			},
			options: {
				tooltips: {
					mode: 'index',
					axis: 'x',
					intersect: false
				},
				scales: {
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Lines of chat'
						}
					}]
				}
			}
		});

		var activityDate = [];
		var activityChatCount = [];
		for (var i in data.activity) {
			activityDate.push(i);
			activityChatCount.push(data.activity[i]);
		}
		var ctx = document.getElementById('activityChart').getContext('2d');
		var chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: activityDate,
				datasets: [{
					label: 'Activity by hour',
					backgroundColor: 'rgb(255, 205, 86)',
					borderColor: 'rgb(255, 205, 86)',
					data: activityChatCount,
				}]
			},
			options: {
				scales: {
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Hour'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Lines of chat'
						}
					}]
				}
			}
		});

		var channelName = [];
		var channelChatCount = [];
		var backgroundColor = [];
		var channelNameMap = {
			'691442910100586516': 'general',
			'691430905511673917': 'day-trading',
			'691430976974225418': 'options',
			'699822043700658297': 'penny-stocks',
			'691814933243101274': 'foriegn-markets',
			'776330535076364328': 'long-term-investments',
			'737962774944284713': 'cryptocels-and-cennocoins',
			'757094952068186222': 'marvens-room',
			'754983246286028821': 'property-and-real-estate',
			'795236494347337758': 'feelings-channel',
			'739633702254018670': 'careers-advisory-101',
			'721927495569637438': 'doof-doof',
			'691624037998395453': 'server-suggestions',
			'694795348547207188': 'meme-channel',
			'691921609828597820': 'mony-where-mouth-is',
			'766627151859679252': 'developers-programmers',
			'804660470534766602': 'nsfw',
			'805409153791033355': 'fb-normie-enclosure',
			'721332319943786537': 'welcome-channel',
		};
		for (var i in data.channels) {
			if (channelNameMap[i]) {
					channelName.push(channelNameMap[i]);
					channelChatCount.push(data.channels[i]);
					backgroundColor.push(random_rgba());
			}
		}
		var ctx = document.getElementById('channelsChart').getContext('2d');
		var chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: channelName,
				datasets: [{
					label: 'Activity by channel',
					data: channelChatCount,
					backgroundColor: backgroundColor
				}]
			},
			options: {
				maintainAspectRatio: false,
			}
		});

		var holdings = [];
		var tickerPrice = [];
		var stocks = [];
		var users = [];
		var graphStocks = [];
		stocks['cash'] = {
			data: []
		};
		for (var i in data.holdings) {
			var record = data.holdings[i];
			var ticker = record.ticker;
			var amount = record.amount
			var user = record.discord_username;
			var dollars = record.dollars;
			if (!holdings[user]) {
				holdings[user] = {};
				users.push(user);
			}
			holdings[user][ticker] = amount;
			holdings[user]['cash'] = dollars;
			if (!stocks[ticker] && amount != 0) {
				stocks[ticker] = {
					data: []
				};
			}
		}
		for (var j in holdings) {
			for (var k in stocks) {
				if (k == 'cash') {
					var cash = holdings[j][k];
					stocks[k]['data'].push(cash);
				}
				else {
					if (!holdings[j][k]) {
						holdings[j][k] = "0";
						stocks[k]['data'].push("0");
					}
					else {
						var stockPrice = +(data.stockprice[k] * holdings[j][k]).toFixed(2);
						stocks[k]['data'].push(stockPrice);
					}
				}
			}
		}

		for (var l in stocks) {
			var dataObject = {
				label: l,
				backgroundColor: random_rgba(),
				data: stocks[l]['data']
			}
			graphStocks.push(dataObject);
		}

		var ctx = document.getElementById('stocksChart').getContext('2d');
		var chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: users,
				datasets: graphStocks
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					xAxes: [{
						stacked: true,
						scaleLabel: {
							display: true,
							labelString: 'User'
						}
					}],
					yAxes: [{
						stacked: true,
						ticks: {
							callback: function(value, index, values) {
								return '$' + value;
							}
						},
						scaleLabel: {
							display: true,
							labelString: 'Total value'
						}
					}]
				}
			}
		});
	});
})()

