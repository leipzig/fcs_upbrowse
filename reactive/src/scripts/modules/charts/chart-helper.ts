'use strict';
/*!
 * @version: 1.1.1
 * @name: chart
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import * as Moment from 'moment';
import * as Chart from 'chartjs';


export class ChartHelper {

    static getPoint(bgOne: string, bgTwo: string = 'transparent') {
        let data = `
            <svg id='point-svg' xmlns='http://www.w3.org/2000/svg' width='14' height='14'>
                <foreignObject width='100%' height='100%' >
                    <div xmlns='http://www.w3.org/1999/xhtml' >
                        <div style='height: 14px; width: 14px; border-radius: 14px; background: ${bgOne}; background: radial-gradient(ellipse at center, ${bgOne} 0%,${bgOne} 27%,${bgTwo} 27%,${bgTwo} 46%,${bgOne} 46%,${bgOne}  100%'></div>
                    </div>
                </foreignObject>
            </svg>`;
        let url = window.URL.createObjectURL(new Blob([data], {type: 'image/svg+xml'}));
        let img = new Image();
        img.src = url;
        img.onload = function () {
            URL.revokeObjectURL(url);
        };

        return img;
    }

    static getCirclePlugin() {
        return {
            beforeUpdate: function (chartInstance: any) {
                if (chartInstance.chart.width < 460) return;
                if (chartInstance.chart.height === chartInstance.chart.canvas.height) {
                    chartInstance.chart.ctx.translate(0, 50);
                }
                chartInstance.chart.height = chartInstance.chart.canvas.height - 100;
                chartInstance.legend.options.onClick = () => false;
            },

            afterDraw: function (chartInstance: any) {
                if (chartInstance.chart.width < 460) return;

                let ctx = chartInstance.chart.ctx;
                ctx.fontSize = Chart.defaults.global.defaultFontSize;
                ctx.font = `bold ${ctx.fontSize}px ${Chart.defaults.global.defaultFontFamily}`;
                ctx.textBaseline = 'bottom';

                chartInstance.data.datasets.forEach(function (dataset: any) {
                    for (let i = 0; i < dataset.data.length; i++) {
                        let model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                            mid_radius = model.outerRadius,
                            text_radius = model.outerRadius + 25,
                            start_angle = model.startAngle,
                            end_angle = model.endAngle,
                            mid_angle = start_angle + (end_angle - start_angle) / 2,
                            mx = model.x + mid_radius * Math.cos(mid_angle),
                            my = model.y + mid_radius * Math.sin(mid_angle),
                            tx = model.x + text_radius * Math.cos(mid_angle),
                            ty = model.y + text_radius * Math.sin(mid_angle);

                        ctx.fillStyle = dataset.backgroundColor[i];

                        let val = dataset.data[i];
                        let percent = String(Math.round(val / total * 100)) + ' %';

                        if (val !== 0) {
                            // ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                            ctx.beginPath();
                            ctx.moveTo(mx, my);
                            ctx.lineTo(tx, ty);
                            if (tx > model.x) {
                                ctx.textAlign = 'right';
                                ctx.lineTo(tx + 75, ty);
                                ctx.font = '13px Open-Sans';
                                if (ty > model.y) {
                                    ctx.fillText(percent, tx + 75, ty + ctx.fontSize + 15);
                                } else {
                                    ctx.fillText(percent, tx + 75, ty - 10);
                                }
                            } else {
                                ctx.textAlign = 'left';
                                ctx.lineTo(tx - 75, ty);
                                if (ty > model.y) {
                                    ctx.fillText(percent, tx - 75, ty + ctx.fontSize + 15);
                                } else {
                                    ctx.fillText(percent, tx - 75, ty - 10);
                                }
                            }
                            //ctx.lineTo(tx, ty);
                            ctx.strokeStyle = ctx.fillStyle;
                            ctx.stroke();
                        }
                    }
                });
            }
        }
    }

    static getHorizontalLinePlugin() {
        return {
            beforeDraw: function (chartInstance: any) {
                let yScale = chartInstance.scales["y-axis-0"];
                let config = chartInstance.config.horizontalLine;
                let canvas = chartInstance.chart;
                let ctx = canvas.ctx;

                if (config) {
                    for (let horizontalLine in config) {
                        let line = config[horizontalLine];
                        let style = line.style ? line.style : 'rgba(169,169,169, .6)';
                        let yValue = line.y ? yScale.getPixelForValue(line.y) : 0;

                        ctx.lineWidth = line.width ? line.width : 2;

                        if (yValue) {
                            ctx.beginPath();
                            ctx.moveTo(chartInstance.chartArea.left, yValue);
                            ctx.lineTo(chartInstance.chartArea.right, yValue);
                            ctx.strokeStyle = style;
                            ctx.stroke();
                        }

                        if (line.text) {
                            ctx.fillStyle = style;
                            ctx.fillText(line.text, chartInstance.chartArea.left + ctx.lineWidth, yValue + 10);
                        }
                    }
                    return;
                }
            }
        }
    }

    static  newDate(days: any) {
        return Moment().add(days, 'd');
    }
}
