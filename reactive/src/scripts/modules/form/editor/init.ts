'use strict';
/*!
 * @version: 1.1.1
 * @name: text-editor
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import './summernote';

$(function () {
    ////////////////////////
    // Text Editor
    let summernote = {height: 270};
    $('.summernote.text-edit-lite').summernote($.extend({}, summernote, {airMode: true}));
    $('.summernote.text-edit-simple').summernote($.extend({}, summernote, {
        toolbar: [
            ['font', ['bold', 'italic']],

            ['text', ['underline', 'strikethrough', 'clear']],
            ['style', ['fontsize',]],
            ['para', ['paragraph']],
            ['color', ['color']],

            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen']],
        ]
    }));
    $('.summernote.text-edit-full').summernote($.extend({}, summernote, {
        toolbar: [
            ['redo', ['undo', 'redo']],
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear',]],
            ['sub', ['subscript', 'superscript']],
            ['insert', ['link', 'picture', 'video', 'hr',]],
            ['fontname', ['fontname']],
            ['style', ['fontsize','height',]],
            ['para', ['ul', 'ol', 'paragraph', 'table']],
            ['color', ['color']],
            ['view', ['codeview', 'help', 'fullscreen']]
        ],
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather', 'Helvetica', 'Open Sans'],
        minHeight: null,
        maxHeight: null,
    }));

    $('.btn-text-edit-edit').click(function () {
        $('.summernote.text-edit-click').summernote($.extend({}, summernote, {focus: true}))
            .next('.note-editor').transition({
                animation: 'scale in up',
                onComplete: function () {
                    $(this).removeClass('transition');
                }
            });
    });
    $('.btn-text-edit-save').click(function () {
        // let text = $('.summernote.text-edit-click').summernote('code');
        $('.summernote.text-edit-click').summernote('destroy');
    });

    let emojis : string[] = [],
        emojiUrls: string[] = [];

    $('.summernote.text-edit-hint').summernote($.extend({}, summernote, {
        height: 150,
        toolbar: false,
        placeholder: 'type with apple, orange, watermelon and lemon',
        hint: [
            {
                mentions: ['ben', 'sam', 'alvin', 'david'],
                match: /\B@(\w*)$/,
                search: function (keyword: any, callback: any) {
                    callback($.grep(this.mentions, function (item: any) {
                        return item.indexOf(keyword) === 0;
                    }));
                },
                content: function (item: any) {
                    return '@' + item;
                }
            },
            {
                match: /:([\-+\w]+)$/,
                search: function (keyword: any, callback: any) {
                    callback($.grep(emojis, function (item) {
                        return item.indexOf(keyword)  === 0;
                    }));
                },
                template: function (item: any) {
                    let content = emojiUrls[item];
                    return '<img src="' + content + '" width="20" /> :' + item + ':';
                },
                content: function (item: any) {
                    let url = emojiUrls[item];
                    if (url) {
                        return $('<img />').attr('src', url).css('width', 20)[0];
                    }
                    return '';
                }
            }

        ]
    })).next('.note-editor').click(function () {
        if( !emojis.length ) {
            $.ajax({
                url: 'https://api.github.com/emojis',
                async: true
            }).then(function(data: any) {
                emojis = Object.keys(data);
                emojiUrls = data;
            });
        }
        return false;
    });

    // End Text Editor
});

