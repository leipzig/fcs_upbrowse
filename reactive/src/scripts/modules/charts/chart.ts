'use strict';
/*!
 * @version: 1.1.1
 * @name: chart
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import {ChartHelper} from './chart-helper';
import * as Chart from 'chartjs';
import 'waypoints/lib/jquery.waypoints.js';

$(function () {
    ////////////////////
    // Chart js global settings
    Chart.defaults.global.defaultFontSize = 10;
    Chart.defaults.global.defaultFontFamily = `'Open Sans', 'sans-serif'`;
    Chart.defaults.global.defaultFontColor = '#797d7d';
    Chart.defaults.global.responsiveAnimationDuration = 0;
    Chart.controllers.LineWithLimits = Chart.controllers.line.extend({
        updateElement: function (point: any, index: any, reset: any) {
            Chart.controllers.line.prototype.updateElement.apply(this, arguments);
            let data = this.getDataset().data;
            let max = Math.max.apply(null, data);
            $('#max').text(max);
            let min = Math.min.apply(null, data);
            $('#min').text(min);
        },
        draw: function() {
            Chart.controllers.line.prototype.draw.apply(this, arguments);

            let me = this;
            let meta = me.getMeta();
            let points = meta.data || [];
            let area = me.chart.chartArea;
            let ilen = points.length;
            let data = this.getDataset().data;
            let max = Math.max.apply(null, data);
            let min = Math.min.apply(null, data);

            // Draw the points
            for (let i = 0; i < ilen; ++i) {
                if (data[points[i]._index] === max) {
                    points[i]._model.backgroundColor = points[i]._model.borderColor = '#9a2e12';
                    points[i]._model.radius = 6;
                } else if (data[points[i]._index] === min) {
                    points[i]._model.backgroundColor = points[i]._model.borderColor = '#498033';
                    points[i]._model.radius = 6;
                }
                points[i].draw(area);
            }
        },

    });

    let charts: any = [];
    let wayPoint: any = {
        offset: '75%'
    };

    let chartOptions: any = {
        testResults: {
            type: 'line',
            data: {
                labels: ['#10', '#11', '#12', '#13', '#14', '#15', '#16'],
                datasets: [
                    {
                        label: 'Failed',
                        backgroundColor: '#9a2e12', pointHitRadius: 20, pointRadius: 0, borderColor: '#9a2e12',
                        data: [37, 44, 17, 33, 46, 39, 24]
                    },
                    {
                        label: 'Passed',
                        backgroundColor: '#ba9d2b', pointHitRadius: 20, pointRadius: 0, borderColor: '#ba9d2b',
                        data: [51, 78, 40, 60, 79, 55, 89]
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'bottom',
                    labels: {boxWidth: 12, fontSize: 12, padding: 30}
                },
                elements: {
                    line: {tension: 0.35, fill: true,}
                },
                scales: {
                    xAxes: [{
                        position: 'bottom', type: 'category',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#e0e6e6', display: true, drawBorder: false,},
                    }],
                    yAxes: [{
                        type: 'linear', position: 'left',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], borderDashOffset: 0.0, drawBorder: false, drawTicks: false},
                        ticks: {padding: 15, min: 0, max: 150, stepSize: 30}
                    }],
                }
            }
        },
        totalStore: {
            type: 'doughnut',
            data: {
                labels: ['Last Week', 'This Week', 'Expenses'],
                datasets: [{
                    data: [201430, 65460, 85520],
                    backgroundColor: ['#498033', '#345c24', '#eff5f6']
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'left',
                    labels: {boxWidth: 14, fontSize: 12}
                }
            }
        },
        totalAffiliate: {
            type: 'doughnut',
            data: {
                labels: ['Last Week', 'This Week', 'Expenses'],
                datasets: [{
                    data: [45530, 6300, 5200 ],
                    backgroundColor: ['#3a5190', '#223056', '#eff5f6']
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'left',
                    labels: {boxWidth: 14, fontSize: 12}
                }
            }
        },
        officeTime1: {
            type: 'doughnut',
            plugins: [ChartHelper.getCirclePlugin()],
            data: {
                labels: ['Planning', 'Designing', 'Coding', 'Testing', 'Deploying'],
                datasets: [{
                    data: [10, 50, 30, 20, 10],
                    backgroundColor: ['#e6eff3', '#ba9d2b', '#3a5190', '#498033', '#9a2e12']
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'right',
                    labels: {boxWidth: 12, fontSize: 12}
                }
            }
        },
        officeTime2: {
            type: 'polarArea',
            data: {
                labels: ['Planning', 'Designing', 'Coding', 'Testing', 'Deploying'],
                datasets: [{
                    data: [10, 30, 30, 20, 10],
                    backgroundColor: ['#e6eff3', '#ba9d2b', '#3a5190', '#498033', '#9a2e12',],
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'left',
                    labels: {boxWidth: 12, fontSize: 12}
                }
            }
        },
        officeTime3: {
            type: 'pie',
            plugins: [ChartHelper.getCirclePlugin()],
            data: {
                labels: ['Planning', 'Designing', 'Coding', 'Refactoring', 'Testing', 'Deploying'],
                datasets: [{
                    data: [10, 30, 30, 20, 10],
                    backgroundColor: ['#e6eff3', '#ba9d2b', '#3a5190', '#498033', '#9a2e12']
                }]
            },
            options: {
                maintainAspectRatio: false,
                elements: {},
                legend: { display: false },
            }
        },
        officeTime4: {
            type: 'radar',
            data: {
                labels: ['Planning', 'Designing', 'Coding', 'Refactoring', 'Testing', 'Deploying'],
                datasets: [{
                    label: 'Product 1',
                    data: [30, 30, 60, 30, 45, 55],
                    backgroundColor: 'rgba(49, 69, 122, .7)',
                    borderColor: 'rgba(49, 69, 122, 1)'
                }, {
                    label: 'Product 2',
                    data: [10, 50, 20, 50, 70, 30],
                    backgroundColor: 'rgba(73, 128, 51, .7)',
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'left',
                    labels: {boxWidth: 12, fontSize: 12, padding: 15}
                }
            }
        },
        officeTime5: {
            type: 'pie',
            data: {
                labels: ['Planning', 'Designing', 'Coding', 'Testing', 'Deploying'],
                datasets: [{
                    data: [150, 30, 30, 20, 20],
                    backgroundColor: ['#e6eff3', '#ba9d2b', '#3a5190', '#498033', '#9a2e12',],
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'bottom',
                    labels: {boxWidth: 12, fontSize: 12}
                }
            }
        },
        bubbleChart: {
            type: 'bubble',
            data: {
                labels: ['Planning', 'Designing', 'Coding', 'Refactoring', 'Testing', 'Deploying'],
                datasets: [{
                    label: 'Product 1',
                    data:  [{x:24, y: 32, r: 8}, {x:14, y: 22, r: 8}, {x:10, y: 18, r: 8}, {x:4, y: 16, r: 8}, {x:4, y: 4, r: 8}, {x:12, y: 16, r: 8}, {x:4, y: 10, r: 8}, {x:6, y: 4, r: 8}, {x:0, y: 2, r: 8}, {x:12, y: 8, r: 8}, {x:9, y: 16, r: 8}, {x:7, y: 9, r: 8}, {x:11, y: 1, r: 8}, {x:17, y: 6, r: 8}, {x:22, y: 12, r: 8}, {x:15, y: 24, r: 8}, {x:9, y: 18, r: 8}, {x:3, y: 14, r: 8}, {x:3, y: 9, r: 8}, {x:9, y: 5, r: 8}, {x:25, y: 19, r: 8}, {x:14, y: 13, r: 8}, {x:5, y: 7, r: 8}, {x:2, y: 1, r: 8}, {x:6, y: 5, r: 8}, {x:15, y: 18, r: 8}, {x:7, y: 8, r: 8}, {x:2, y: 4, r: 8}, {x:5, y: 2, r: 8}, {x:10, y: 8, r: 8}, {x:7, y: 6, r: 8}, {x:2, y: 0, r: 8}, {x:8, y: 6, r: 8}, {x:7, y: 12, r: 8}, {x:10, y: 18, r: 8}, {x:2, y: 12, r: 8}, {x:7, y: 6, r: 8}, {x:11, y: 2, r: 8}, {x:15, y: 2, r: 8}, {x:20, y: 8, r: 8}, {x:3, y: 18, r: 8}, {x:8, y: 8, r: 8}, {x:12, y: 4, r: 8}, {x:18, y: 2, r: 8}, {x:19, y: 8, r: 8}, {x:4, y: 10, r: 8}, {x:3, y: 6, r: 8}, {x:8, y: 5, r: 8}, {x:14, y: 7, r: 8}, {x:19, y: 17,  r: 8}],
                    backgroundColor: 'rgba(49, 69, 122, .7)',
                    borderColor: 'rgba(49, 69, 122, 1)'
                }, {
                    label: 'Product 2',
                    data: [{y: 29, x: 27,  r: 8}, {y: 9, x: 5, r: 8}, {y: 24, x: 22, r: 8}, {y: 5, x: 7, r: 8}, {y: 2, x: 2, r: 8}, {y: 4, x: 26, r: 8}, {y: 25, x: 29, r: 8}, {y: 8, x: 5, r: 8}, {y: 9, x: 26, r: 8}, {y: 8, x: 8, r: 8}, {y: 2, x: 0, r: 8}, {y: 22, x: 2, r: 8}, {y: 25, x: 28, r: 8}, {y: 20, x: 28, r: 8}, {y: 4, x: 4, r: 8}, {y: 20, x: 8, r: 8}, {y: 4, x: 20, r: 8}, {y: 25, x: 24, r: 8}, {y: 24, x: 23, r: 8}, {y: 24, x: 7, r: 8}, {y: 0, x: 2, r: 8}, {y: 3, x: 6, r: 8}, {y: 7, x: 22, r: 8}, {y: 22, x: 2, r: 8}, {y: 9, x: 28, r: 8}, {y: 4, x: 20, r: 8}, {y: 22, x: 22, r: 8}, {y: 7, x: 6, r: 8}, {y: 27, x: 6, r: 8}, {y: 3, x: 9, r: 8}, {y: 22, x: 8, r: 8}, {y: 25, x: 2, r: 8}, {y: 8, x: 6, r: 8}, {y: 3, x: 28, r: 8}, {y: 7, x: 9, r: 8}, {y: 6, x: 4, r: 8}, {y: 2, x: 22, r: 8}, {y: 3, x: 24, r: 8}, {y: 7, x: 6, r: 8}, {y: 20, x: 28, r: 8}, {y: 28, x: 2, r: 8}, {y: 29, x: 8, r: 8}, {y: 2, x: 4, r: 8}, {y: 6, x: 5, r: 8}, {y: 22, x: 26, r: 8}, {y: 20, x: 8, r: 8}, {y: 5, x: 2, r: 8}, {y: 24, x: 32, r: 8}, {y: 7, x: 8, r: 8}, {y: 22, x: 4, r: 8}],
                    backgroundColor: 'rgba(73, 128, 51, .7)',
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true, position: 'bottom',
                    labels: {boxWidth: 12, fontSize: 12, padding: 15}
                }
            }
        },
        visits: {
            type: 'line',
            data: {
                labels: ['Sun', '', 'Mon', '', 'Tue', '', 'Wed', '', 'Thu', '', 'Fri', '', 'Sat'],
                datasets: [
                    {
                        label: 'Australia',
                        pointStyle: 'circle', pointRadius: 0, pointHitRadius: 20, borderColor: '#498033', backgroundColor: '#498033',
                        data: [1000, 2500, 4300, 2300, 1800, 4800, 2900, 6500, 5700, 6600, 8800, 7500, 9800],
                    },
                    {
                        label: 'Eurasia',
                        pointStyle: 'circle', pointRadius: 0, pointHitRadius: 20, borderColor: '#ba9d2b', backgroundColor: '#ba9d2b',
                        data: [9000, 8000, 10300, 9300, 7800, 10800, 9900, 12500, 11700, 13600, 12800, 14100, 17800]
                    },
                    {
                        label: 'America',
                        pointStyle: 'circle', pointRadius: 0, pointHitRadius: 20, borderColor: '#9a2e12', backgroundColor: '#9a2e12',
                        data: [14000, 15000, 13300, 15300, 14800, 16800, 15900, 17500, 16700, 18600, 17800, 19500, 21800]
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                elements: {
                    line: {tension: 0, borderWidth: 3, fill: true}
                },
                legend: {
                    display: true, position: 'bottom',
                    labels: {boxWidth: 12, fontSize: 12, padding: 30}
                },
                scales: {
                    xAxes: [{
                        position: 'bottom', type: 'category',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#e0e6e6', display: true, drawBorder: false},
                    }],
                    yAxes: [{
                        type: 'linear', position: 'right',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], borderDashOffset: 0.0, drawBorder: false, drawTicks: false},
                        ticks: {padding: 15, min: 0, max: 30000, stepSize: 6000,}
                    }],
                }
            }
        },
        storeAffiliate: {
            type: 'line',
            data: {
                labels: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                datasets: [
                    {
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        pointStyle: 'circle', pointRadius: 5, pointHitRadius: 10, pointHoverRadius: 5, borderColor: '#3a5190', pointBorderWidth: 0, pointBackgroundColor: '#3a5190',
                        data: [7800, 3900, 8500, 5700, 7600, 6800, 8100, 4800]
                    },
                    {
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        pointStyle: 'circle', pointHitRadius: 14, pointRadius: 5, pointHoverRadius: 5, borderColor: '#498033', pointBorderWidth: 0, pointBackgroundColor: '#498033',
                        data: [16800, 11900, 17500, 14700, 18600, 13800, 19500, 21800],
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                tooltips: {
                    displayColors: false,
                },
                elements: {
                    line: {tension: 0, borderWidth: 3, fill: true},
                },
                legend: {
                    display: false, position: 'bottom',
                    labels: {boxWidth: 12, fontSize: 12, padding: 30}
                },
                scales: {
                    xAxes: [{
                        ticks: { fontSize: 12, fontColor: '#797d7d' },
                        position: 'bottom', type: 'category',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#e0e6e6', display: true, drawBorder: false},
                    }],
                    yAxes: [{
                        type: 'linear', position: 'right',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], borderDashOffset: 0.0, drawBorder: false, drawTicks: false},
                        ticks: {padding: 15, min: 0, max: 30000, stepSize: 5000, fontSize: 12, fontColor: '#797d7d' }
                    }],
                }
            }
        },
        ecommerce: {
            type: 'line',
            data: {
                labels: ['Jan 16', 'Jan 20', 'Jan 24', 'Jan 28', 'Feb 1', 'Feb 5', 'Feb 9'],
                datasets: [
                    {
                        pointStyle: ChartHelper.getPoint('#498033', '#f5f5f5'), pointHitRadius: 20, borderColor: '#498033',
                        data: [1000, 10000, 5000, 15000, 10000, 5000, 15000]
                    },
                    {
                        pointStyle: ChartHelper.getPoint('#3a5190', '#f5f5f5'), pointHitRadius: 20, borderColor: '#3a5190',
                        data: [1000, 5000, 15000, 5000, 15000, 10000, 19550]
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                elements: {
                    line: {tension: 0, borderWidth: 3, fill: false}
                },
                legend: {display: false},
                scales: {
                    xAxes: [{
                        position: 'bottom', type: 'category',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', display: false, drawBorder: false},
                    }],
                    yAxes: [{
                        type: 'linear', position: 'right',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], borderDashOffset: 0.0, drawBorder: false, drawTicks: false},
                        ticks: {padding: 15, min: 1000, stepSize: 5000}
                    }],
                }
            }
        },
        productStatistic: {
            type: 'LineWithLimits',
            plugins: [ChartHelper.getHorizontalLinePlugin()],
            horizontalLine: [{
                y: Math.max.apply(null, [10955, 6686, 15116, 10356, 15187, 9036, 12204, 9509, 14566, 10568, 15489, 10000, 11328, 16006, 6723, 9830, 9534, 15140, 3831, 8907, 9772, 20956, 7128, 15943, 17704]),
                style: '#9a2e12',
                //text: 'Max',
            }, {
                y: Math.min.apply(null, [10955, 6686, 15116, 10356, 15187, 9036, 12204, 9509, 14566, 10568, 15489, 10000, 11328, 16006, 6723, 9830, 9534, 15140, 3831, 8907, 9772, 20956, 7128, 15943, 17704]),
                //text: 'Min',
                style: '#498033'
            }],
            data: {
                labels: ['00:00', '', '', '03:00', '', '', '06:00', '', '', 'J09:00', '', '', '12:00',
                    '', '', '15:00', '', '', '18:00', '', '', '21:00', '', '', '24:00'],
                datasets: [
                    {
                        pointStyle: 'circle',  radius:	3,
                        backgroundColor: '#292d2d', pointHitRadius: 20,
                        hoverRadius: 5, hoverBorderWidth: 1,
                        data: [10955, 6686, 15116, 10356, 15187, 9036, 12204, 9509, 14566, 10568, 15489, 10000, 11328, 16006, 6723, 9830, 9534, 15140, 3831, 8907, 9772, 20956, 7128, 15943, 17704]
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                elements: {
                    line: {tension: 0, borderWidth: 2, fill: false, borderColor: '#292d2d',}
                },
                legend: {display: false},
                scales: {
                    xAxes: [{
                        position: 'bottom', type: 'category',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', display: false, drawBorder: false},
                    }],
                    yAxes: [{
                        type: 'linear', position: 'right',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], borderDashOffset: 0.0, drawBorder: false, drawTicks: false},
                        ticks: {padding: 15, min: 0, stepSize: 5000, max: 25000}
                    }],
                }
            }
        },
        statistic: {
            type: 'bar',
            data: {
                labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [
                    {
                        type: 'line', lineTension: 0, borderWidth: 4, pointRadius: 4,
                        pointBackgroundColor: '#ba9d2b', pointBorderColor: '#9a2e12', borderColor: '#9a2e12', fill: false,
                        data: [8, 25, 45, 60, 55, 70, 50, 84]
                    },
                    {
                        type: 'line', lineTension: 0, borderWidth: 3, pointRadius: 3,
                        pointBackgroundColor: '#ba9d2b', pointBorderColor: '#353b4a', borderColor: '#353b4a', fill: false,
                        data: [1, 5, 4, 8, 8, 3, 7, 5],
                    },
                    {
                        type: 'bar', backgroundColor: '#ba9d2b',
                        data: [8, 30, 50, 64, 38, 76, 60, 89]
                    }],
            },
            options: {
                maintainAspectRatio: false,
                elements: {
                    rectangle: {borderWidth: 0}
                },
                legend: {display: false},
                scales: {
                    xAxes: [{
                        position: 'bottom', categoryPercentage: .65, barThickness: 30, type: 'category',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', display: false, drawBorder: false, offsetGridLines: true},
                        ticks: {padding: 0}
                    }],
                    yAxes: [{
                        type: 'linear', position: 'right',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], borderDashOffset: 0.0, drawBorder: false, drawTicks: false},
                        ticks: {
                            padding: 15, min: 0, max: 100, stepSize: 25,
                            callback: function (value: any) {
                                return value + '%';
                            }
                        }
                    }],
                }
            }
        },
        financesChart: {
            type: 'bar',
            data: {
                labels: ['', '', ''],
                datasets: [
                    {
                        type: 'bar', backgroundColor: ['#7c682c', '#1e4b4c', '#345c24'],
                        data: [57230, 86340, 180620]
                    },
                    {
                        type: 'bar', backgroundColor: ['#ba9d2b', '#2d6f70', '#498033'],
                        data: [33200, 44000, 34000]
                    },
                    {
                        type: 'bar', backgroundColor: ['#eff5f6', '#eff5f6', '#eff5f6'],
                        data: [250000, 250000, 250000]
                    }],
            },
            options: {
                maintainAspectRatio: false,
                elements: {
                    rectangle: {borderWidth: 0}
                },
                legend: {display: false},
                scales: {
                    xAxes: [{
                        display: false,
                        stacked: true,
                        position: 'bottom', categoryPercentage: .65, barThickness: 30, type: 'category',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', display: false, drawBorder: false, offsetGridLines: true},
                        ticks: {padding: 0}
                    }],
                    yAxes: [{
                        stacked: true,
                        type: 'linear', position: 'right',
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], borderDashOffset: 0.0, drawBorder: false, drawTicks: false},
                        ticks: {
                            padding: 15, min: 0, max: 300000, stepSize: 100000,
                            callback: function (value: any) {
                                return '$ ' + value;
                            }
                        }
                    }],
                }
            }
        },
        soldProds: {
            type: 'horizontalBar',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [
                    {
                        data: [24, 45, 7, 33, 56, 39, 64],
                        backgroundColor: '#9a2e12', borderColor: 'rgba(255,99,132,1)',
                    },
                    {
                        backgroundColor: '#ba9d2b', borderColor: 'rgba(54,162,235,1)',
                        data: [-10, -5, -4, -8, -8, -3, -1],
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                elements: {
                    rectangle: {borderWidth: 0}
                },
                legend: {display: false},
                scales: {
                    yAxes: [{
                        barThickness: 10, type: 'category', stacked: true,
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#b0b6b6', borderDash: [1, 5], display: true, drawBorder: false, offsetGridLines: true,},
                        ticks: {padding: 0, }
                    }],
                    xAxes: [{
                        stacked: true,
                        gridLines: {zeroLineColor: '#d0d6d6', color: '#e0e6e6', drawBorder: false, drawTicks: false},
                        ticks: {padding: 15, stepSize: 5}
                    }],
                }
            }
        },
    };

    function getOptions(el: HTMLCanvasElement, options: any, index: string) {
        if ( index && chartOptions[index] ) options = $.extend(true, {}, options, chartOptions[index]);
        if( index === 'storeAffiliate' ) {
            // Create gradient
            let grd_store = (el).getContext('2d').createLinearGradient(el.width / 2, 0.000, el.width / 2, 450.000);

            // Add colors
            grd_store.addColorStop(0.000, 'rgba(73, 128, 51, 1)');
            grd_store.addColorStop(0.200, 'rgba(73, 128, 51, 0.1)');
            grd_store.addColorStop(0.500, 'rgba(73, 128, 51, 0.1)');
            grd_store.addColorStop(1.000, 'rgba(73, 128, 51, 0)');
            options['data']['datasets'][1]['backgroundColor'] = grd_store;
        }
        return options;
    }

    function init(el: string | Element | JQuery) {

        $(el).each(function () {
            let $this = $(this);
            let opIndex = $this.data('options');
            let options = {};
            let index = opIndex;
            let me = this;
            if( charts[index] ) return;
            charts[index] = false;
            let wayPointOptions = $.extend(true, {}, {
                handler: function () {
                    if ( !charts[index] && $(me).is(':visible') ) {
                        charts[index] = true;
                        let ctx = (<HTMLCanvasElement>this.element).getContext('2d');
                        new Chart( ctx, getOptions(<HTMLCanvasElement>this.element, options, opIndex) );
                    }
                }
            }, wayPoint );

            $this.waypoint( wayPointOptions );
        });
    }

    let $grid = $('.grid-stack');
    if($grid.length) {
        $grid.on('grid-stack-created', function () {
            init('.chart-js');
        });
    } else {
        init('.chart-js');
    }

    $('a[data-toggle="tab"]').on('shown.bs.tab', function () {
        init( $(this).attr('href') + ' .chart-js' );
    });

    $('a[data-mega="mega-dropdown"]').on('mega-dropdown-shown', function () {
        init( $(this).attr('href') + ' .chart-js' );
    });

    $('[data-ride="carousel"]').on('slid.bs.carousel', function () {
        init( $(this).find('.active .chart-js')[0] );
    })
});
