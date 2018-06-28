'use strict';
/*!
 * @version: 1.1.1
 * @name: nestable
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import 'nestable';

$(function () {
    let nestableOptions = {
        expandBtnHTML: '<button data-action="expand"><i class="ion-android-add"></i></button>',
        collapseBtnHTML: '<button data-action="collapse"><i class="ion-android-remove"></i></button>',
        noDragClass: 'dd-drop',
        handleClass: 'dd-handle dd-item-handle',
    };
    $('.nestable.js-nestable-default').nestable(nestableOptions).find('.form-control-name').keyup(nestableSync);
    $('.nestable.js-nestable-handles').nestable($.extend({}, nestableOptions, {
        dragClass: 'nestable-handles dd-dragel',
        handleClass: 'dd-item-handle',
    })).find('.form-control-name').keyup(nestableSync);

    let json = [
        {
            "id": 1,
            "content": "First item",
            "classes": ["dd-nochildren"]
        },
        {
            "id": 2,
            "content": "Second item",
            "children": [
                {
                    "id": 3,
                    "content": "Item 3"
                },
                {
                    "id": 4,
                    "content": "Item 4"
                },
                {
                    "id": 5,
                    "content": "Item 5",
                    "value": "Item 5 value",
                    "foo": "Bar",
                    "children": [
                        {
                            "id": 6,
                            "content": "Item 6"
                        },
                        {
                            "id": 7,
                            "content": "Item 7"
                        },
                        {
                            "id": 8,
                            "content": "Item 8"
                        }
                    ]
                }
            ]
        },
        {
            "id": 9,
            "content": "Item 9"
        },
        {
            "id": 10,
            "content": "Item 10",
            "children": [
                {
                    "id": 11,
                    "content": "Item 11",
                    "children": [
                        {
                            "id": 12,
                            "content": "Item 12"
                        }
                    ]
                }
            ]
        }
    ];
    let lastId = 12;

    // activate Nestable for list 1
    let $nestable1 = $('#nestable1').nestable($.extend({}, nestableOptions, {
        group: 1,
        json: json,
        contentCallback: function(item: any) {
            let content = item.content || '' ? item.content : item.id;
            content += ' <i>(id = ' + item.id + ')</i>';

            return content;
        }
    })).on('change', updateOutput);

    // activate Nestable for list 2
    let $nestable2 = $('#nestable2').nestable($.extend({}, nestableOptions, {
        group: 1
    })).on('change', updateOutput);

    // output initial serialised data
    updateOutput($nestable1.data('output', $('#nestable1-output')));
    updateOutput($nestable2.data('output', $('#nestable2-output')));

    $('#nestable-menu').on('click', function(e) {
        let target = $(e.target),
            action = target.data('action');
        if(action === 'expand-all') {
            $('#nestable1, #nestable2').nestable('expandAll');
        }
        if(action === 'collapse-all') {
            $('#nestable1, #nestable2').nestable('collapseAll');
        }
        if(action === 'add-item') {
            let newItem = {
                "id": ++lastId,
                "content": "Item " + lastId,
                "children": [
                    {
                        "id": ++lastId,
                        "content": "Item " + lastId,
                        "children": [
                            {
                                "id": ++lastId,
                                "content": "Item " + lastId
                            }
                        ]
                    }
                ]
            };
            $nestable1.nestable('add', newItem);
            updateOutput($nestable1.data('output', $('#nestable1-output')));
        }
        if(action === 'replace-item') {
            let replacedItem = {
                "id": 10,
                "content": "New item 10",
                "children": [
                    {
                        "id": ++lastId,
                        "content": "Item " + lastId,
                        "children": [
                            {
                                "id": ++lastId,
                                "content": "Item " + lastId
                            }
                        ]
                    }
                ]
            };
            $nestable1.nestable('replace', replacedItem);
            updateOutput($nestable1.data('output', $('#nestable1-output')));
        }
    });

    function nestableSync(e: Event) {
        $(e.target).parents('.dd-item').first().find('> .dd-handle span').text($(e.target).val())
    }

    function updateOutput(e: any) {
        let list = e.length ? e : $(e.target);
        let output = list.data('output');
        if( JSON ) {
            output.val(JSON.stringify(list.nestable('serialize')));//, null, 2));
        } else {
            output.val('JSON browser support required for this demo.');
        }
    }
});


