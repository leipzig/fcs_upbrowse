'use strict';
/*!
 * @version: 1.1.1
 * @name: photo-editor
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import Controller from './controller';
import View from './view';

$(function () {
    new Controller(new View());
    $('#this-prod-images img').first().trigger('click');
});
