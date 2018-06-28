'use strict';
/*!
 * @version: 1.1.1
 * @name: weather
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import {Weather} from './weather';
import SkyCons = require('skycons');

new Weather('#weather-bg', 'assets/img/skylg.jpg');
// new Weather('#weather-single-bg', 'assets/img/skylg.jpg');

let SkyconsModule = SkyCons(window);
let Icons = new SkyconsModule({'color': '#f5f5f5'});
Icons.add('weather-icon', SkyconsModule.PARTLY_CLOUDY_DAY);
Icons.add('weather-clear-day', SkyconsModule.CLEAR_DAY);
Icons.add('weather-clear-night', SkyconsModule.CLEAR_NIGHT);
Icons.add('weather-partly-cloudy-day', SkyconsModule.PARTLY_CLOUDY_DAY);
Icons.add('weather-partly-cloudy-night', SkyconsModule.PARTLY_CLOUDY_NIGHT);
Icons.add('weather-cloudy', SkyconsModule.CLOUDY);
Icons.add('weather-rain', SkyconsModule.RAIN);
Icons.add('weather-sleet', SkyconsModule.SLEET);
Icons.add('weather-snow', SkyconsModule.SNOW);
Icons.add('weather-wind', SkyconsModule.WIND);
Icons.add('weather-fog', SkyconsModule.FOG);
Icons.play();










