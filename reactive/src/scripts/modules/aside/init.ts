'use strict';
/*!
 * @version: 1.1.1
 * @name: aside
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import Aside from './aside';

$(function () {
    new Aside('#aside', {position: 'right', setInStorage: false,}).init();
});
