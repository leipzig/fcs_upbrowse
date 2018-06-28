'use strict';
/*!
 * @version: 1.1.1
 * @name: grid
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import './form/editor/summernote';

$(function () {
    $('.mail-reply-area').summernote({
        toolbar: [
            ['para', ['paragraph']],
            ['color', ['color']],

            ['font', ['bold', 'italic']],
            ['text', ['underline', 'strikethrough', 'clear']],
            ['style', ['fontsize',]],

            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen']],
        ],
        placeholder: 'Message:',
        height: 350
    });

    $('.ui.selection').on('click', '.btn', function (e: Event) {
        let $el = $($(this).data('target'));
        $(this).toggleClass('active');
        $el.toggleClass('show');
        return false;
    })
});
