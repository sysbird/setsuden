$(function(){
	// グラフ描画
	google.setOnLoadCallback( drawChart );
}); 

////////////////////////////////////////////////////////////
// グラフ描画
function drawChart() {

	// 使用電力
	usage = [['時', '使用率(%)', { role: "style" }],
			[0, 0, 0],
			[1, 0, 0],
			[2, 0, 0],
			[3, 0, 0],
			[4, 0, 0],
			[5, 0, 0],
			[6, 0, 0],
			[7, 0, 0],
			[8, 0, 0],
			[9, 0, 0],
			[10, 0, 0],
			[11, 0, 0],
			[12, 0, 0],
			[13, 0, 0],
			[14, 0, 0],
			[15, 0, 0],
			[16, 0, 0],
			[17, 0, 0],
			[18, 0, 0],
			[19, 0, 0],
			[20, 0, 0],
			[21, 0, 0],
			[22, 0, 0],
			[23, 0, 0],
	];

	// 本日
	var today = new Date();
	var year = today.getFullYear();
	var mon = today.getMonth() + 1;
	var day = today.getDate();
	var today = year + "/" + ( '0' + mon ).slice( -2 ) + "/" + ( '0' + day ).slice( -2 );

	// 電気予報を取得
	get_usage_forecast( today );
}

////////////////////////////////////////////////////////////
// 電気予報を取得
function get_usage_forecast( day ) {


	// 電気予報API
	var d = day.replace(/\//g, '');
	var url = "http://setsuden.yahooapis.jp/v1/Setsuden/electricPowerForecast?appid=(あなたのアプリケーションID)&date=" + d + "&output=json&callback=?";

	$.getJSON( url,
			null, 
			callback = function( data, status ){
				$.each( data.ElectricPowerForecasts.Forecast, function( i, item ){

					// 時刻
					var hour = parseInt( item.Hour );

					// 使用率(予報)
					var ratio = ( item.Usage.$ / item.Capacity.$ ) * 100;
					ratio = Math.round( ratio );
					var color = get_color( ratio );

					// 配列に格納
					usage[ hour +1 ] = [ hour, ratio, color ];
			});

			// 電力使用状況を取得(0時からの)
			get_usage( day, 0 );
	});
}

////////////////////////////////////////////////////////////
// 電力使用状況を取得
function get_usage(day, hour) {

	if(0 == usage[hour +1][1]){

		// 電力使用状況API
		var d = day.replace( /\//g, '' );
		var h = ( '0' + hour ).slice( -2 );
			var url = "http://setsuden.yahooapis.jp/v1/Setsuden/latestPowerUsage?appid=(あなたのアプリケーションID)&area=tokyo&output=json&datetime=" + d + h + "&callback=?";

		$.getJSON( url, 
				null,
				callback = function( data, status ){
					var item = data.ElectricPowerUsage;

					// 時刻
					var hour = parseInt( item.Hour );

					// 使用率(実績)
					var ratio = ( item.Usage.$ / item.Capacity.$ ) * 100;
					ratio = Math.round( ratio );
					var color = get_color( ratio );

					// 配列に格納
					usage[ hour +1 ] = [ hour, ratio, color ];

					// 電力使用状況を取得(次の時間)
					get_usage( day, hour +1 );
			});
	}
	else{
		// グラフ
		var data = google.visualization.arrayToDataTable( usage );
		var options = {
			title: '本日の電力使用状況 : ' + day,
			hAxis: { title: '時間(時)' }
		};

		var chart = new google.visualization.ColumnChart( document.getElementById( 'chart_div' ) );
		chart.draw( data, options );
	}
}

////////////////////////////////////////////////////////////
// 配色
function get_color( ratio ) {

	var color = '#3366cc';
	if( ratio > 90 ){
		color = '#FF4500';
	}
	else if( ratio < 80 ){
		color = '#008000';
	}

	return color;
}
