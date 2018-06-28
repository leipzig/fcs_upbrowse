'use strict';
/*!
 * @version: 1.1.1
 * @name: grid
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'emojionearea';
import * as Ps from 'perfect-scrollbar';

$(function () {
    $('.chat-reply-area').emojioneArea({
        pickerPosition: 'top',
        filtersPosition: 'bottom',
        tonesStyle: 'square',
        saveEmojisAs: 'shortname',
        events: {
            focus: function (editor: any, event: any) {
                let $_scroll = $(editor).parent().find('.emojionearea-scroll-area');
                if($_scroll.length) {
                    Ps.initialize($_scroll.get(0), {
                        theme: 'main-theme',
                        minScrollbarLength: 40
                    });
                }
            }
        }
    });
});
