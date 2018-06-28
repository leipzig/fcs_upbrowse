'use strict';
/*!
 * @version: 1.1.1
 * @name: main
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'jquery-ui/ui/widgets/sortable';
import 'bootstrap-table';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js';
import 'tableexport.jquery.plugin';
import 'bootstrap-table/src/extensions/editable/bootstrap-table-editable';
import 'bootstrap-table/src/extensions/export/bootstrap-table-export';
import '../form/editor/summernote';
import 'touchspin';

$(function () {
    let $table = $('#product-list-table'),
        $remove = $('#remove-table-row'),
        $new = $('#new-table-row'),
        selections: any[];

    initTable();

    $('#product-description').summernote({
        height: 400,
        toolbar: [
            ['para', ['paragraph']],
            ['color', ['color']],

            ['font', ['bold', 'italic']],
            ['text', ['underline', 'strikethrough', 'clear']],
            ['style', ['fontsize',]],

            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen']],
        ],
        placeholder: 'Message:'
    });

    function initSpin() {
        $table.find('input.spin').TouchSpin({
            min: 0,
            max: 100,
            step: 1,
            decimals: 0,
            boostat: 5,
            maxboostedstep: 100,
        });
    }

    function initTable() {
        //$.fn.editable.defaults.mode = 'inline';
        let customCeckbox = true;

        $table.bootstrapTable({
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle', refresh: 'icon-refresh',
                toggle: 'icon-list', columns: 'icon-grid', detailOpen: 'icon-plus', detailClose: 'icon-minus', 'export': 'icon-share-alt'
            },
            pageSize: 7, pageList: [7, 15, 25, 'All'],
            mobileResponsive: true,minWidth: 767,
            responseHandler: responseHandler,  detailFormatter: detailFormatter,
            columns: [
                [
                    { field: 'state', checkbox: true, align: 'center' },
                    { title: 'ID', width: 40, field: 'id',  align: 'center',  sortable: true,  footerFormatter: totalTextFormatter },
                    { field: 'image', title: 'Image', formatter: imageFormatter,  align: 'center' },
                    { field: 'name',  title: 'Name',  sortable: true, footerFormatter: totalNameFormatter,  align: 'center',
                        editable: { mode: 'inline' }
                    },
                    { field: 'qty',  title: 'QTY',  sortable: true, formatter: qtyFormatter,  align: 'center' },
                    { field: 'price',  title: 'Price',  sortable: true,  align: 'center', footerFormatter: totalPriceFormatter,
                        editable: { type: 'text', title: 'Price', mode: 'inline',
                            validate: function (value: any) {
                                value = $.trim(value);
                                if (!value) {
                                    return 'This field is required';
                                }
                                if (!/^\$/.test(value)) {
                                    return 'This field needs to start width $.'
                                }
                                return '';
                            }
                        },
                    },
                    { field: 'link',  title: 'Edit',  align: 'center',  formatter: linkFormatter }
                ]
            ]
        });

        $table.on('all.bs.table', styleCheckboxes);

        // sometimes footer render error.
        setTimeout(function () {
            $table.bootstrapTable('resetView');
        }, 200);

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            // save your data, here just save the current page
            selections = getIdSelections();
            // push or splice the selections if you want to save all data selections
        });

        $table.on('reset-view.bs.table toggle.bs.table post-body.bs.table', initSpin);

        $remove.click(function () {
            let ids = getIdSelections();
            $table.bootstrapTable('remove', {
                field: 'id',
                values: ids
            });
            $remove.prop('disabled', true);
        });

        $new.click(function () {
            let randomId = $table.bootstrapTable('getData').length;
            $table.bootstrapTable('insertRow', {
                index: 0,
                row: {
                    id: randomId,
                    name: 'Item ' + randomId,
                    price: '$0',
                    image: 'assets/img/products/no-img.jpg',
                    qty: 0,
                    link: '/product-single.html'
                }
            });
            $new.prop('disabled', false);
        });
    }

    function getIdSelections() {
        return $.map($table.bootstrapTable('getSelections'), function (row) {
            return row.id
        });
    }

    function responseHandler(res: any) {
        $.each(res.rows, function (i: any, row: any) {
            row.state = $.inArray(row.id, selections) !== -1;
        });
        return res;
    }

    function detailFormatter( ...args: any[] ) {
        let html: any[] = [];
        let row = args[1];
        $.each(row, function (key, value) {
            html.push('<div class="row mb-1"><div class="col-3"><b>' + key + ':</b></div><div class="col-9">' + value + '</div></div>');
        });
        return html.join('');
    }

    function imageFormatter(value: any, row: any) {
        return '<img src="' + row.image + '" class="img-fluid product-list-image">';
    }

    function qtyFormatter(value: any, row: any) {
        return `<input id="max-qty" class="spin form-control" aria-describedby="Max Qty in the Cart" value="${row.qty}" placeholder="Enter Number">`;
    }

    function linkFormatter(value: any, row: any, index: any) {
        return`<a class="like" target="_blank" href="${row.link}" title="Like"><i class="fa fa-edit icon-mr-ch"></i>Edit</a>`;
    }

    function totalTextFormatter(data: any) {
        return 'Total';
    }
    function totalNameFormatter(data: any) {
        return data.length;
    }
    function totalPriceFormatter(data: any) {
        let total = 0;
        $.each(data, function (i, row) {
            total += +(row.price.substring(1));
        });
        return '$' + total;
    }
    function getHeight() {
        let _height = $(window).height() - $table.parents('.panel').find('.panel-header').outerHeight() - 250;
        let _table_height = $table.height() - 20;
        if (_table_height < _height ) {
            return _table_height;
        }
        return _height;
    }

    function styleCheckboxes() {
        $('input[name="btSelectItem"], input[name="btSelectGroup"], input[name="btSelectAll"], .fixed-table-toolbar [type="checkbox"]').each(function () {
            if ( ! $(this).hasClass('custom-control-input')) {
                $(this).addClass('custom-control-input');
                let $label = $(this).parent().is('label')
                    ? $(this).parent().addClass('custom-control custom-checkbox')
                    : $(this).wrap('<label class="custom-control custom-checkbox"></label>').parent();
                $label.contents().filter(function() {
                    return this.nodeType === 3;
                }).wrap('<span class="custom-control-description"></span>');
                $('<span class="custom-control-indicator"></span>').appendTo($label);
            }

        })
    }
});
