var chart;
var trailing;
var sma = simple_moving_averager(15);
var countlower = 0;
var lastpoint = -100;
var lowpointtrackchange = 7;

require('conf.js')

function requestData() {
    setTimeout(requestData, 1000);

    if (!chart)
        return;

    var series = chart.series[0],
        shift = series.data.length > 20;

    var point = Math.random();
    var timenow = Date.now()
    var sma_point = sma(point);

    // add the point
    chart.series[0].addPoint([timenow, sma_point], true, shift);
    chart.series[1].addPoint([timenow, point], true, shift);

    if (sma_point < lastpoint){
      countlower++;
      if (countlower >= lowpointtrackchange){
        countlower = 0;
        //switch track
        apiswf.rdio_next();
        chart.series[2].addPoint([timenow, sma_point], true, shift);
      }
    }

    lastpoint = sma_point;
}

function simple_moving_averager(period) {
    var nums = [];
    return function(num) {
        nums.push(num);
        if (nums.length > period)
            nums.splice(0,1);  // remove the first element of the array
        var sum = 0;
        for (var i in nums)
            sum += nums[i];
        var n = period;
        if (nums.length < period)
            n = nums.length;
        return(sum/n);
    }
}

$(document).ready(function() {
  chart = new Highcharts.Chart({
          chart: {
              renderTo: 'eeg',
              defaultSeriesType: 'spline'
              // ,
              // events: {
              //     load: requestData
              // }
          },
          title: {
              text: 'Happiness Level'
          },
          xAxis: {
              type: 'datetime',
              tickPixelInterval: 150,
              maxZoom: 20 * 1000
          },
          yAxis: {
              minPadding: 0.05,
              maxPadding: 0.05,
              title: {
                  text: '',
                  margin: 20
              }
          },
          series: [{
            text:'',
              data: [],
              id: 'dataseries'
          },{
            text:'',
              data: []
          }]
      });
});

var socket;
        var data2 = [];
        if ( !window.WebSocket ) {
            window.WebSocket = window.MozWebSocket;
        }
        if ( window.WebSocket ) {
            var reconnectInterval = 1000 * 60;
            var connect = function () {
                var count = 0;

                socket = new WebSocket( conf.neurosteer );
                socket.onmessage = function ( event ) {
                    record = eval( "(" + event.data + ")" ); // convert to JSON

                    console.log(  record.features );

                    var series = chart.series[0],
                        shift = series.data.length > 20;
                    var point = record.features.h1;
                    var timenow = Date.now()
                    var sma_point = sma(point);

                    // add the point
                    chart.series[0].addPoint([timenow, sma_point], true, shift);
                    chart.series[1].addPoint([timenow, point], true, shift);

                    if (sma_point < lastpoint){
                      countlower++;
                      if (countlower >= lowpointtrackchange){
                        countlower = 0;
                        //switch track
                        apiswf.rdio_next();
                        chart.series[2].addPoint([timenow, sma_point], true, shift);
                      }
                    }

                    lastpoint = sma_point;

                };
                socket.onopen = function ( event ) {
                    var ta = document.getElementById( 'responseText' );
                    console.log(   "Web Socket opened!" );
                };
                socket.onerror = function () {
                    console.log( 'socket error' );
                    setTimeout( connect, reconnectInterval );
                };
                socket.onclose = function ( event ) {
                    console.log( 'socket close' );
                    var ta = document.getElementById( 'responseText' );
                    console.log(  "Web Socket closed, reconnect in " + reconnectInterval + " msec" );
                    setTimeout( connect, reconnectInterval );
                };
            };
            connect();
        } else {
            alert( "Your browser does not support Web Socket." );
        }
