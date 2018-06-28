'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * @version: 1.1.1
 * @name: tables
 *
 * @author: https://themeforest.net/user/flexlayers
 */
require("jquery-ui/ui/widgets/sortable");
require("bootstrap-table");
require("x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js");
require("tableexport.jquery.plugin");
require("bootstrap-table/src/extensions/editable/bootstrap-table-editable");
require("bootstrap-table/src/extensions/export/bootstrap-table-export");
require("bootstrap-table/src/extensions/mobile/bootstrap-table-mobile");
require("./bootstrap-table-group-by");
require("./bootstrap-table-filter-control");
require("imageupload");
var moment = require("moment");
$(function () {
    // locals
    var $remove = $('#remove-table-row'), $new = $('#new-table-row'), $submitjob = $('#submit-job'), $filter = $('#filter-by-exp'), selections;
    // Global options
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editableform.buttons = "\n            <button type=\"submit\" class=\"btn btn-sm btn-primary editable-submit ml-2\"><i class=\"fa fa-check\"></i></button>\n            <button type=\"button\" class=\"btn btn-sm btn-default editable-cancel\"><i class=\"fa fa-rotate-left\"></i></button>";
    initNewProd('#new-prod-table');
    initFCS('#fcs');
    initGroupFCS('#group-fcs');
    initTopCustom('#top-custom-table');
    initRoleTable('#table-roles');
    initUserTable('#table-users');
    initTableAdvancedFilters('#table-advanced-filters');
    initTableNewInModal('#table-new-in-modal');
    initTableEditRows('#table-editable-rows');
    initTableEditColumns('#table-editable-columns');
    var socket = io('http://uploader.cytovas.com:8080');
    //socket.on('news', function (data) {
    //    console.log(data);
    //    socket.emit('my other event', { my: 'data' });
    //jspm install npm:socket.io-client -f && jspm run socket.io-client});
    function decodeURIFormatter(value, row, index) {
        return decodeURIComponent(value);
    }
    function initGroupFCS(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [], columns = [
            { field: 'keyCheck', checkbox: true, align: 'center', valign: 'middle' },
            { field: 'keyName', title: 'Key', visible: false, sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'expuuid', title: 'Exp UUID', visible: true, sortable: true, align: 'left', filterControl: 'select', filterStrictSearch: true },
            { field: 'qqfilename', title: 'Original Filename', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'expdate', title: 'Exp Date', sortable: true, align: 'left' },
            { field: 'trial', title: 'Trial', sortable: true, align: 'left' },
            { field: 'assay', title: 'Assay', sortable: true, align: 'left' },
            { field: 'tubetype', title: 'Tube type', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'composite', title: 'Composite', visible: false, sortable: true, align: 'left', formatter: decodeURIFormatter, filterControl: 'select', filterStrictSearch: true },
        ];
        // queryParams: queryParams: function (p) {
        //     return { experiment: $('#experiment-filter-selection-input').val() };
        // },
        $table.bootstrapTable({
            url: 'http://uploader.cytovas.com:8080/uploads',
            mobileResponsive: true, minWidth: 767,
            classes: 'table table-no-bordered',
            pagination: true, pageSize: 20, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            groupBy: true, groupByField: 'composite',
            filterControl: true, filterShowClear: true,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $.getJSON('http://uploader.cytovas.com:8080/experiments', function (data) {
            var res = '';
            res = '<div id="experiment-filter" class="ui selection simple-select select-dropdown mb-4 mr-4">' +
                '<i class="select-dropdown icon"></i>' +
                '<input type="hidden" id="experiment-filter-selection-input" name="experiment-filter-selection">' +
                '<div class="default text">Experiment</div>' +
                '<div class="menu" id="experiment-filter-menu">';
            $.each(data[0], function (key, exp) {
                res += '<div class="item" id="' + key + '" data-value="' + key + '">' + decodeURIComponent(exp.moniker) + '(' + exp.expdate + ')' + '</div>';
            });
            res += '</div></div>';
            $('#bt-filter-exp-div').append(res);
        }).done(function () {
            console.log("second success");
            $('#experiment-filter').selectDropdown();
        })
            .fail(function () {
            console.log("error");
        })
            .always(function () {
            console.log("complete");
        });
        //put the contents of #bt-table-modal into the table.parent
        //see .modal-body in table-group-rows.hbs
        //append an anonymous function that returns html, very clever
        $('#bt-table-modal').appendTo($table.parent()).find('.modal-body').append('<div id="experiment-type" class="ui selection simple-select select-dropdown mb-4 mr-4">' +
            '<input type="hidden" name="experiment-type">' +
            '<i class="select-dropdown icon"></i>' +
            '<div class="default text">Analysis type</div>' +
            '<div class="menu">' +
            '<div class="item" data-value="titration">Antibody Titration</div>' +
            '<div class="item" data-value="voltration">Gain Voltage Titration</div>' +
            '<div class="item" data-value="case-control">Case-control EV Analysis</div>' +
            '</div></div>');
        $('#bt-table-modal').find('.select-dropdown').selectDropdown();
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function (e) {
            //light up the remove button
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
        $table.on('reset-view.bs.table', editHandler.bind($table[0]));
        // try to fix the urlencoded group
        $table.on('all.bs.table sort.bs.table', function (e) {
            $('.info td:nth-child(3)').each(function (index) {
                $(this).html(decodeURIComponent($(this).html()));
            });
        });
        $remove.click(function () {
            var ids = getIdSelections($table[0]);
            alert('trying to remove' + ids);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
            styleCheckboxes();
        });
        $new.click(function () {
            var data = $table.bootstrapTable('getData');
            var selections = $table.bootstrapTable('getAllSelections');
            console.log(selections);
            var $modal = $('#bt-table-modal').modal('show');
            $new.prop('disabled', false);
        });
        $submitjob.click(function () {
            var selections = $table.bootstrapTable('getAllSelections');
            console.log(selections);
            var data = {};
            data.selections = selections;
            //titration or otherwise
            data.experiment_type = $("#experiment-type .selected").data('value');
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: 'http://uploader.cytovas.com:8080/analysis/experiment',
                success: function (data) {
                    console.log('success');
                    console.log(JSON.stringify(data));
                }
            });
        });
    }
    ////////////////////////////////////
    function initFCS(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [];
        var data = '';
        //"qqfilename":"Compensation%20Controls_450%2C2f%2C50%20Violet%20Stained%20Control_018.fcs",
        //"expuuid":"7192da80-8134-498f-a987-34419351bc6b",
        //"assay":"EV",
        //"tubetype":"Violet%20Stained",
        //"trial":"Events",
        //"expdate":"Tue%20Sep%2026%202017%2011%3A52%3A31%20GMT-0400%20(EDT)",
        //"expmoniker":"flaid%20yeggmen",
        //"keyName":"9771f882-17e4-4e3e-bcff-51f67b55302c.fcs"
        var columns = [
            { field: 'keyName', title: 'Key', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'qqfilename', title: 'Original Filename', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'expuuid', title: 'Exp UUID', sortable: true, align: 'left' },
            { field: 'trial', title: 'Trial', sortable: true, align: 'left' },
            { field: 'assay', title: 'Assay', sortable: true, align: 'left' },
            { field: 'tubetype', title: 'Tube type', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'expdate', title: 'Exp date', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'expmoniker', title: 'Exp moniker', sortable: true, align: 'left', formatter: decodeURIFormatter },
        ];
        $table.bootstrapTable({
            url: 'http://uploader.cytovas.com:8080/uploads',
            mobileResponsive: true, minWidth: 767,
            classes: 'table', sortName: 'views', sortOrder: 'desc', buttonsAlign: 'left', escape: false,
            pagination: true, pageSize: 9, pageList: '[All, 40, 25, 15, 9]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: false,
            idField: 'id', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
            $('.info td:nth-child(3)').html(decodeURIComponent($('.info td:nth-child(3)').html()));
        });
        $table.on('all.bs.table', styleCheckboxes);
    }
    function htmlDecode(value) {
        return $('<em/>').html(value).text();
    }
    function initTopCustom(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [];
        var data = '';
        var columns = [
            { field: 'id', title: 'ID', width: 40, align: 'left', valign: 'middle', sortable: true },
            { field: 'name', title: 'Name', sortable: true, align: 'center' },
            { field: 'items', title: 'Items', sortable: true, align: 'center' },
            { field: 'date', title: 'Submit Date', align: 'center', sortable: true },
            { field: 'total', title: 'Total', sortable: true, align: 'center' },
        ];
        $table.bootstrapTable({
            url: '/assets/prod.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table', sortName: 'total', sortOrder: 'desc', buttonsAlign: 'left',
            pagination: true, pageSize: 9, pageList: '[All, 40, 25, 15, 9]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: false,
            idField: 'id', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
    }
    function initNewProd(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [];
        var data = '';
        var columns = [
            { field: 'id', title: 'ID', width: 40, align: 'left', valign: 'middle', sortable: true },
            { field: 'product', title: 'Product', sortable: true, align: 'center', formatter: function (item) {
                    return "\n                    <a class=\"c-gray\" href=\"product-single.html\">" + item + "</a>\n                ";
                } },
            { field: 'items', title: 'Items', sortable: true, align: 'center' },
            { field: 'date', title: 'Submit Date', align: 'center', sortable: true },
            { field: 'price', title: 'Price', sortable: true, align: 'center' },
        ];
        $table.bootstrapTable({
            url: '/assets/prod.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table', buttonsAlign: 'left',
            pagination: true, pageSize: 9, pageList: '[All, 40, 25, 15, 9]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: false,
            idField: 'id', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
    }
    function initRoleTable(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [];
        var data = '';
        var columns = [
            { field: 'state', checkbox: true, align: 'center', valign: 'middle' },
            // { field: 'id',  title: 'ID', width: 40, align: 'center',  valign: 'middle',  sortable: true },
            { field: 'image', title: 'Image', formatter: imageFormatter, align: 'center' },
            { field: 'name', title: 'Name', sortable: true, align: 'center' },
            { field: 'email', title: 'Email', align: 'center', sortable: true },
            { field: 'capabilities', title: 'Capabilities', sortable: true, align: 'center' },
            { field: 'job-title', title: 'Job Title', sortable: true, align: 'center' },
            { field: 'link', title: 'Remove', align: 'center', formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        $table.bootstrapTable('remove', { field: 'id', values: [args[2].id] });
                    } }
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data1.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 10, pageList: '[All, 40, 25, 15, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: false,
            idField: 'id', /*toolbar: '#role-toolbar',*/ minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            groupBy: true, groupByField: 'role',
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('post-body.bs.table', function () {
        });
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
    }
    function initUserTable(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [];
        var columns = [
            { field: 'state', checkbox: true, align: 'center', valign: 'middle' },
            // { field: 'id',  title: 'ID', width: 40, align: 'center',  valign: 'middle',  sortable: true },
            { field: 'image', title: 'Image', formatter: imageFormatter, align: 'center' },
            { field: 'name', title: 'Name', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
            { field: 'email', title: 'Email', align: 'center', sortable: true, editable: {}, 'class': 'editable' },
            { field: 'credit-card', title: 'Credit Card #', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
            { field: 'job-title', title: 'Job Title', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
            { field: 'link', title: 'Remove', align: 'center', formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        $table.bootstrapTable('remove', { field: 'id', values: [args[2].id] });
                    } }
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data1.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 8, pageList: '[All, 40, 25, 15, 8]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: false,
            idField: 'id', toolbar: '#user-toolbar', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
        $('#bt-table-modal').appendTo($table.parent()).find('.modal-body').append(function () {
            cols = columns.slice(2);
            cols.pop();
            var html = [];
            $.each(cols, function (key, value) {
                html.push('<div class="row mb-3"><div class="col-4 text-right"><b>' + value.title + ':</b></div><div class="col-8"><input class="form-control bt-modal-input-' + value.field + '" /></div></div>');
            });
            return html.join('');
        });
        $remove.click(function () {
            var ids = getIdSelections($table[0]);
            alert(ids);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });
        $new.click(function () {
            var data = $table.bootstrapTable('getData');
            var $modal = $('#bt-table-modal').modal('show');
            $modal.find('.imageupload').imageupload();
            $modal.find('.add-data').off().click(function () {
                newId = newId ? ++newId : data && data.length && data[data.length - 1].id ? data[data.length - 1].id : 0;
                var $inputs = $modal.find('input');
                var image = $modal.find('.imageupload img').attr('src');
                $table.bootstrapTable('insertRow', { index: 0,
                    row: {
                        id: newId,
                        image: image,
                        'name': $inputs[3].value ? $inputs[3].value : 'empty',
                        email: $inputs[4].value ? $inputs[4].value : 'empty',
                        'credit-card': $inputs[5].value ? $inputs[5].value : 'empty',
                        'job-title': $inputs[6].value ? $inputs[6].value : 'empty'
                    }
                });
                if ($modal.find('input[type="checkbox"]')[0].checked === false) {
                    $inputs.val('');
                    $modal.modal('hide');
                }
            });
            $new.prop('disabled', false);
        });
    }
    function initTableAdvancedFilters(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [];
        var columns = [
            { field: 'state', checkbox: true, align: 'center' },
            { field: 'id', title: 'ID', align: 'center', visible: false },
            { field: 'name', title: 'Name', sortable: true, align: 'center', editable: {}, 'class': 'editable', filterControl: 'input', filterControlPlaceholder: '' },
            { field: 'email', title: 'Email', align: 'center', sortable: true, editable: {}, 'class': 'editable', filterControl: 'input', filterControlPlaceholder: '' },
            { field: 'credit-card', title: 'Credit Card #', sortable: true, align: 'center', editable: {}, 'class': 'editable', filterControl: 'input', filterControlPlaceholder: '' },
            { field: 'job-title', title: 'Job Title', sortable: true, align: 'center', filterControl: 'select', filterStrictSearch: true },
            { field: 'date', title: 'Registration Date', align: 'center', sortable: true, editable: {}, 'class': 'editable', filterControl: 'date' },
            { field: 'link', title: 'Remove', align: 'center', formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        $table.bootstrapTable('remove', { field: 'id', values: [args[2].id] });
                    } }
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data3.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 10, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            filterControl: true, filterShowClear: true,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus', clear: 'icon-trash'
            },
            columns: columns,
            filterTemplate: {
                input: function (that, field, isVisible, placeholder) {
                    return $.fn.bootstrapTable.utils.sprintf('<input type="text" class="form-control bootstrap-table-filter-control-%s" style="width: 100%; visibility: %s" placeholder="%s">', field, isVisible, placeholder);
                },
                select: function (that, field, isVisible) {
                    return $.fn.bootstrapTable.utils.sprintf("<div class=\"ui fluid select-dropdown form-control selection\" tabindex=\"0\"><select class=\"bootstrap-table-filter-control-%s\" style=\"width: 100%; visibility: %s\" dir=\"%s\"></select><i class=\"select-dropdown icon\"></i><div class=\"text\"></div><div class=\"menu\" tabindex=\"-1\"></div></div>", field, isVisible, getDirectionOfSelectOptions(undefined));
                },
                date: function (that, field, isVisible) {
                    return "<div class=\"bs-datepicker input-daterange date-filter-control bootstrap-table-filter-control-" + field + "\" style=\"width: 100%; visibility: " + isVisible + "\">"
                        + '<input type="text" class="form-control w-100 mb-1" />'
                        + '<input type="text" class="form-control w-100" />'
                        + '</div>';
                }
            },
        });
        var date;
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('load-success.bs.table column-search.bs.table search.bs.table column-switch.bs.table', function () {
            if (!date)
                date = $table.bootstrapTable('getData');
            if (!$table.find('.bs-datepicker').find('input').val())
                return;
            $table.bootstrapTable('load', $.grep(date, function (row) {
                return Date.parse(row.date) >= Date.parse($table.find('.bs-datepicker input').val())
                    && Date.parse(row.date) <= Date.parse($table.find('.bs-datepicker input').last().val());
            }));
        });
        $table.on('post-header.bs.table', function () {
            $table.find('.bs-datepicker')
                .bsDatepicker({ 'autoclose': true, 'clearBtn': true, filterControlPlaceholder: '', 'todayHighlight': true })
                .on('show', function () {
                $('.bs-datepicker-dropdown').css('opacity', '0').addClass('transition scale in').on('click', function () {
                    $(this).removeClass('transition scale in').css('opacity', '1');
                });
            });
            $('.select-dropdown').selectDropdown();
        });
        $table.parents('.bootstrap-table').find('.filter-show-clear').click(function () {
            $('.select-dropdown').selectDropdown('clear');
        });
        $table.on('load-success.bs.table', function () {
            var $modal = $('#bt-table-modal');
            if ($modal.hasClass('modal-constructed'))
                return;
            $modal.addClass('modal-constructed').appendTo($table.parent()).find('.modal-body').append(function () {
                cols = columns.slice(2, 6);
                var html = [];
                $.each(cols, function (key, value) {
                    if (value.field === 'job-title') {
                        html.push('<div class="row mb-3"><div class="col-4 text-right"><b>' + value.title + ':</b></div><div class="col-8">'
                            + '<select class="ui form-control select-dropdown fluid search bt-modal-input-' + value.field + '">'
                            + $('.bootstrap-table-filter-control-job-title').html()
                            + '</select></div></div>');
                        return;
                    }
                    html.push('<div class="row mb-3"><div class="col-4 text-right"><b>' + value.title + ':</b></div><div class="col-8"><input class="form-control bt-modal-input-' + value.field + '" /></div></div>');
                });
                return html.join('');
            });
            $modal.find('.select-dropdown').selectDropdown();
        });
        $table.find('.bs-datepicker')
            .on('changeDate', function (e) {
            $(e.currentTarget).find('input').each(function () {
                $(this).keyup();
            });
        });
        $table.on('all.bs.table', styleCheckboxes);
        $remove.click(function () {
            var ids = getIdSelections($table[0]);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });
        $new.click(function () {
            var data = $table.bootstrapTable('getData');
            var $modal = $('#bt-table-modal').modal('show');
            $modal.find('.add-data').off().click(function () {
                newId = newId ? ++newId : data && data.length && data[data.length - 1].id ? data[data.length - 1].id : 0;
                var $inputs = $modal.find('input');
                var $selects = $modal.find('select');
                $table.bootstrapTable('insertRow', { index: 0,
                    row: {
                        id: newId,
                        'name': $inputs[0].value ? $inputs[0].value : 'empty',
                        email: $inputs[1].value ? $inputs[1].value : 'empty',
                        'job-title': $selects[0].value ? $selects[0].value : 'empty',
                        'credit-card': $inputs[2].value ? $inputs[2].value : 'empty',
                        'date': moment().format('l')
                    }
                });
                if ($modal.find('input[type="checkbox"]')[0].checked === false) {
                    $inputs.val('');
                    $modal.modal('hide');
                }
            });
            $new.prop('disabled', false);
        });
    }
    function initTableNewInModal(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        var cols = [];
        var columns = [
            { field: 'state', checkbox: true, align: 'center', valign: 'middle' },
            { field: 'id', title: 'ID', width: 40, align: 'center', valign: 'middle', sortable: true },
            { field: 'name', title: 'Name', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
            { field: 'email', title: 'Email', align: 'center', sortable: true, editable: {}, 'class': 'editable' },
            { field: 'credit-card', title: 'Credit Card #', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
            { field: 'job-title', title: 'Job Title', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
            { field: 'link', title: 'Remove', align: 'center', formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        $table.bootstrapTable('remove', { field: 'id', values: [args[2].id] });
                    } }
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data1.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 10, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
        $('#bt-table-modal').appendTo($table.parent()).find('.modal-body').append(function () {
            cols = columns.slice(2);
            cols.pop();
            var html = [];
            $.each(cols, function (key, value) {
                html.push('<div class="row mb-3"><div class="col-4 text-right"><b>' + value.title + ':</b></div><div class="col-8"><input class="form-control bt-modal-input-' + value.field + '" /></div></div>');
            });
            return html.join('');
        });
        $remove.click(function () {
            var ids = getIdSelections($table[0]);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });
        $new.click(function () {
            var data = $table.bootstrapTable('getData');
            var $modal = $('#bt-table-modal').modal('show');
            $modal.find('.add-data').off().click(function () {
                newId = newId ? ++newId : data && data.length && data[data.length - 1].id ? data[data.length - 1].id : 0;
                var $inputs = $modal.find('input');
                $table.bootstrapTable('insertRow', { index: 0,
                    row: {
                        id: newId,
                        'name': $inputs[0].value ? $inputs[0].value : 'empty',
                        email: $inputs[1].value ? $inputs[1].value : 'empty',
                        'job-title': $inputs[2].value ? $inputs[2].value : 'empty',
                        'credit-card': $inputs[3].value ? $inputs[3].value : 'empty'
                    }
                });
                if ($modal.find('input[type="checkbox"]')[0].checked === false) {
                    $inputs.val('');
                    $modal.modal('hide');
                }
            });
            $new.prop('disabled', false);
        });
    }
    function initTableEditColumns(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        $table.bootstrapTable({
            url: '/assets/data2.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table table-no-bordered',
            pagination: true, pageSize: 10, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: [
                { field: 'state', checkbox: true, align: 'center', valign: 'middle' },
                { field: 'id', title: 'ID', width: 40, align: 'center', valign: 'middle', sortable: true },
                { field: 'company-name', title: 'Company Name', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
                { field: 'street-address', title: 'Street Address', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
                { field: 'phone', title: 'Phone', align: 'center', sortable: true, editable: {}, 'class': 'editable' },
                { field: 'employees', title: 'Employees', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
                { field: 'link', title: 'Remove', align: 'center', formatter: linkRemoveColumnsFormatter,
                    events: { 'click .editable-remove': function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            $table.bootstrapTable('remove', { field: 'id', values: [args[2].id] });
                        } }
                }
            ]
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
        $remove.click(function () {
            var ids = getIdSelections($table[0]);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });
        $new.click(function () {
            var data = $table.bootstrapTable('getData');
            newId = newId ? ++newId : data && data.length && data[data.length - 1].id ? data[data.length - 1].id : 0;
            $table.bootstrapTable('insertRow', {
                index: 0, row: { id: newId, 'company-name': 'empty', phone: 'empty', 'street-address': 'empty', employees: 0 }
            });
            $new.prop('disabled', false);
        });
    }
    function initTableEditRows(el) {
        var $table = $(el);
        if (!$table[0])
            return;
        var newId = 0;
        $table.bootstrapTable({
            url: '/assets/data2.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table table-no-bordered',
            pagination: true, pageSize: 12, pageList: '[All, 40, 30, 20, 12]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2',
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: [
                { field: 'state', checkbox: true, align: 'center', valign: 'middle' },
                { field: 'id', title: 'ID', width: 40, align: 'center', valign: 'middle', sortable: true },
                { field: 'company-name', title: 'Company Name', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
                { field: 'street-address', title: 'Street Address', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
                { field: 'phone', title: 'Phone', align: 'center', sortable: true, editable: {}, 'class': 'editable' },
                { field: 'employees', title: 'Employees', sortable: true, align: 'center', editable: {}, 'class': 'editable' },
                { field: 'link', title: 'Edit', align: 'center', formatter: linkEditRowsFormatter }
            ]
        });
        // sometimes footer render error.
        setTimeout(function () { return $table.bootstrapTable('resetView'); }, 200);
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections(this);
        });
        $table.on('all.bs.table', styleCheckboxes);
        $table.on('reset-view.bs.table', editHandler.bind($table[0]));
        $remove.click(function () {
            var ids = getIdSelections($table[0]);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });
        $new.click(function () {
            var data = $table.bootstrapTable('getData');
            newId = newId ? ++newId : data && data.length && data[data.length - 1].id ? data[data.length - 1].id : 0;
            $table.bootstrapTable('insertRow', {
                index: 0, row: { id: newId, 'company-name': 'empty', phone: 'empty', 'street-address': 'empty', employees: 0 }
            });
            $new.prop('disabled', false);
        });
    }
    function editHandler() {
        var $table = $(this);
        $('.editable-cancel, .editable-submit').hide();
        var $editable = $table.find('.editable a');
        $editable.editable({
            type: 'text', emptytext: '', showbuttons: false, unsavedclass: null, toggle: 'manual', onblur: 'ignore'
        });
        function submitEditable(el) {
            $(el).find('.editableform').submit();
        }
        $table.find('.edit-row').on('click', function () {
            var $tr = $(this).parents('tr');
            var btns = $tr.find('.editable-cancel, .editable-submit').show();
            $(this).hide();
            $tr.find('.editable a').each(function () {
                $(this).editable('show');
                setTimeout(function () { return $tr.find('.form-control').first().focus(); }, 10);
            });
            $tr.find('.editableform').each(function () {
                $(this).on('keydown', function (e) {
                    if ((e.keyCode || e.which) === 13) {
                        submitEditable($tr[0]);
                    }
                });
            });
            btns.click(function (e) {
                if ($(e.target).is('.editable-submit'))
                    submitEditable($tr[0]);
                $tr.find('.editable a').editable('hide');
                $tr.find('.edit-row').show();
                btns.hide();
                return false;
            });
            return false;
        });
    }
    function getIdSelections(el) {
        return $.map($(el).bootstrapTable('getSelections'), function (row) { return row.id; });
    }
    function styleCheckboxes() {
        $('input[name="btSelectItem"], input[name="btSelectGroup"], input[name="btSelectAll"], .fixed-table-toolbar [type="checkbox"]').each(function () {
            if (!$(this).hasClass('custom-control-input')) {
                $(this).addClass('custom-control-input');
                var $label = $(this).parent().is('label')
                    ? $(this).parent().addClass('custom-control custom-checkbox')
                    : $(this).wrap('<label class="custom-control custom-checkbox"></label>').parent();
                $label.contents().filter(function () {
                    return this.nodeType === 3;
                }).wrap('<span class="custom-control-description"></span>');
                $('<span class="custom-control-indicator"></span>').appendTo($label);
            }
        });
    }
    function responseHandler(res) {
        $.each(res.rows, function (i, row) {
            row.state = $.inArray(row.id, selections) !== -1;
        });
        return res;
    }
    function detailFormatter() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var html = [];
        var row = args[1];
        html.push('<div class="row mb-1"><div class="col-3"><b>Custom</b></div><div class="col-9">Custom Value</div></div>');
        $.each(row, function (key, value) {
            html.push('<div class="row mb-1"><div class="col-3"><b>' + key + ':</b></div><div class="col-9">' + value + '</div></div>');
        });
        return html.join('');
    }
    function linkRemoveColumnsFormatter() {
        return "<a href=\"javascript:void(0)\" class=\"btn btn-sm btn-danger editable-remove\"><i class=\"fa fa-close\"></i></a>";
    }
    function linkEditRowsFormatter() {
        return "\n            <a class=\"edit-row c-gray-dark\" href=\"\"><i class=\"fa fa-edit icon-mr-ch\"></i>Edit</a>\n            <a href=\"\" class=\"btn btn-sm btn-primary editable-submit\"><i class=\"fa fa-check\"></i></a>\n            <a href=\"\" class=\"btn btn-sm btn-default editable-cancel\"><i class=\"fa fa-rotate-left\"></i></a>\n        ";
    }
    function getDirectionOfSelectOptions(alignment) {
        alignment = alignment === undefined ? 'left' : alignment.toLowerCase();
        switch (alignment) {
            case 'left':
                return 'ltr';
            case 'right':
                return 'rtl';
            case 'auto':
                return 'auto';
            default:
                return 'ltr';
        }
    }
    function imageFormatter(value, row) {
        var img = '<div class="table-user-image"><i class="icon-user"></i></div>';
        if (row.image) {
            img = '<img src="' + row.image + '" class="table-user-image">';
        }
        return img;
    }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvbW9kdWxlcy90YWJsZS9jeXRvdmFzZmNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYjs7Ozs7R0FLRztBQUNILHlDQUF1QztBQUN2QywyQkFBeUI7QUFDekIsd0VBQXNFO0FBQ3RFLHFDQUFtQztBQUNuQyw0RUFBMEU7QUFDMUUsd0VBQXNFO0FBQ3RFLHdFQUFzRTtBQUN0RSxzQ0FBb0M7QUFDcEMsNENBQTBDO0FBQzFDLHVCQUFvQjtBQUNwQiwrQkFBaUM7QUFRakMsQ0FBQyxDQUFDO0lBQ0UsU0FBUztJQUNULElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNoQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQzFCLFVBQVUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQzdCLE9BQU8sR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDN0IsVUFBaUIsQ0FBQztJQUV0QixpQkFBaUI7SUFDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFDdkMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLHVRQUU0RixDQUFDO0lBRXpILFdBQVcsQ0FBRSxpQkFBaUIsQ0FBRSxDQUFDO0lBQ2pDLE9BQU8sQ0FBRSxNQUFNLENBQUUsQ0FBQztJQUNsQixZQUFZLENBQUUsWUFBWSxDQUFFLENBQUM7SUFHN0IsYUFBYSxDQUFFLG1CQUFtQixDQUFFLENBQUM7SUFFckMsYUFBYSxDQUFFLGNBQWMsQ0FBRSxDQUFDO0lBQ2hDLGFBQWEsQ0FBRSxjQUFjLENBQUUsQ0FBQztJQUVoQyx3QkFBd0IsQ0FBRSx5QkFBeUIsQ0FBRSxDQUFDO0lBQ3RELG1CQUFtQixDQUFFLHFCQUFxQixDQUFFLENBQUM7SUFDN0MsaUJBQWlCLENBQUUsc0JBQXNCLENBQUUsQ0FBQztJQUM1QyxvQkFBb0Is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QUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2IsR0FBRyxHQUFHLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLDZCQUE2QixDQUFDO1FBQ25FLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InNjcmlwdHMvbW9kdWxlcy90YWJsZS9jeXRvdmFzZmNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyohXG4gKiBAdmVyc2lvbjogMS4xLjFcbiAqIEBuYW1lOiB0YWJsZXNcbiAqXG4gKiBAYXV0aG9yOiBodHRwczovL3RoZW1lZm9yZXN0Lm5ldC91c2VyL2ZsZXhsYXllcnNcbiAqL1xuaW1wb3J0ICdqcXVlcnktdWkvdWkvd2lkZ2V0cy9zb3J0YWJsZSc7XG5pbXBvcnQgJ2Jvb3RzdHJhcC10YWJsZSc7XG5pbXBvcnQgJ3gtZWRpdGFibGUvZGlzdC9ib290c3RyYXAzLWVkaXRhYmxlL2pzL2Jvb3RzdHJhcC1lZGl0YWJsZS5qcyc7XG5pbXBvcnQgJ3RhYmxlZXhwb3J0LmpxdWVyeS5wbHVnaW4nO1xuaW1wb3J0ICdib290c3RyYXAtdGFibGUvc3JjL2V4dGVuc2lvbnMvZWRpdGFibGUvYm9vdHN0cmFwLXRhYmxlLWVkaXRhYmxlJztcbmltcG9ydCAnYm9vdHN0cmFwLXRhYmxlL3NyYy9leHRlbnNpb25zL2V4cG9ydC9ib290c3RyYXAtdGFibGUtZXhwb3J0JztcbmltcG9ydCAnYm9vdHN0cmFwLXRhYmxlL3NyYy9leHRlbnNpb25zL21vYmlsZS9ib290c3RyYXAtdGFibGUtbW9iaWxlJztcbmltcG9ydCAnLi9ib290c3RyYXAtdGFibGUtZ3JvdXAtYnknO1xuaW1wb3J0ICcuL2Jvb3RzdHJhcC10YWJsZS1maWx0ZXItY29udHJvbCc7XG5pbXBvcnQgJ2ltYWdldXBsb2FkJ1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5cbi8vaW1wb3J0IGlvIGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xuXG4vL2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BV1NKYXZhU2NyaXB0U0RLL2xhdGVzdC8jVXNhZ2Vfd2l0aF9UeXBlU2NyaXB0XG5pbXBvcnQgQVdTID0gcmVxdWlyZSgnYXdzJyk7XG5cblxuJChmdW5jdGlvbiAoKSB7IC8vY29uc29sZS5sb2coJC5mbi5ib290c3RyYXBUYWJsZS5kZWZhdWx0cylcbiAgICAvLyBsb2NhbHNcbiAgICBsZXQgJHJlbW92ZSA9ICQoJyNyZW1vdmUtdGFibGUtcm93JyksXG4gICAgICAgICRuZXcgPSAkKCcjbmV3LXRhYmxlLXJvdycpLFxuICAgICAgICAkc3VibWl0am9iID0gJCgnI3N1Ym1pdC1qb2InKSxcbiAgICAgICAgJGZpbHRlciA9ICQoJyNmaWx0ZXItYnktZXhwJyksXG4gICAgICAgIHNlbGVjdGlvbnM6IGFueVtdO1xuXG4gICAgLy8gR2xvYmFsIG9wdGlvbnNcbiAgICAkLmZuLmVkaXRhYmxlLmRlZmF1bHRzLm1vZGUgPSAnaW5saW5lJztcbiAgICAkLmZuLmVkaXRhYmxlZm9ybS5idXR0b25zID0gYFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1wcmltYXJ5IGVkaXRhYmxlLXN1Ym1pdCBtbC0yXCI+PGkgY2xhc3M9XCJmYSBmYS1jaGVja1wiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGVmYXVsdCBlZGl0YWJsZS1jYW5jZWxcIj48aSBjbGFzcz1cImZhIGZhLXJvdGF0ZS1sZWZ0XCI+PC9pPjwvYnV0dG9uPmA7XG5cbiAgICBpbml0TmV3UHJvZCggJyNuZXctcHJvZC10YWJsZScgKTtcbiAgICBpbml0RkNTKCAnI2ZjcycgKTtcbiAgICBpbml0R3JvdXBGQ1MoICcjZ3JvdXAtZmNzJyApO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgaW5pdFRvcEN1c3RvbSggJyN0b3AtY3VzdG9tLXRhYmxlJyApO1xuXG4gICAgaW5pdFJvbGVUYWJsZSggJyN0YWJsZS1yb2xlcycgKTtcbiAgICBpbml0VXNlclRhYmxlKCAnI3RhYmxlLXVzZXJzJyApO1xuXG4gICAgaW5pdFRhYmxlQWR2YW5jZWRGaWx0ZXJzKCAnI3RhYmxlLWFkdmFuY2VkLWZpbHRlcnMnICk7XG4gICAgaW5pdFRhYmxlTmV3SW5Nb2RhbCggJyN0YWJsZS1uZXctaW4tbW9kYWwnICk7XG4gICAgaW5pdFRhYmxlRWRpdFJvd3MoICcjdGFibGUtZWRpdGFibGUtcm93cycgKTtcbiAgICBpbml0VGFibGVFZGl0Q29sdW1ucyggJyN0YWJsZS1lZGl0YWJsZS1jb2x1bW5zJyApXG5cbiAgICB2YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly91cGxvYWRlci5jeXRvdmFzLmNvbTo4MDgwJyk7XG4gICAgLy9zb2NrZXQub24oJ25ld3MnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIC8vICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgIC8vICAgIHNvY2tldC5lbWl0KCdteSBvdGhlciBldmVudCcsIHsgbXk6ICdkYXRhJyB9KTtcbiAgICAvL2pzcG0gaW5zdGFsbCBucG06c29ja2V0LmlvLWNsaWVudCAtZiAmJiBqc3BtIHJ1biBzb2NrZXQuaW8tY2xpZW50fSk7XG4gICAgXG4gICAgZnVuY3Rpb24gZGVjb2RlVVJJRm9ybWF0dGVyKHZhbHVlLCByb3csIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICAgIH0gICAgICBcbiAgICBcbiAgICBmdW5jdGlvbiBpbml0R3JvdXBGQ1MoIGVsOiBFbGVtZW50IHwgU3RyaW5nICkge1xuICAgICAgICBsZXQgJHRhYmxlID0gJChlbCk7XG4gICAgICAgIGlmICggISR0YWJsZVswXSApIHJldHVybjtcbiAgICAgICAgbGV0IG5ld0lkOiBhbnkgPSAwO1xuICAgICAgICBsZXQgY29scyA9IFtdLFxuICAgICAgICAgICAgY29sdW1ucyA9IFtcbiAgICAgICAgICAgICAgICB7IGZpZWxkOiAna2V5Q2hlY2snLCBjaGVja2JveDogdHJ1ZSwgYWxpZ246ICdjZW50ZXInLCAgdmFsaWduOiAnbWlkZGxlJyB9LFxuICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdrZXlOYW1lJyx0aXRsZTogJ0tleScsICB2aXNpYmxlOiBmYWxzZSwgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcsIGZvcm1hdHRlcjogZGVjb2RlVVJJRm9ybWF0dGVyIH0sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2V4cHV1aWQnLCB0aXRsZTogJ0V4cCBVVUlEJywgIHZpc2libGU6IHRydWUsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2xlZnQnLCBmaWx0ZXJDb250cm9sOiAnc2VsZWN0JywgZmlsdGVyU3RyaWN0U2VhcmNoOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ3FxZmlsZW5hbWUnLCB0aXRsZTogJ09yaWdpbmFsIEZpbGVuYW1lJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcsIGZvcm1hdHRlcjogZGVjb2RlVVJJRm9ybWF0dGVyIH0sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2V4cGRhdGUnLCB0aXRsZTogJ0V4cCBEYXRlJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IGZpZWxkOiAndHJpYWwnLCB0aXRsZTogJ1RyaWFsJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IGZpZWxkOiAnYXNzYXknLCB0aXRsZTogJ0Fzc2F5Jywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IGZpZWxkOiAndHViZXR5cGUnLCB0aXRsZTogJ1R1YmUgdHlwZScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2xlZnQnLCBmb3JtYXR0ZXI6IGRlY29kZVVSSUZvcm1hdHRlciAgfSxcbiAgICAgICAgICAgICAgICB7IGZpZWxkOiAnY29tcG9zaXRlJywgdGl0bGU6ICdDb21wb3NpdGUnLCB2aXNpYmxlOiBmYWxzZSwgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcsIGZvcm1hdHRlcjogZGVjb2RlVVJJRm9ybWF0dGVyLCBmaWx0ZXJDb250cm9sOiAnc2VsZWN0JywgZmlsdGVyU3RyaWN0U2VhcmNoOiB0cnVlfSxcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIC8vIHF1ZXJ5UGFyYW1zOiBxdWVyeVBhcmFtczogZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4geyBleHBlcmltZW50OiAkKCcjZXhwZXJpbWVudC1maWx0ZXItc2VsZWN0aW9uLWlucHV0JykudmFsKCkgfTtcbiAgICAgICAgICAgIC8vIH0sXG4gICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSh7XG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vdXBsb2FkZXIuY3l0b3Zhcy5jb206ODA4MC91cGxvYWRzJyxcbiAgICAgICAgICAgIG1vYmlsZVJlc3BvbnNpdmU6IHRydWUsIG1pbldpZHRoOiA3NjcsXG4gICAgICAgICAgICBjbGFzc2VzOiAndGFibGUgdGFibGUtbm8tYm9yZGVyZWQnLFxuICAgICAgICAgICAgcGFnaW5hdGlvbjogdHJ1ZSwgcGFnZVNpemU6IDIwLCBwYWdlTGlzdDogJ1tBbGwsIDQwLCAzMCwgMjAsIDEwXScsIHNpZGVQYWdpbmF0aW9uOiAnY2xpZW50Jywgc2hvd1BhZ2luYXRpb25Td2l0Y2g6IHRydWUsXG4gICAgICAgICAgICBzZWFyY2g6IHRydWUsIHNob3dGb290ZXI6IGZhbHNlLCBzaG93UmVmcmVzaDogdHJ1ZSwgc2hvd1RvZ2dsZTogdHJ1ZSwgc2hvd0NvbHVtbnM6IHRydWUsIHNob3dFeHBvcnQ6IHRydWUsIGRldGFpbFZpZXc6IHRydWUsXG4gICAgICAgICAgICBpZEZpZWxkOiAnaWQnLCB0b29sYmFyOiAnI3Rvb2xiYXInLCBtaW5pbXVtQ291bnRDb2x1bW5zOiAnMicsIC8qZXhwb3J0VHlwZXM6IFsgJ2pzb24nLCAneG1sJywgJ3BuZycsICdjc3YnLCAndHh0JywgJ3NxbCcsICdkb2MnLCAnZXhjZWwnLCAneGxzeCcsICdwZGYnXSwqL1xuICAgICAgICAgICAgZGV0YWlsRm9ybWF0dGVyOiBkZXRhaWxGb3JtYXR0ZXIsIHJlc3BvbnNlSGFuZGxlcjogcmVzcG9uc2VIYW5kbGVyLFxuICAgICAgICAgICAgZ3JvdXBCeTogdHJ1ZSwgZ3JvdXBCeUZpZWxkOiAnY29tcG9zaXRlJyxcbiAgICAgICAgICAgIGZpbHRlckNvbnRyb2w6IHRydWUsIGZpbHRlclNob3dDbGVhcjogdHJ1ZSxcbiAgICAgICAgICAgIGljb25zOiB7XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblN3aXRjaERvd246ICdpY29uLWFycm93LWRvd24tY2lyY2xlJywgcGFnaW5hdGlvblN3aXRjaFVwOiAnaWNvbi1hcnJvdy11cC1jaXJjbGUnLFxuICAgICAgICAgICAgICAgIHJlZnJlc2g6ICdpY29uLXJlZnJlc2gnLCB0b2dnbGU6ICdpY29uLWxpc3QnLCBjb2x1bW5zOiAnaWNvbi1ncmlkJywgJ2V4cG9ydCc6ICdpY29uLXNoYXJlLWFsdCcsXG4gICAgICAgICAgICAgICAgZGV0YWlsT3BlbjogJ2ljb24tcGx1cycsIGRldGFpbENsb3NlOiAnaWNvbi1taW51cycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29sdW1uczogY29sdW1uc1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzb21ldGltZXMgZm9vdGVyIHJlbmRlciBlcnJvci5cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZXNldFZpZXcnKSwgMjAwICk7XG4gICAgICAgIFxuICAgICAgICAkLmdldEpTT04oJ2h0dHA6Ly91cGxvYWRlci5jeXRvdmFzLmNvbTo4MDgwL2V4cGVyaW1lbnRzJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciByZXM9Jyc7XG4gICAgICAgICAgICByZXMgPSAnPGRpdiBpZD1cImV4cGVyaW1lbnQtZmlsdGVyXCIgY2xhc3M9XCJ1aSBzZWxlY3Rpb24gc2ltcGxlLXNlbGVjdCBzZWxlY3QtZHJvcGRvd24gbWItNCBtci00XCI+JyArXG4gICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwic2VsZWN0LWRyb3Bkb3duIGljb25cIj48L2k+JyArXG4gICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgaWQ9XCJleHBlcmltZW50LWZpbHRlci1zZWxlY3Rpb24taW5wdXRcIiBuYW1lPVwiZXhwZXJpbWVudC1maWx0ZXItc2VsZWN0aW9uXCI+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJkZWZhdWx0IHRleHRcIj5FeHBlcmltZW50PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtZW51XCIgaWQ9XCJleHBlcmltZW50LWZpbHRlci1tZW51XCI+JztcbiAgICAgICAgICAgICQuZWFjaChkYXRhWzBdLCBmdW5jdGlvbiAoa2V5LCBleHApIHtcbiAgICAgICAgICAgICAgICByZXMgKz0gJzxkaXYgY2xhc3M9XCJpdGVtXCIgaWQ9XCInICsga2V5ICsgJ1wiIGRhdGEtdmFsdWU9XCInICsga2V5ICsgJ1wiPicgKyBkZWNvZGVVUklDb21wb25lbnQoZXhwLm1vbmlrZXIpICsgJygnICsgZXhwLmV4cGRhdGUgKyAnKScgKyAnPC9kaXY+JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgICAgICAgICAgJCgnI2J0LWZpbHRlci1leHAtZGl2JykuYXBwZW5kKHJlcyk7XG4gICAgICAgIH0pLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coIFwic2Vjb25kIHN1Y2Nlc3NcIiApO1xuICAgICQoJyNleHBlcmltZW50LWZpbHRlcicpLnNlbGVjdERyb3Bkb3duKCk7XG4gIH0pXG4gIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCBcImVycm9yXCIgKTtcbiAgfSlcbiAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyggXCJjb21wbGV0ZVwiICk7XG4gIH0pO1xuICAgICAgICBcblxuICAgICAgICBcbiAgICAgICAgLy9wdXQgdGhlIGNvbnRlbnRzIG9mICNidC10YWJsZS1tb2RhbCBpbnRvIHRoZSB0YWJsZS5wYXJlbnRcbiAgICAgICAgLy9zZWUgLm1vZGFsLWJvZHkgaW4gdGFibGUtZ3JvdXAtcm93cy5oYnNcbiAgICAgICAgLy9hcHBlbmQgYW4gYW5vbnltb3VzIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBodG1sLCB2ZXJ5IGNsZXZlclxuICAgICAgICAkKCcjYnQtdGFibGUtbW9kYWwnKS5hcHBlbmRUbygkdGFibGUucGFyZW50KCkpLmZpbmQoJy5tb2RhbC1ib2R5JykuYXBwZW5kKFxuICAgICAgICAgJzxkaXYgaWQ9XCJleHBlcmltZW50LXR5cGVcIiBjbGFzcz1cInVpIHNlbGVjdGlvbiBzaW1wbGUtc2VsZWN0IHNlbGVjdC1kcm9wZG93biBtYi00IG1yLTRcIj4nICtcbiAgICAgICAgICc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJleHBlcmltZW50LXR5cGVcIj4nICtcbiAgICAgICAgICc8aSBjbGFzcz1cInNlbGVjdC1kcm9wZG93biBpY29uXCI+PC9pPicgK1xuICAgICAgICAgJzxkaXYgY2xhc3M9XCJkZWZhdWx0IHRleHRcIj5BbmFseXNpcyB0eXBlPC9kaXY+JyArXG4gICAgICAgICAnPGRpdiBjbGFzcz1cIm1lbnVcIj4nICtcbiAgICAgICAgICc8ZGl2IGNsYXNzPVwiaXRlbVwiIGRhdGEtdmFsdWU9XCJ0aXRyYXRpb25cIj5BbnRpYm9keSBUaXRyYXRpb248L2Rpdj4nICtcbiAgICAgICAgICc8ZGl2IGNsYXNzPVwiaXRlbVwiIGRhdGEtdmFsdWU9XCJ2b2x0cmF0aW9uXCI+R2FpbiBWb2x0YWdlIFRpdHJhdGlvbjwvZGl2PicgK1xuICAgICAgICAgJzxkaXYgY2xhc3M9XCJpdGVtXCIgZGF0YS12YWx1ZT1cImNhc2UtY29udHJvbFwiPkNhc2UtY29udHJvbCBFViBBbmFseXNpczwvZGl2PicgK1xuICAgICAgICAgJzwvZGl2PjwvZGl2PidcbiAgICAgICAgKTtcbiAgICAgICAgJCgnI2J0LXRhYmxlLW1vZGFsJykuZmluZCgnLnNlbGVjdC1kcm9wZG93bicpLnNlbGVjdERyb3Bkb3duKCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG5cbiAgICAgICAgXG4gICAgICAgICR0YWJsZS5vbignY2hlY2suYnMudGFibGUgdW5jaGVjay5icy50YWJsZSBjaGVjay1hbGwuYnMudGFibGUgdW5jaGVjay1hbGwuYnMudGFibGUnLCBmdW5jdGlvbiAoZTogRXZlbnQpIHtcbiAgICAgICAgICAgIC8vbGlnaHQgdXAgdGhlIHJlbW92ZSBidXR0b25cbiAgICAgICAgICAgICRyZW1vdmUucHJvcCgnZGlzYWJsZWQnLCAhJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXRTZWxlY3Rpb25zJykubGVuZ3RoKTtcbiAgICAgICAgICAgIHNlbGVjdGlvbnMgPSBnZXRJZFNlbGVjdGlvbnMoIHRoaXMgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdhbGwuYnMudGFibGUnLCBzdHlsZUNoZWNrYm94ZXMpO1xuICAgICAgICAkdGFibGUub24oJ3Jlc2V0LXZpZXcuYnMudGFibGUnLCBlZGl0SGFuZGxlci5iaW5kKCAkdGFibGVbMF0gKSk7XG4gICAgICAgIFxuICAgICAgICAvLyB0cnkgdG8gZml4IHRoZSB1cmxlbmNvZGVkIGdyb3VwXG4gICAgICAgICR0YWJsZS5vbignYWxsLmJzLnRhYmxlIHNvcnQuYnMudGFibGUnLCBmdW5jdGlvbiAoZTogRXZlbnQpIHtcbiAgICAgICAgICAgICQoJy5pbmZvIHRkOm50aC1jaGlsZCgzKScpLmVhY2goIGZ1bmN0aW9uKCBpbmRleCApe1xuICAgICAgICAgICAgICAgICQodGhpcykuaHRtbChkZWNvZGVVUklDb21wb25lbnQoJCh0aGlzKS5odG1sKCkpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcmVtb3ZlLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBpZHMgPSBnZXRJZFNlbGVjdGlvbnMoICR0YWJsZVswXSApO1xuICAgICAgICAgICAgYWxlcnQoJ3RyeWluZyB0byByZW1vdmUnK2lkcyk7XG4gICAgICAgICAgICAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ3JlbW92ZScsIHsgZmllbGQ6ICdpZCcsIHZhbHVlczogaWRzIH0pO1xuICAgICAgICAgICAgJHJlbW92ZS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgc3R5bGVDaGVja2JveGVzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRuZXcuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ2dldERhdGEnKTtcbiAgICAgICAgICAgIGxldCBzZWxlY3Rpb25zID0gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXRBbGxTZWxlY3Rpb25zJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxlY3Rpb25zKTtcbiAgICAgICAgICAgIGxldCAkbW9kYWwgPSAkKCcjYnQtdGFibGUtbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkbmV3LnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRzdWJtaXRqb2IuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0aW9ucyA9ICR0YWJsZS5ib290c3RyYXBUYWJsZSgnZ2V0QWxsU2VsZWN0aW9ucycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZWN0aW9ucyk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgZGF0YS5zZWxlY3Rpb25zID0gc2VsZWN0aW9ucztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy90aXRyYXRpb24gb3Igb3RoZXJ3aXNlXG4gICAgICAgICAgICBkYXRhLmV4cGVyaW1lbnRfdHlwZSA9ICQoXCIjZXhwZXJpbWVudC10eXBlIC5zZWxlY3RlZFwiKS5kYXRhKCd2YWx1ZScpXG4gICAgICAgICAgICAkLmFqYXgoe1xuXHRcdFx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG5cdFx0XHRcdCAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly91cGxvYWRlci5jeXRvdmFzLmNvbTo4MDgwL2FuYWx5c2lzL2V4cGVyaW1lbnQnLFx0XHRcdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG5cblxuXG5cbiAgICBmdW5jdGlvbiBpbml0RkNTKCBlbDogRWxlbWVudCB8IFN0cmluZyApIHtcbiAgICAgICAgbGV0ICR0YWJsZSA9ICQoIGVsICk7XG4gICAgICAgIGlmICggISR0YWJsZVswXSApIHJldHVybjtcbiAgICAgICAgbGV0IG5ld0lkOiBhbnkgPSAwO1xuICAgICAgICBsZXQgY29scyA9IFtdO1xuICAgICAgICBsZXQgZGF0YSA9ICcnO1xuICAgICAgICAvL1wicXFmaWxlbmFtZVwiOlwiQ29tcGVuc2F0aW9uJTIwQ29udHJvbHNfNDUwJTJDMmYlMkM1MCUyMFZpb2xldCUyMFN0YWluZWQlMjBDb250cm9sXzAxOC5mY3NcIixcbiAgICAgICAgLy9cImV4cHV1aWRcIjpcIjcxOTJkYTgwLTgxMzQtNDk4Zi1hOTg3LTM0NDE5MzUxYmM2YlwiLFxuICAgICAgICAvL1wiYXNzYXlcIjpcIkVWXCIsXG4gICAgICAgIC8vXCJ0dWJldHlwZVwiOlwiVmlvbGV0JTIwU3RhaW5lZFwiLFxuICAgICAgICAvL1widHJpYWxcIjpcIkV2ZW50c1wiLFxuICAgICAgICAvL1wiZXhwZGF0ZVwiOlwiVHVlJTIwU2VwJTIwMjYlMjAyMDE3JTIwMTElM0E1MiUzQTMxJTIwR01ULTA0MDAlMjAoRURUKVwiLFxuICAgICAgICAvL1wiZXhwbW9uaWtlclwiOlwiZmxhaWQlMjB5ZWdnbWVuXCIsXG4gICAgICAgIC8vXCJrZXlOYW1lXCI6XCI5NzcxZjg4Mi0xN2U0LTRlM2UtYmNmZi01MWY2N2I1NTMwMmMuZmNzXCJcbiAgICAgICAgbGV0IGNvbHVtbnMgPSAgW1xuICAgICAgICAgICAgeyBmaWVsZDogJ2tleU5hbWUnLCB0aXRsZTogJ0tleScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2xlZnQnLCBmb3JtYXR0ZXI6IGRlY29kZVVSSUZvcm1hdHRlciB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ3FxZmlsZW5hbWUnLCB0aXRsZTogJ09yaWdpbmFsIEZpbGVuYW1lJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcsIGZvcm1hdHRlcjogZGVjb2RlVVJJRm9ybWF0dGVyIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnZXhwdXVpZCcsIHRpdGxlOiAnRXhwIFVVSUQnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ3RyaWFsJywgdGl0bGU6ICdUcmlhbCcsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnYXNzYXknLCB0aXRsZTogJ0Fzc2F5Jywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICd0dWJldHlwZScsIHRpdGxlOiAnVHViZSB0eXBlJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcsIGZvcm1hdHRlcjogZGVjb2RlVVJJRm9ybWF0dGVyICB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2V4cGRhdGUnLCB0aXRsZTogJ0V4cCBkYXRlJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnbGVmdCcsIGZvcm1hdHRlcjogZGVjb2RlVVJJRm9ybWF0dGVyIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnZXhwbW9uaWtlcicsIHRpdGxlOiAnRXhwIG1vbmlrZXInLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdsZWZ0JywgZm9ybWF0dGVyOiBkZWNvZGVVUklGb3JtYXR0ZXIgfSxcbiAgICAgICAgXTtcbiAgICAgICAgXG5cbiBcbiAgICAgICAgICAgIFxuICAgICAgICAkdGFibGUuYm9vdHN0cmFwVGFibGUoe1xuICAgICAgICAgICAgdXJsOiAnaHR0cDovL3VwbG9hZGVyLmN5dG92YXMuY29tOjgwODAvdXBsb2FkcycsXG4gICAgICAgICAgICBtb2JpbGVSZXNwb25zaXZlOiB0cnVlLCBtaW5XaWR0aDogNzY3LFxuICAgICAgICAgICAgY2xhc3NlczogJ3RhYmxlJywgc29ydE5hbWU6ICd2aWV3cycsIHNvcnRPcmRlcjogJ2Rlc2MnLCBidXR0b25zQWxpZ246ICdsZWZ0JywgZXNjYXBlOiBmYWxzZSxcbiAgICAgICAgICAgIHBhZ2luYXRpb246IHRydWUsIHBhZ2VTaXplOiA5LCBwYWdlTGlzdDogJ1tBbGwsIDQwLCAyNSwgMTUsIDldJywgc2lkZVBhZ2luYXRpb246ICdjbGllbnQnLCBzaG93UGFnaW5hdGlvblN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgIHNlYXJjaDogdHJ1ZSwgc2hvd0Zvb3RlcjogZmFsc2UsIHNob3dSZWZyZXNoOiB0cnVlLCBzaG93VG9nZ2xlOiB0cnVlLCBzaG93Q29sdW1uczogdHJ1ZSwgc2hvd0V4cG9ydDogdHJ1ZSwgZGV0YWlsVmlldzogZmFsc2UsXG4gICAgICAgICAgICBpZEZpZWxkOiAnaWQnLCBtaW5pbXVtQ291bnRDb2x1bW5zOiAnMicsXG4gICAgICAgICAgICBkZXRhaWxGb3JtYXR0ZXI6IGRldGFpbEZvcm1hdHRlciwgcmVzcG9uc2VIYW5kbGVyOiByZXNwb25zZUhhbmRsZXIsXG4gICAgICAgICAgICBpY29uczoge1xuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Td2l0Y2hEb3duOiAnaWNvbi1hcnJvdy1kb3duLWNpcmNsZScsIHBhZ2luYXRpb25Td2l0Y2hVcDogJ2ljb24tYXJyb3ctdXAtY2lyY2xlJyxcbiAgICAgICAgICAgICAgICByZWZyZXNoOiAnaWNvbi1yZWZyZXNoJywgdG9nZ2xlOiAnaWNvbi1saXN0JywgY29sdW1uczogJ2ljb24tZ3JpZCcsICdleHBvcnQnOiAnaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgIGRldGFpbE9wZW46ICdpY29uLXBsdXMnLCBkZXRhaWxDbG9zZTogJ2ljb24tbWludXMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzIGZvb3RlciByZW5kZXIgZXJyb3IuXG4gICAgICAgIHNldFRpbWVvdXQoICgpID0+ICR0YWJsZS5ib290c3RyYXBUYWJsZSgncmVzZXRWaWV3JyksIDIwMCApO1xuXG4gICAgICAgICR0YWJsZS5vbignY2hlY2suYnMudGFibGUgdW5jaGVjay5icy50YWJsZSBjaGVjay1hbGwuYnMudGFibGUgdW5jaGVjay1hbGwuYnMudGFibGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkcmVtb3ZlLnByb3AoJ2Rpc2FibGVkJywgISR0YWJsZS5ib290c3RyYXBUYWJsZSgnZ2V0U2VsZWN0aW9ucycpLmxlbmd0aCk7XG4gICAgICAgICAgICBzZWxlY3Rpb25zID0gZ2V0SWRTZWxlY3Rpb25zKCB0aGlzICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJy5pbmZvIHRkOm50aC1jaGlsZCgzKScpLmh0bWwoZGVjb2RlVVJJQ29tcG9uZW50KCQoJy5pbmZvIHRkOm50aC1jaGlsZCgzKScpLmh0bWwoKSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkdGFibGUub24oJ2FsbC5icy50YWJsZScsIHN0eWxlQ2hlY2tib3hlcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHRtbERlY29kZSh2YWx1ZSl7IFxuICAgICAgICByZXR1cm4gJCgnPGVtLz4nKS5odG1sKHZhbHVlKS50ZXh0KCk7IFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRUb3BDdXN0b20oIGVsOiBFbGVtZW50IHwgU3RyaW5nICkge1xuICAgICAgICBsZXQgJHRhYmxlID0gJCggZWwgKTtcbiAgICAgICAgaWYgKCAhJHRhYmxlWzBdICkgcmV0dXJuO1xuICAgICAgICBsZXQgbmV3SWQ6IGFueSA9IDA7XG4gICAgICAgIGxldCBjb2xzID0gW107XG4gICAgICAgIGxldCBkYXRhID0gJyc7XG4gICAgICAgIGxldCBjb2x1bW5zID0gIFtcbiAgICAgICAgICAgIHsgZmllbGQ6ICdpZCcsICB0aXRsZTogJ0lEJywgd2lkdGg6IDQwLCBhbGlnbjogJ2xlZnQnLCAgdmFsaWduOiAnbWlkZGxlJywgIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnbmFtZScsIHRpdGxlOiAnTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcid9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2l0ZW1zJywgIHRpdGxlOiAnSXRlbXMnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdkYXRlJywgIHRpdGxlOiAnU3VibWl0IERhdGUnLCAgYWxpZ246ICdjZW50ZXInLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ3RvdGFsJywgIHRpdGxlOiAnVG90YWwnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInfSxcbiAgICAgICAgXTtcbiAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKHtcbiAgICAgICAgICAgIHVybDogJy9hc3NldHMvcHJvZC5qc29uJyxcbiAgICAgICAgICAgIG1vYmlsZVJlc3BvbnNpdmU6IHRydWUsIG1pbldpZHRoOiA3NjcsXG4gICAgICAgICAgICBjbGFzc2VzOiAndGFibGUnLCBzb3J0TmFtZTogJ3RvdGFsJywgc29ydE9yZGVyOiAnZGVzYycsIGJ1dHRvbnNBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgcGFnaW5hdGlvbjogdHJ1ZSwgcGFnZVNpemU6IDksIHBhZ2VMaXN0OiAnW0FsbCwgNDAsIDI1LCAxNSwgOV0nLCBzaWRlUGFnaW5hdGlvbjogJ2NsaWVudCcsIHNob3dQYWdpbmF0aW9uU3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgc2VhcmNoOiB0cnVlLCBzaG93Rm9vdGVyOiBmYWxzZSwgc2hvd1JlZnJlc2g6IHRydWUsIHNob3dUb2dnbGU6IHRydWUsIHNob3dDb2x1bW5zOiB0cnVlLCBzaG93RXhwb3J0OiB0cnVlLCBkZXRhaWxWaWV3OiBmYWxzZSxcbiAgICAgICAgICAgIGlkRmllbGQ6ICdpZCcsIG1pbmltdW1Db3VudENvbHVtbnM6ICcyJyxcbiAgICAgICAgICAgIGRldGFpbEZvcm1hdHRlcjogZGV0YWlsRm9ybWF0dGVyLCByZXNwb25zZUhhbmRsZXI6IHJlc3BvbnNlSGFuZGxlcixcbiAgICAgICAgICAgIGljb25zOiB7XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblN3aXRjaERvd246ICdpY29uLWFycm93LWRvd24tY2lyY2xlJywgcGFnaW5hdGlvblN3aXRjaFVwOiAnaWNvbi1hcnJvdy11cC1jaXJjbGUnLFxuICAgICAgICAgICAgICAgIHJlZnJlc2g6ICdpY29uLXJlZnJlc2gnLCB0b2dnbGU6ICdpY29uLWxpc3QnLCBjb2x1bW5zOiAnaWNvbi1ncmlkJywgJ2V4cG9ydCc6ICdpY29uLXNoYXJlLWFsdCcsXG4gICAgICAgICAgICAgICAgZGV0YWlsT3BlbjogJ2ljb24tcGx1cycsIGRldGFpbENsb3NlOiAnaWNvbi1taW51cycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29sdW1uczogY29sdW1uc1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzb21ldGltZXMgZm9vdGVyIHJlbmRlciBlcnJvci5cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZXNldFZpZXcnKSwgMjAwICk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdjaGVjay5icy50YWJsZSB1bmNoZWNrLmJzLnRhYmxlIGNoZWNrLWFsbC5icy50YWJsZSB1bmNoZWNrLWFsbC5icy50YWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRyZW1vdmUucHJvcCgnZGlzYWJsZWQnLCAhJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXRTZWxlY3Rpb25zJykubGVuZ3RoKTtcbiAgICAgICAgICAgIHNlbGVjdGlvbnMgPSBnZXRJZFNlbGVjdGlvbnMoIHRoaXMgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdhbGwuYnMudGFibGUnLCBzdHlsZUNoZWNrYm94ZXMpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBmdW5jdGlvbiBpbml0TmV3UHJvZCggZWw6IEVsZW1lbnQgfCBTdHJpbmcgKSB7XG4gICAgICAgIGxldCAkdGFibGUgPSAkKCBlbCApO1xuICAgICAgICBpZiAoICEkdGFibGVbMF0gKSByZXR1cm47XG4gICAgICAgIGxldCBuZXdJZDogYW55ID0gMDtcbiAgICAgICAgbGV0IGNvbHMgPSBbXTtcbiAgICAgICAgbGV0IGRhdGEgPSAnJztcbiAgICAgICAgbGV0IGNvbHVtbnMgPSAgW1xuICAgICAgICAgICAgeyBmaWVsZDogJ2lkJywgIHRpdGxlOiAnSUQnLCB3aWR0aDogNDAsIGFsaWduOiAnbGVmdCcsICB2YWxpZ246ICdtaWRkbGUnLCAgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdwcm9kdWN0JywgdGl0bGU6ICdQcm9kdWN0Jywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnY2VudGVyJywgZm9ybWF0dGVyOiAoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJjLWdyYXlcIiBocmVmPVwicHJvZHVjdC1zaW5nbGUuaHRtbFwiPiR7aXRlbX08L2E+XG4gICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgIH19LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2l0ZW1zJywgIHRpdGxlOiAnSXRlbXMnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdkYXRlJywgIHRpdGxlOiAnU3VibWl0IERhdGUnLCAgYWxpZ246ICdjZW50ZXInLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ3ByaWNlJywgIHRpdGxlOiAnUHJpY2UnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInfSxcbiAgICAgICAgXTtcbiAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKHtcbiAgICAgICAgICAgIHVybDogJy9hc3NldHMvcHJvZC5qc29uJyxcbiAgICAgICAgICAgIG1vYmlsZVJlc3BvbnNpdmU6IHRydWUsIG1pbldpZHRoOiA3NjcsXG4gICAgICAgICAgICBjbGFzc2VzOiAndGFibGUnLCBidXR0b25zQWxpZ246ICdsZWZ0JyxcbiAgICAgICAgICAgIHBhZ2luYXRpb246IHRydWUsIHBhZ2VTaXplOiA5LCBwYWdlTGlzdDogJ1tBbGwsIDQwLCAyNSwgMTUsIDldJywgc2lkZVBhZ2luYXRpb246ICdjbGllbnQnLCBzaG93UGFnaW5hdGlvblN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgIHNlYXJjaDogdHJ1ZSwgc2hvd0Zvb3RlcjogZmFsc2UsIHNob3dSZWZyZXNoOiB0cnVlLCBzaG93VG9nZ2xlOiB0cnVlLCBzaG93Q29sdW1uczogdHJ1ZSwgc2hvd0V4cG9ydDogdHJ1ZSwgZGV0YWlsVmlldzogZmFsc2UsXG4gICAgICAgICAgICBpZEZpZWxkOiAnaWQnLCBtaW5pbXVtQ291bnRDb2x1bW5zOiAnMicsXG4gICAgICAgICAgICBkZXRhaWxGb3JtYXR0ZXI6IGRldGFpbEZvcm1hdHRlciwgcmVzcG9uc2VIYW5kbGVyOiByZXNwb25zZUhhbmRsZXIsXG4gICAgICAgICAgICBpY29uczoge1xuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Td2l0Y2hEb3duOiAnaWNvbi1hcnJvdy1kb3duLWNpcmNsZScsIHBhZ2luYXRpb25Td2l0Y2hVcDogJ2ljb24tYXJyb3ctdXAtY2lyY2xlJyxcbiAgICAgICAgICAgICAgICByZWZyZXNoOiAnaWNvbi1yZWZyZXNoJywgdG9nZ2xlOiAnaWNvbi1saXN0JywgY29sdW1uczogJ2ljb24tZ3JpZCcsICdleHBvcnQnOiAnaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgIGRldGFpbE9wZW46ICdpY29uLXBsdXMnLCBkZXRhaWxDbG9zZTogJ2ljb24tbWludXMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzIGZvb3RlciByZW5kZXIgZXJyb3IuXG4gICAgICAgIHNldFRpbWVvdXQoICgpID0+ICR0YWJsZS5ib290c3RyYXBUYWJsZSgncmVzZXRWaWV3JyksIDIwMCApO1xuXG4gICAgICAgICR0YWJsZS5vbignY2hlY2suYnMudGFibGUgdW5jaGVjay5icy50YWJsZSBjaGVjay1hbGwuYnMudGFibGUgdW5jaGVjay1hbGwuYnMudGFibGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkcmVtb3ZlLnByb3AoJ2Rpc2FibGVkJywgISR0YWJsZS5ib290c3RyYXBUYWJsZSgnZ2V0U2VsZWN0aW9ucycpLmxlbmd0aCk7XG4gICAgICAgICAgICBzZWxlY3Rpb25zID0gZ2V0SWRTZWxlY3Rpb25zKCB0aGlzICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICR0YWJsZS5vbignYWxsLmJzLnRhYmxlJywgc3R5bGVDaGVja2JveGVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0Um9sZVRhYmxlKCBlbDogRWxlbWVudCB8IFN0cmluZyApIHtcbiAgICAgICAgbGV0ICR0YWJsZSA9ICQoIGVsICk7XG4gICAgICAgIGlmICggISR0YWJsZVswXSApIHJldHVybjtcbiAgICAgICAgbGV0IG5ld0lkOiBhbnkgPSAwO1xuICAgICAgICBsZXQgY29scyA9IFtdO1xuICAgICAgICBsZXQgZGF0YSA9ICcnO1xuICAgICAgICBsZXQgY29sdW1ucyA9ICBbXG4gICAgICAgICAgICB7IGZpZWxkOiAnc3RhdGUnLCBjaGVja2JveDogdHJ1ZSwgYWxpZ246ICdjZW50ZXInLCAgdmFsaWduOiAnbWlkZGxlJyB9LFxuICAgICAgICAgICAgLy8geyBmaWVsZDogJ2lkJywgIHRpdGxlOiAnSUQnLCB3aWR0aDogNDAsIGFsaWduOiAnY2VudGVyJywgIHZhbGlnbjogJ21pZGRsZScsICBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2ltYWdlJywgdGl0bGU6ICdJbWFnZScsIGZvcm1hdHRlcjogaW1hZ2VGb3JtYXR0ZXIsICBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICduYW1lJywgIHRpdGxlOiAnTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcid9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2VtYWlsJywgIHRpdGxlOiAnRW1haWwnLCAgYWxpZ246ICdjZW50ZXInLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2NhcGFiaWxpdGllcycsICB0aXRsZTogJ0NhcGFiaWxpdGllcycsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcid9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2pvYi10aXRsZScsICB0aXRsZTogJ0pvYiBUaXRsZScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcid9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2xpbmsnLCAgdGl0bGU6ICdSZW1vdmUnLCBhbGlnbjogJ2NlbnRlcicsICBmb3JtYXR0ZXI6IGxpbmtSZW1vdmVDb2x1bW5zRm9ybWF0dGVyLFxuICAgICAgICAgICAgICAgIGV2ZW50czogeyAnY2xpY2sgLmVkaXRhYmxlLXJlbW92ZSc6IGZ1bmN0aW9uICggLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgICAgICAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZW1vdmUnLCB7IGZpZWxkOiAnaWQnLCB2YWx1ZXM6IFsgYXJnc1syXS5pZCBdIH0pO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSh7XG4gICAgICAgICAgICB1cmw6ICcvYXNzZXRzL2RhdGExLmpzb24nLFxuICAgICAgICAgICAgbW9iaWxlUmVzcG9uc2l2ZTogdHJ1ZSwgbWluV2lkdGg6IDc2NyxcbiAgICAgICAgICAgIGNsYXNzZXM6ICd0YWJsZScsXG4gICAgICAgICAgICBwYWdpbmF0aW9uOiB0cnVlLCBwYWdlU2l6ZTogMTAsIHBhZ2VMaXN0OiAnW0FsbCwgNDAsIDI1LCAxNSwgMTBdJywgc2lkZVBhZ2luYXRpb246ICdjbGllbnQnLCBzaG93UGFnaW5hdGlvblN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgIHNlYXJjaDogdHJ1ZSwgc2hvd0Zvb3RlcjogZmFsc2UsIHNob3dSZWZyZXNoOiB0cnVlLCBzaG93VG9nZ2xlOiB0cnVlLCBzaG93Q29sdW1uczogdHJ1ZSwgc2hvd0V4cG9ydDogdHJ1ZSwgZGV0YWlsVmlldzogZmFsc2UsXG4gICAgICAgICAgICBpZEZpZWxkOiAnaWQnLCAvKnRvb2xiYXI6ICcjcm9sZS10b29sYmFyJywqLyBtaW5pbXVtQ291bnRDb2x1bW5zOiAnMicsIC8qZXhwb3J0VHlwZXM6IFsgJ2pzb24nLCAneG1sJywgJ3BuZycsICdjc3YnLCAndHh0JywgJ3NxbCcsICdkb2MnLCAnZXhjZWwnLCAneGxzeCcsICdwZGYnXSwqL1xuICAgICAgICAgICAgZGV0YWlsRm9ybWF0dGVyOiBkZXRhaWxGb3JtYXR0ZXIsIHJlc3BvbnNlSGFuZGxlcjogcmVzcG9uc2VIYW5kbGVyLFxuICAgICAgICAgICAgZ3JvdXBCeTogdHJ1ZSwgZ3JvdXBCeUZpZWxkOiAncm9sZScsXG4gICAgICAgICAgICBpY29uczoge1xuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Td2l0Y2hEb3duOiAnaWNvbi1hcnJvdy1kb3duLWNpcmNsZScsIHBhZ2luYXRpb25Td2l0Y2hVcDogJ2ljb24tYXJyb3ctdXAtY2lyY2xlJyxcbiAgICAgICAgICAgICAgICByZWZyZXNoOiAnaWNvbi1yZWZyZXNoJywgdG9nZ2xlOiAnaWNvbi1saXN0JywgY29sdW1uczogJ2ljb24tZ3JpZCcsICdleHBvcnQnOiAnaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgIGRldGFpbE9wZW46ICdpY29uLXBsdXMnLCBkZXRhaWxDbG9zZTogJ2ljb24tbWludXMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzIGZvb3RlciByZW5kZXIgZXJyb3IuXG4gICAgICAgIHNldFRpbWVvdXQoICgpID0+ICR0YWJsZS5ib290c3RyYXBUYWJsZSgncmVzZXRWaWV3JyksIDIwMCApO1xuICAgICAgICAkdGFibGUub24oJ3Bvc3QtYm9keS5icy50YWJsZScsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB9KTtcblxuICAgICAgICAkdGFibGUub24oJ2NoZWNrLmJzLnRhYmxlIHVuY2hlY2suYnMudGFibGUgY2hlY2stYWxsLmJzLnRhYmxlIHVuY2hlY2stYWxsLmJzLnRhYmxlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHJlbW92ZS5wcm9wKCdkaXNhYmxlZCcsICEkdGFibGUuYm9vdHN0cmFwVGFibGUoJ2dldFNlbGVjdGlvbnMnKS5sZW5ndGgpO1xuICAgICAgICAgICAgc2VsZWN0aW9ucyA9IGdldElkU2VsZWN0aW9ucyggdGhpcyApO1xuICAgICAgICB9KTtcblxuICAgICAgICAkdGFibGUub24oJ2FsbC5icy50YWJsZScsIHN0eWxlQ2hlY2tib3hlcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdFVzZXJUYWJsZSggZWw6IEVsZW1lbnQgfCBTdHJpbmcgKSB7XG4gICAgICAgIGxldCAkdGFibGUgPSAkKCBlbCApO1xuICAgICAgICBpZiAoICEkdGFibGVbMF0gKSByZXR1cm47XG4gICAgICAgIGxldCBuZXdJZDogYW55ID0gMDtcbiAgICAgICAgbGV0IGNvbHMgPSBbXTtcbiAgICAgICAgbGV0IGNvbHVtbnMgPSAgW1xuICAgICAgICAgICAgeyBmaWVsZDogJ3N0YXRlJywgY2hlY2tib3g6IHRydWUsIGFsaWduOiAnY2VudGVyJywgIHZhbGlnbjogJ21pZGRsZScgfSxcbiAgICAgICAgICAgIC8vIHsgZmllbGQ6ICdpZCcsICB0aXRsZTogJ0lEJywgd2lkdGg6IDQwLCBhbGlnbjogJ2NlbnRlcicsICB2YWxpZ246ICdtaWRkbGUnLCAgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdpbWFnZScsIHRpdGxlOiAnSW1hZ2UnLCBmb3JtYXR0ZXI6IGltYWdlRm9ybWF0dGVyLCAgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnbmFtZScsICB0aXRsZTogJ05hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInLCBlZGl0YWJsZToge30sICdjbGFzcyc6ICdlZGl0YWJsZSd9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2VtYWlsJywgIHRpdGxlOiAnRW1haWwnLCAgYWxpZ246ICdjZW50ZXInLCBzb3J0YWJsZTogdHJ1ZSwgZWRpdGFibGU6IHt9LCAnY2xhc3MnOiAnZWRpdGFibGUnIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnY3JlZGl0LWNhcmQnLCAgdGl0bGU6ICdDcmVkaXQgQ2FyZCAjJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnY2VudGVyJywgZWRpdGFibGU6IHt9LCAnY2xhc3MnOiAnZWRpdGFibGUnfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdqb2ItdGl0bGUnLCAgdGl0bGU6ICdKb2IgVGl0bGUnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInLCBlZGl0YWJsZToge30sICdjbGFzcyc6ICdlZGl0YWJsZSd9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2xpbmsnLCAgdGl0bGU6ICdSZW1vdmUnLCBhbGlnbjogJ2NlbnRlcicsICBmb3JtYXR0ZXI6IGxpbmtSZW1vdmVDb2x1bW5zRm9ybWF0dGVyLFxuICAgICAgICAgICAgICAgIGV2ZW50czogeyAnY2xpY2sgLmVkaXRhYmxlLXJlbW92ZSc6IGZ1bmN0aW9uICggLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgICAgICAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZW1vdmUnLCB7IGZpZWxkOiAnaWQnLCB2YWx1ZXM6IFsgYXJnc1syXS5pZCBdIH0pO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSh7XG4gICAgICAgICAgICB1cmw6ICcvYXNzZXRzL2RhdGExLmpzb24nLFxuICAgICAgICAgICAgbW9iaWxlUmVzcG9uc2l2ZTogdHJ1ZSwgbWluV2lkdGg6IDc2NyxcbiAgICAgICAgICAgIGNsYXNzZXM6ICd0YWJsZScsXG4gICAgICAgICAgICBwYWdpbmF0aW9uOiB0cnVlLCBwYWdlU2l6ZTogOCwgcGFnZUxpc3Q6ICdbQWxsLCA0MCwgMjUsIDE1LCA4XScsIHNpZGVQYWdpbmF0aW9uOiAnY2xpZW50Jywgc2hvd1BhZ2luYXRpb25Td2l0Y2g6IHRydWUsXG4gICAgICAgICAgICBzZWFyY2g6IHRydWUsIHNob3dGb290ZXI6IGZhbHNlLCBzaG93UmVmcmVzaDogdHJ1ZSwgc2hvd1RvZ2dsZTogdHJ1ZSwgc2hvd0NvbHVtbnM6IHRydWUsIHNob3dFeHBvcnQ6IHRydWUsIGRldGFpbFZpZXc6IGZhbHNlLFxuICAgICAgICAgICAgaWRGaWVsZDogJ2lkJywgdG9vbGJhcjogJyN1c2VyLXRvb2xiYXInLCBtaW5pbXVtQ291bnRDb2x1bW5zOiAnMicsIC8qZXhwb3J0VHlwZXM6IFsgJ2pzb24nLCAneG1sJywgJ3BuZycsICdjc3YnLCAndHh0JywgJ3NxbCcsICdkb2MnLCAnZXhjZWwnLCAneGxzeCcsICdwZGYnXSwqL1xuICAgICAgICAgICAgZGV0YWlsRm9ybWF0dGVyOiBkZXRhaWxGb3JtYXR0ZXIsIHJlc3BvbnNlSGFuZGxlcjogcmVzcG9uc2VIYW5kbGVyLFxuICAgICAgICAgICAgaWNvbnM6IHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uU3dpdGNoRG93bjogJ2ljb24tYXJyb3ctZG93bi1jaXJjbGUnLCBwYWdpbmF0aW9uU3dpdGNoVXA6ICdpY29uLWFycm93LXVwLWNpcmNsZScsXG4gICAgICAgICAgICAgICAgcmVmcmVzaDogJ2ljb24tcmVmcmVzaCcsIHRvZ2dsZTogJ2ljb24tbGlzdCcsIGNvbHVtbnM6ICdpY29uLWdyaWQnLCAnZXhwb3J0JzogJ2ljb24tc2hhcmUtYWx0JyxcbiAgICAgICAgICAgICAgICBkZXRhaWxPcGVuOiAnaWNvbi1wbHVzJywgZGV0YWlsQ2xvc2U6ICdpY29uLW1pbnVzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb2x1bW5zOiBjb2x1bW5zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHNvbWV0aW1lcyBmb290ZXIgcmVuZGVyIGVycm9yLlxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ3Jlc2V0VmlldycpLCAyMDAgKTtcblxuICAgICAgICAkdGFibGUub24oJ2NoZWNrLmJzLnRhYmxlIHVuY2hlY2suYnMudGFibGUgY2hlY2stYWxsLmJzLnRhYmxlIHVuY2hlY2stYWxsLmJzLnRhYmxlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHJlbW92ZS5wcm9wKCdkaXNhYmxlZCcsICEkdGFibGUuYm9vdHN0cmFwVGFibGUoJ2dldFNlbGVjdGlvbnMnKS5sZW5ndGgpO1xuICAgICAgICAgICAgc2VsZWN0aW9ucyA9IGdldElkU2VsZWN0aW9ucyggdGhpcyApO1xuICAgICAgICB9KTtcblxuICAgICAgICAkdGFibGUub24oJ2FsbC5icy50YWJsZScsIHN0eWxlQ2hlY2tib3hlcyk7XG4gICAgICAgICQoJyNidC10YWJsZS1tb2RhbCcpLmFwcGVuZFRvKCR0YWJsZS5wYXJlbnQoKSkuZmluZCgnLm1vZGFsLWJvZHknKS5hcHBlbmQoICgpID0+IHtcbiAgICAgICAgICAgIGNvbHMgPSBjb2x1bW5zLnNsaWNlKDIpO1xuICAgICAgICAgICAgY29scy5wb3AoKTtcbiAgICAgICAgICAgIGxldCBodG1sOiBhbnlbXSA9IFtdO1xuXG4gICAgICAgICAgICAkLmVhY2goIGNvbHMsIGZ1bmN0aW9uIChrZXksIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBodG1sLnB1c2goJzxkaXYgY2xhc3M9XCJyb3cgbWItM1wiPjxkaXYgY2xhc3M9XCJjb2wtNCB0ZXh0LXJpZ2h0XCI+PGI+JyArIHZhbHVlLnRpdGxlICsgJzo8L2I+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC04XCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sIGJ0LW1vZGFsLWlucHV0LScgKyB2YWx1ZS5maWVsZCArICdcIiAvPjwvZGl2PjwvZGl2PicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5qb2luKCcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJlbW92ZS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgaWRzID0gZ2V0SWRTZWxlY3Rpb25zKCAkdGFibGVbMF0gKTtcbiAgICAgICAgICAgIGFsZXJ0KGlkcyk7XG4gICAgICAgICAgICAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ3JlbW92ZScsIHsgZmllbGQ6ICdpZCcsIHZhbHVlczogaWRzIH0pO1xuICAgICAgICAgICAgJHJlbW92ZS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkbmV3LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXREYXRhJyk7XG4gICAgICAgICAgICBsZXQgJG1vZGFsID0gJCgnI2J0LXRhYmxlLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICAgICRtb2RhbC5maW5kKCcuaW1hZ2V1cGxvYWQnKS5pbWFnZXVwbG9hZCgpO1xuICAgICAgICAgICAgJG1vZGFsLmZpbmQoJy5hZGQtZGF0YScpLm9mZigpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICBuZXdJZCA9IG5ld0lkID8gKytuZXdJZCA6IGRhdGEgJiYgZGF0YS5sZW5ndGggJiYgZGF0YVsgZGF0YS5sZW5ndGggLSAxIF0uaWQgPyBkYXRhWyBkYXRhLmxlbmd0aCAtIDEgXS5pZDogMDtcbiAgICAgICAgICAgICAgICBsZXQgJGlucHV0cyA9ICRtb2RhbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgIGxldCBpbWFnZSA9ICRtb2RhbC5maW5kKCcuaW1hZ2V1cGxvYWQgaW1nJykuYXR0cignc3JjJyk7XG4gICAgICAgICAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdpbnNlcnRSb3cnLCB7IGluZGV4OiAwLFxuICAgICAgICAgICAgICAgICAgICByb3c6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBuZXdJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBpbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogKDxhbnk+JGlucHV0c1szXSkudmFsdWUgPyAoPGFueT4kaW5wdXRzWzNdKS52YWx1ZSA6ICdlbXB0eScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogKDxhbnk+JGlucHV0c1s0XSkudmFsdWUgPyAoPGFueT4kaW5wdXRzWzRdKS52YWx1ZSA6ICdlbXB0eScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnY3JlZGl0LWNhcmQnOiAoPGFueT4kaW5wdXRzWzVdKS52YWx1ZSA/ICg8YW55PiRpbnB1dHNbNV0pLnZhbHVlIDogJ2VtcHR5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdqb2ItdGl0bGUnOiAoPGFueT4kaW5wdXRzWzZdKS52YWx1ZSA/ICg8YW55PiRpbnB1dHNbNl0pLnZhbHVlIDogJ2VtcHR5J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiggKDxhbnk+JG1vZGFsLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpWzBdKS5jaGVja2VkID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgICAgICAgJGlucHV0cy52YWwoJycpO1xuICAgICAgICAgICAgICAgICAgICAkbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRuZXcucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gaW5pdFRhYmxlQWR2YW5jZWRGaWx0ZXJzKCBlbDogRWxlbWVudCB8IFN0cmluZyApIHtcbiAgICAgICAgbGV0ICR0YWJsZSA9ICQoIGVsICk7XG4gICAgICAgIGlmICggISR0YWJsZVswXSApIHJldHVybjtcbiAgICAgICAgbGV0IG5ld0lkOiBhbnkgPSAwO1xuICAgICAgICBsZXQgY29scyA9IFtdO1xuICAgICAgICBsZXQgY29sdW1ucyA9ICBbXG4gICAgICAgICAgICB7IGZpZWxkOiAnc3RhdGUnLCBjaGVja2JveDogdHJ1ZSwgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnaWQnLCB0aXRsZTogJ0lEJywgYWxpZ246ICdjZW50ZXInLCB2aXNpYmxlOiBmYWxzZSB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ25hbWUnLCAgdGl0bGU6ICdOYW1lJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnY2VudGVyJywgZWRpdGFibGU6IHt9LCAnY2xhc3MnOiAnZWRpdGFibGUnLCBmaWx0ZXJDb250cm9sOiAnaW5wdXQnLCBmaWx0ZXJDb250cm9sUGxhY2Vob2xkZXI6ICcnIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnZW1haWwnLCAgdGl0bGU6ICdFbWFpbCcsICBhbGlnbjogJ2NlbnRlcicsIHNvcnRhYmxlOiB0cnVlLCBlZGl0YWJsZToge30sICdjbGFzcyc6ICdlZGl0YWJsZScsIGZpbHRlckNvbnRyb2w6ICdpbnB1dCcsIGZpbHRlckNvbnRyb2xQbGFjZWhvbGRlcjogJycgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdjcmVkaXQtY2FyZCcsICB0aXRsZTogJ0NyZWRpdCBDYXJkICMnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInLCBlZGl0YWJsZToge30sICdjbGFzcyc6ICdlZGl0YWJsZScsIGZpbHRlckNvbnRyb2w6ICdpbnB1dCcsIGZpbHRlckNvbnRyb2xQbGFjZWhvbGRlcjogJyd9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2pvYi10aXRsZScsICB0aXRsZTogJ0pvYiBUaXRsZScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsIGZpbHRlckNvbnRyb2w6ICdzZWxlY3QnLCBmaWx0ZXJTdHJpY3RTZWFyY2g6IHRydWV9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2RhdGUnLCAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRGF0ZScsIGFsaWduOiAnY2VudGVyJywgIHNvcnRhYmxlOiB0cnVlLCBlZGl0YWJsZToge30sICdjbGFzcyc6ICdlZGl0YWJsZScsIGZpbHRlckNvbnRyb2w6ICdkYXRlJyB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2xpbmsnLCAgdGl0bGU6ICdSZW1vdmUnLCBhbGlnbjogJ2NlbnRlcicsICBmb3JtYXR0ZXI6IGxpbmtSZW1vdmVDb2x1bW5zRm9ybWF0dGVyLFxuICAgICAgICAgICAgICAgIGV2ZW50czogeyAnY2xpY2sgLmVkaXRhYmxlLXJlbW92ZSc6IGZ1bmN0aW9uICggLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgICAgICAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZW1vdmUnLCB7IGZpZWxkOiAnaWQnLCB2YWx1ZXM6IFsgYXJnc1syXS5pZCBdIH0pO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSh7XG4gICAgICAgICAgICB1cmw6ICcvYXNzZXRzL2RhdGEzLmpzb24nLFxuICAgICAgICAgICAgbW9iaWxlUmVzcG9uc2l2ZTogdHJ1ZSwgbWluV2lkdGg6IDc2NyxcbiAgICAgICAgICAgIGNsYXNzZXM6ICd0YWJsZScsXG4gICAgICAgICAgICBwYWdpbmF0aW9uOiB0cnVlLCBwYWdlU2l6ZTogMTAsIHBhZ2VMaXN0OiAnW0FsbCwgNDAsIDMwLCAyMCwgMTBdJywgc2lkZVBhZ2luYXRpb246ICdjbGllbnQnLCBzaG93UGFnaW5hdGlvblN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgIHNlYXJjaDogdHJ1ZSwgc2hvd0Zvb3RlcjogZmFsc2UsIHNob3dSZWZyZXNoOiB0cnVlLCBzaG93VG9nZ2xlOiB0cnVlLCBzaG93Q29sdW1uczogdHJ1ZSwgc2hvd0V4cG9ydDogdHJ1ZSwgZGV0YWlsVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGlkRmllbGQ6ICdpZCcsIHRvb2xiYXI6ICcjdG9vbGJhcicsIG1pbmltdW1Db3VudENvbHVtbnM6ICcyJywgLypleHBvcnRUeXBlczogWyAnanNvbicsICd4bWwnLCAncG5nJywgJ2NzdicsICd0eHQnLCAnc3FsJywgJ2RvYycsICdleGNlbCcsICd4bHN4JywgJ3BkZiddLCovXG4gICAgICAgICAgICBkZXRhaWxGb3JtYXR0ZXI6IGRldGFpbEZvcm1hdHRlciwgcmVzcG9uc2VIYW5kbGVyOiByZXNwb25zZUhhbmRsZXIsXG4gICAgICAgICAgICBmaWx0ZXJDb250cm9sOiB0cnVlLCBmaWx0ZXJTaG93Q2xlYXI6IHRydWUsXG4gICAgICAgICAgICBpY29uczoge1xuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Td2l0Y2hEb3duOiAnaWNvbi1hcnJvdy1kb3duLWNpcmNsZScsIHBhZ2luYXRpb25Td2l0Y2hVcDogJ2ljb24tYXJyb3ctdXAtY2lyY2xlJyxcbiAgICAgICAgICAgICAgICByZWZyZXNoOiAnaWNvbi1yZWZyZXNoJywgdG9nZ2xlOiAnaWNvbi1saXN0JywgY29sdW1uczogJ2ljb24tZ3JpZCcsICdleHBvcnQnOiAnaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgIGRldGFpbE9wZW46ICdpY29uLXBsdXMnLCBkZXRhaWxDbG9zZTogJ2ljb24tbWludXMnLCBjbGVhcjogJ2ljb24tdHJhc2gnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29sdW1uczogY29sdW1ucyxcbiAgICAgICAgICAgIGZpbHRlclRlbXBsYXRlOiB7XG4gICAgICAgICAgICAgICAgaW5wdXQ6IGZ1bmN0aW9uICh0aGF0OiBhbnksIGZpZWxkOiBhbnksIGlzVmlzaWJsZTogYW55LCBwbGFjZWhvbGRlcjogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkLmZuLmJvb3RzdHJhcFRhYmxlLnV0aWxzLnNwcmludGYoJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGJvb3RzdHJhcC10YWJsZS1maWx0ZXItY29udHJvbC0lc1wiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHZpc2liaWxpdHk6ICVzXCIgcGxhY2Vob2xkZXI9XCIlc1wiPicsIGZpZWxkLCBpc1Zpc2libGUsIHBsYWNlaG9sZGVyKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKHRoYXQ6IGFueSwgZmllbGQ6IGFueSwgaXNWaXNpYmxlOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQuZm4uYm9vdHN0cmFwVGFibGUudXRpbHMuc3ByaW50ZihgPGRpdiBjbGFzcz1cInVpIGZsdWlkIHNlbGVjdC1kcm9wZG93biBmb3JtLWNvbnRyb2wgc2VsZWN0aW9uXCIgdGFiaW5kZXg9XCIwXCI+PHNlbGVjdCBjbGFzcz1cImJvb3RzdHJhcC10YWJsZS1maWx0ZXItY29udHJvbC0lc1wiIHN0eWxlPVwid2lkdGg6IDEwMCU7IHZpc2liaWxpdHk6ICVzXCIgZGlyPVwiJXNcIj48L3NlbGVjdD48aSBjbGFzcz1cInNlbGVjdC1kcm9wZG93biBpY29uXCI+PC9pPjxkaXYgY2xhc3M9XCJ0ZXh0XCI+PC9kaXY+PGRpdiBjbGFzcz1cIm1lbnVcIiB0YWJpbmRleD1cIi0xXCI+PC9kaXY+PC9kaXY+YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkLCBpc1Zpc2libGUsIGdldERpcmVjdGlvbk9mU2VsZWN0T3B0aW9ucyh1bmRlZmluZWQpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGU6IGZ1bmN0aW9uICh0aGF0OiBhbnksIGZpZWxkOiBhbnksIGlzVmlzaWJsZTogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cImJzLWRhdGVwaWNrZXIgaW5wdXQtZGF0ZXJhbmdlIGRhdGUtZmlsdGVyLWNvbnRyb2wgYm9vdHN0cmFwLXRhYmxlLWZpbHRlci1jb250cm9sLSR7ZmllbGR9XCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgdmlzaWJpbGl0eTogJHtpc1Zpc2libGV9XCI+YFxuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgdy0xMDAgbWItMVwiIC8+J1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgdy0xMDBcIiAvPidcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJzwvZGl2Pic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGRhdGU6IGFueTtcblxuICAgICAgICAvLyBzb21ldGltZXMgZm9vdGVyIHJlbmRlciBlcnJvci5cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZXNldFZpZXcnKSwgMjAwICk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdjaGVjay5icy50YWJsZSB1bmNoZWNrLmJzLnRhYmxlIGNoZWNrLWFsbC5icy50YWJsZSB1bmNoZWNrLWFsbC5icy50YWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRyZW1vdmUucHJvcCgnZGlzYWJsZWQnLCAhJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXRTZWxlY3Rpb25zJykubGVuZ3RoKTtcbiAgICAgICAgICAgIHNlbGVjdGlvbnMgPSBnZXRJZFNlbGVjdGlvbnMoIHRoaXMgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdsb2FkLXN1Y2Nlc3MuYnMudGFibGUgY29sdW1uLXNlYXJjaC5icy50YWJsZSBzZWFyY2guYnMudGFibGUgY29sdW1uLXN3aXRjaC5icy50YWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICggISBkYXRlICkgZGF0ZSA9ICR0YWJsZS5ib290c3RyYXBUYWJsZSgnZ2V0RGF0YScpO1xuICAgICAgICAgICAgaWYoICEgJHRhYmxlLmZpbmQoJy5icy1kYXRlcGlja2VyJykuZmluZCgnaW5wdXQnKS52YWwoKSApIHJldHVybjtcbiAgICAgICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSgnbG9hZCcsICQuZ3JlcCggZGF0ZSwgZnVuY3Rpb24gKHJvdzogYW55KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIERhdGUucGFyc2Uocm93LmRhdGUpID49IERhdGUucGFyc2UoJHRhYmxlLmZpbmQoJy5icy1kYXRlcGlja2VyIGlucHV0JykudmFsKCkpXG4gICAgICAgICAgICAgICAgICAgICYmIERhdGUucGFyc2Uocm93LmRhdGUpIDw9IERhdGUucGFyc2UoJHRhYmxlLmZpbmQoJy5icy1kYXRlcGlja2VyIGlucHV0JykubGFzdCgpLnZhbCgpKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdwb3N0LWhlYWRlci5icy50YWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICR0YWJsZS5maW5kKCcuYnMtZGF0ZXBpY2tlcicpXG4gICAgICAgICAgICAgICAgLmJzRGF0ZXBpY2tlcih7J2F1dG9jbG9zZSc6dHJ1ZSwgJ2NsZWFyQnRuJzogdHJ1ZSwgZmlsdGVyQ29udHJvbFBsYWNlaG9sZGVyOiAnJywgJ3RvZGF5SGlnaGxpZ2h0JzogdHJ1ZX0pXG4gICAgICAgICAgICAgICAgLm9uKCdzaG93JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkKCcuYnMtZGF0ZXBpY2tlci1kcm9wZG93bicpLmNzcygnb3BhY2l0eScsICcwJykuYWRkQ2xhc3MoJ3RyYW5zaXRpb24gc2NhbGUgaW4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCd0cmFuc2l0aW9uIHNjYWxlIGluJykuY3NzKCdvcGFjaXR5JywgJzEnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKCcuc2VsZWN0LWRyb3Bkb3duJykuc2VsZWN0RHJvcGRvd24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRhYmxlLnBhcmVudHMoJy5ib290c3RyYXAtdGFibGUnKS5maW5kKCcuZmlsdGVyLXNob3ctY2xlYXInKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKCcuc2VsZWN0LWRyb3Bkb3duJykuc2VsZWN0RHJvcGRvd24oJ2NsZWFyJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICR0YWJsZS5vbignbG9hZC1zdWNjZXNzLmJzLnRhYmxlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0ICRtb2RhbCA9ICQoJyNidC10YWJsZS1tb2RhbCcpO1xuICAgICAgICAgICAgaWYgKCAkbW9kYWwuaGFzQ2xhc3MoJ21vZGFsLWNvbnN0cnVjdGVkJykgKSByZXR1cm47XG5cbiAgICAgICAgICAgICRtb2RhbC5hZGRDbGFzcygnbW9kYWwtY29uc3RydWN0ZWQnKS5hcHBlbmRUbygkdGFibGUucGFyZW50KCkpLmZpbmQoJy5tb2RhbC1ib2R5JykuYXBwZW5kKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29scyA9IGNvbHVtbnMuc2xpY2UoMiw2KTtcbiAgICAgICAgICAgICAgICBsZXQgaHRtbDogYW55W10gPSBbXTtcbiAgICAgICAgICAgICAgICAkLmVhY2goIGNvbHMsIGZ1bmN0aW9uIChrZXksIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB2YWx1ZS5maWVsZCA9PT0gJ2pvYi10aXRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCggJzxkaXYgY2xhc3M9XCJyb3cgbWItM1wiPjxkaXYgY2xhc3M9XCJjb2wtNCB0ZXh0LXJpZ2h0XCI+PGI+JyArIHZhbHVlLnRpdGxlICsgJzo8L2I+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC04XCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJzxzZWxlY3QgY2xhc3M9XCJ1aSBmb3JtLWNvbnRyb2wgc2VsZWN0LWRyb3Bkb3duIGZsdWlkIHNlYXJjaCBidC1tb2RhbC1pbnB1dC0nICsgdmFsdWUuZmllbGQgKyAnXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgJCgnLmJvb3RzdHJhcC10YWJsZS1maWx0ZXItY29udHJvbC1qb2ItdGl0bGUnKS5odG1sKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArICc8L3NlbGVjdD48L2Rpdj48L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGh0bWwucHVzaCgnPGRpdiBjbGFzcz1cInJvdyBtYi0zXCI+PGRpdiBjbGFzcz1cImNvbC00IHRleHQtcmlnaHRcIj48Yj4nICsgdmFsdWUudGl0bGUgKyAnOjwvYj48L2Rpdj48ZGl2IGNsYXNzPVwiY29sLThcIj48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2wgYnQtbW9kYWwtaW5wdXQtJyArIHZhbHVlLmZpZWxkICsgJ1wiIC8+PC9kaXY+PC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWwuam9pbignJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJG1vZGFsLmZpbmQoJy5zZWxlY3QtZHJvcGRvd24nKS5zZWxlY3REcm9wZG93bigpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkdGFibGUuZmluZCgnLmJzLWRhdGVwaWNrZXInKVxuICAgICAgICAgICAgLm9uKCdjaGFuZ2VEYXRlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuZmluZCgnaW5wdXQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5rZXl1cCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAkdGFibGUub24oJ2FsbC5icy50YWJsZScsIHN0eWxlQ2hlY2tib3hlcyk7XG5cbiAgICAgICAgJHJlbW92ZS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgaWRzID0gZ2V0SWRTZWxlY3Rpb25zKCAkdGFibGVbMF0gKTtcbiAgICAgICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSgncmVtb3ZlJywgeyBmaWVsZDogJ2lkJywgdmFsdWVzOiBpZHMgfSk7XG4gICAgICAgICAgICAkcmVtb3ZlLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRuZXcuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ2dldERhdGEnKTtcbiAgICAgICAgICAgIGxldCAkbW9kYWwgPSAkKCcjYnQtdGFibGUtbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgJG1vZGFsLmZpbmQoJy5hZGQtZGF0YScpLm9mZigpLmNsaWNrKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbmV3SWQgPSBuZXdJZCA/ICsrbmV3SWQgOiBkYXRhICYmIGRhdGEubGVuZ3RoICYmIGRhdGFbIGRhdGEubGVuZ3RoIC0gMSBdLmlkID8gZGF0YVsgZGF0YS5sZW5ndGggLSAxIF0uaWQ6IDA7XG4gICAgICAgICAgICAgICAgbGV0ICRpbnB1dHMgPSAkbW9kYWwuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBsZXQgJHNlbGVjdHMgPSAkbW9kYWwuZmluZCgnc2VsZWN0Jyk7XG4gICAgICAgICAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdpbnNlcnRSb3cnLCB7IGluZGV4OiAwLFxuICAgICAgICAgICAgICAgICAgICByb3c6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBuZXdJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogKDxhbnk+JGlucHV0c1swXSkudmFsdWUgPyAoPGFueT4kaW5wdXRzWzBdKS52YWx1ZSA6ICdlbXB0eScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogKDxhbnk+JGlucHV0c1sxXSkudmFsdWUgPyAoPGFueT4kaW5wdXRzWzFdKS52YWx1ZSA6ICdlbXB0eScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnam9iLXRpdGxlJzogKDxhbnk+JHNlbGVjdHNbMF0pLnZhbHVlID8gKDxhbnk+JHNlbGVjdHNbMF0pLnZhbHVlIDogJ2VtcHR5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdjcmVkaXQtY2FyZCc6ICg8YW55PiRpbnB1dHNbMl0pLnZhbHVlID8gKDxhbnk+JGlucHV0c1syXSkudmFsdWUgOiAnZW1wdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGUnOiBtb21lbnQoKS5mb3JtYXQoJ2wnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiggKDxhbnk+JG1vZGFsLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpWzBdKS5jaGVja2VkID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgICAgICAgJGlucHV0cy52YWwoJycpO1xuICAgICAgICAgICAgICAgICAgICAkbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRuZXcucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRUYWJsZU5ld0luTW9kYWwoIGVsOiBFbGVtZW50IHwgU3RyaW5nICkge1xuICAgICAgICBsZXQgJHRhYmxlID0gJCggZWwgKTtcbiAgICAgICAgaWYgKCAhJHRhYmxlWzBdICkgcmV0dXJuO1xuICAgICAgICBsZXQgbmV3SWQ6IGFueSA9IDA7XG4gICAgICAgIGxldCBjb2xzID0gW107XG4gICAgICAgIGxldCBjb2x1bW5zID0gIFtcbiAgICAgICAgICAgIHsgZmllbGQ6ICdzdGF0ZScsIGNoZWNrYm94OiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsICB2YWxpZ246ICdtaWRkbGUnIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnaWQnLCAgdGl0bGU6ICdJRCcsIHdpZHRoOiA0MCwgYWxpZ246ICdjZW50ZXInLCAgdmFsaWduOiAnbWlkZGxlJywgIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnbmFtZScsICB0aXRsZTogJ05hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInLCBlZGl0YWJsZToge30sICdjbGFzcyc6ICdlZGl0YWJsZSd9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2VtYWlsJywgIHRpdGxlOiAnRW1haWwnLCAgYWxpZ246ICdjZW50ZXInLCBzb3J0YWJsZTogdHJ1ZSwgZWRpdGFibGU6IHt9LCAnY2xhc3MnOiAnZWRpdGFibGUnIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnY3JlZGl0LWNhcmQnLCAgdGl0bGU6ICdDcmVkaXQgQ2FyZCAjJywgc29ydGFibGU6IHRydWUsIGFsaWduOiAnY2VudGVyJywgZWRpdGFibGU6IHt9LCAnY2xhc3MnOiAnZWRpdGFibGUnfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdqb2ItdGl0bGUnLCAgdGl0bGU6ICdKb2IgVGl0bGUnLCBzb3J0YWJsZTogdHJ1ZSwgYWxpZ246ICdjZW50ZXInLCBlZGl0YWJsZToge30sICdjbGFzcyc6ICdlZGl0YWJsZSd9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2xpbmsnLCAgdGl0bGU6ICdSZW1vdmUnLCBhbGlnbjogJ2NlbnRlcicsICBmb3JtYXR0ZXI6IGxpbmtSZW1vdmVDb2x1bW5zRm9ybWF0dGVyLFxuICAgICAgICAgICAgICAgIGV2ZW50czogeyAnY2xpY2sgLmVkaXRhYmxlLXJlbW92ZSc6IGZ1bmN0aW9uICggLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgICAgICAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZW1vdmUnLCB7IGZpZWxkOiAnaWQnLCB2YWx1ZXM6IFsgYXJnc1syXS5pZCBdIH0pO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSh7XG4gICAgICAgICAgICB1cmw6ICcvYXNzZXRzL2RhdGExLmpzb24nLFxuICAgICAgICAgICAgbW9iaWxlUmVzcG9uc2l2ZTogdHJ1ZSwgbWluV2lkdGg6IDc2NyxcbiAgICAgICAgICAgIGNsYXNzZXM6ICd0YWJsZScsXG4gICAgICAgICAgICBwYWdpbmF0aW9uOiB0cnVlLCBwYWdlU2l6ZTogMTAsIHBhZ2VMaXN0OiAnW0FsbCwgNDAsIDMwLCAyMCwgMTBdJywgc2lkZVBhZ2luYXRpb246ICdjbGllbnQnLCBzaG93UGFnaW5hdGlvblN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgIHNlYXJjaDogdHJ1ZSwgc2hvd0Zvb3RlcjogZmFsc2UsIHNob3dSZWZyZXNoOiB0cnVlLCBzaG93VG9nZ2xlOiB0cnVlLCBzaG93Q29sdW1uczogdHJ1ZSwgc2hvd0V4cG9ydDogdHJ1ZSwgZGV0YWlsVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGlkRmllbGQ6ICdpZCcsIHRvb2xiYXI6ICcjdG9vbGJhcicsIG1pbmltdW1Db3VudENvbHVtbnM6ICcyJywgLypleHBvcnRUeXBlczogWyAnanNvbicsICd4bWwnLCAncG5nJywgJ2NzdicsICd0eHQnLCAnc3FsJywgJ2RvYycsICdleGNlbCcsICd4bHN4JywgJ3BkZiddLCovXG4gICAgICAgICAgICBkZXRhaWxGb3JtYXR0ZXI6IGRldGFpbEZvcm1hdHRlciwgcmVzcG9uc2VIYW5kbGVyOiByZXNwb25zZUhhbmRsZXIsXG4gICAgICAgICAgICBpY29uczoge1xuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Td2l0Y2hEb3duOiAnaWNvbi1hcnJvdy1kb3duLWNpcmNsZScsIHBhZ2luYXRpb25Td2l0Y2hVcDogJ2ljb24tYXJyb3ctdXAtY2lyY2xlJyxcbiAgICAgICAgICAgICAgICByZWZyZXNoOiAnaWNvbi1yZWZyZXNoJywgdG9nZ2xlOiAnaWNvbi1saXN0JywgY29sdW1uczogJ2ljb24tZ3JpZCcsICdleHBvcnQnOiAnaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgIGRldGFpbE9wZW46ICdpY29uLXBsdXMnLCBkZXRhaWxDbG9zZTogJ2ljb24tbWludXMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzIGZvb3RlciByZW5kZXIgZXJyb3IuXG4gICAgICAgIHNldFRpbWVvdXQoICgpID0+ICR0YWJsZS5ib290c3RyYXBUYWJsZSgncmVzZXRWaWV3JyksIDIwMCApO1xuXG4gICAgICAgICR0YWJsZS5vbignY2hlY2suYnMudGFibGUgdW5jaGVjay5icy50YWJsZSBjaGVjay1hbGwuYnMudGFibGUgdW5jaGVjay1hbGwuYnMudGFibGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkcmVtb3ZlLnByb3AoJ2Rpc2FibGVkJywgISR0YWJsZS5ib290c3RyYXBUYWJsZSgnZ2V0U2VsZWN0aW9ucycpLmxlbmd0aCk7XG4gICAgICAgICAgICBzZWxlY3Rpb25zID0gZ2V0SWRTZWxlY3Rpb25zKCB0aGlzICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICR0YWJsZS5vbignYWxsLmJzLnRhYmxlJywgc3R5bGVDaGVja2JveGVzKTtcbiAgICAgICAgJCgnI2J0LXRhYmxlLW1vZGFsJykuYXBwZW5kVG8oJHRhYmxlLnBhcmVudCgpKS5maW5kKCcubW9kYWwtYm9keScpLmFwcGVuZCggKCkgPT4ge1xuICAgICAgICAgICAgY29scyA9IGNvbHVtbnMuc2xpY2UoMik7XG4gICAgICAgICAgICBjb2xzLnBvcCgpO1xuICAgICAgICAgICAgbGV0IGh0bWw6IGFueVtdID0gW107XG4gICAgICAgICAgICAkLmVhY2goIGNvbHMsIGZ1bmN0aW9uIChrZXksIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBodG1sLnB1c2goJzxkaXYgY2xhc3M9XCJyb3cgbWItM1wiPjxkaXYgY2xhc3M9XCJjb2wtNCB0ZXh0LXJpZ2h0XCI+PGI+JyArIHZhbHVlLnRpdGxlICsgJzo8L2I+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC04XCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sIGJ0LW1vZGFsLWlucHV0LScgKyB2YWx1ZS5maWVsZCArICdcIiAvPjwvZGl2PjwvZGl2PicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5qb2luKCcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJlbW92ZS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgaWRzID0gZ2V0SWRTZWxlY3Rpb25zKCAkdGFibGVbMF0gKTtcbiAgICAgICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSgncmVtb3ZlJywgeyBmaWVsZDogJ2lkJywgdmFsdWVzOiBpZHMgfSk7XG4gICAgICAgICAgICAkcmVtb3ZlLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRuZXcuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ2dldERhdGEnKTtcbiAgICAgICAgICAgIGxldCAkbW9kYWwgPSAkKCcjYnQtdGFibGUtbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgJG1vZGFsLmZpbmQoJy5hZGQtZGF0YScpLm9mZigpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICBuZXdJZCA9IG5ld0lkID8gKytuZXdJZCA6IGRhdGEgJiYgZGF0YS5sZW5ndGggJiYgZGF0YVsgZGF0YS5sZW5ndGggLSAxIF0uaWQgPyBkYXRhWyBkYXRhLmxlbmd0aCAtIDEgXS5pZDogMDtcbiAgICAgICAgICAgICAgICBsZXQgJGlucHV0cyA9ICRtb2RhbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSgnaW5zZXJ0Um93JywgeyBpbmRleDogMCxcbiAgICAgICAgICAgICAgICAgICAgcm93OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbmV3SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6ICg8YW55PiRpbnB1dHNbMF0pLnZhbHVlID8gKDxhbnk+JGlucHV0c1swXSkudmFsdWUgOiAnZW1wdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6ICg8YW55PiRpbnB1dHNbMV0pLnZhbHVlID8gKDxhbnk+JGlucHV0c1sxXSkudmFsdWUgOiAnZW1wdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2pvYi10aXRsZSc6ICg8YW55PiRpbnB1dHNbMl0pLnZhbHVlID8gKDxhbnk+JGlucHV0c1syXSkudmFsdWUgOiAnZW1wdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2NyZWRpdC1jYXJkJzogKDxhbnk+JGlucHV0c1szXSkudmFsdWUgPyAoPGFueT4kaW5wdXRzWzNdKS52YWx1ZSA6ICdlbXB0eSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYoICg8YW55PiRtb2RhbC5maW5kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVswXSkuY2hlY2tlZCA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgICAgICAgICRpbnB1dHMudmFsKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgJG1vZGFsLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkbmV3LnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0VGFibGVFZGl0Q29sdW1ucyggZWw6IEVsZW1lbnQgfCBTdHJpbmcgKSB7XG4gICAgICAgIGxldCAkdGFibGUgPSAkKCBlbCApO1xuICAgICAgICBpZiAoICEkdGFibGVbMF0gKSByZXR1cm47XG4gICAgICAgIGxldCBuZXdJZDogYW55ID0gMDtcblxuICAgICAgICAkdGFibGUuYm9vdHN0cmFwVGFibGUoe1xuICAgICAgICAgICAgdXJsOiAnL2Fzc2V0cy9kYXRhMi5qc29uJyxcbiAgICAgICAgICAgIG1vYmlsZVJlc3BvbnNpdmU6IHRydWUsIG1pbldpZHRoOiA3NjcsXG4gICAgICAgICAgICBjbGFzc2VzOiAndGFibGUgdGFibGUtbm8tYm9yZGVyZWQnLFxuICAgICAgICAgICAgcGFnaW5hdGlvbjogdHJ1ZSwgcGFnZVNpemU6IDEwLCBwYWdlTGlzdDogJ1tBbGwsIDQwLCAzMCwgMjAsIDEwXScsIHNpZGVQYWdpbmF0aW9uOiAnY2xpZW50Jywgc2hvd1BhZ2luYXRpb25Td2l0Y2g6IHRydWUsXG4gICAgICAgICAgICBzZWFyY2g6IHRydWUsIHNob3dGb290ZXI6IGZhbHNlLCBzaG93UmVmcmVzaDogdHJ1ZSwgc2hvd1RvZ2dsZTogdHJ1ZSwgc2hvd0NvbHVtbnM6IHRydWUsIHNob3dFeHBvcnQ6IHRydWUsIGRldGFpbFZpZXc6IHRydWUsXG4gICAgICAgICAgICBpZEZpZWxkOiAnaWQnLCB0b29sYmFyOiAnI3Rvb2xiYXInLCBtaW5pbXVtQ291bnRDb2x1bW5zOiAnMicsIC8qZXhwb3J0VHlwZXM6IFsgJ2pzb24nLCAneG1sJywgJ3BuZycsICdjc3YnLCAndHh0JywgJ3NxbCcsICdkb2MnLCAnZXhjZWwnLCAneGxzeCcsICdwZGYnXSwqL1xuICAgICAgICAgICAgZGV0YWlsRm9ybWF0dGVyOiBkZXRhaWxGb3JtYXR0ZXIsIHJlc3BvbnNlSGFuZGxlcjogcmVzcG9uc2VIYW5kbGVyLFxuICAgICAgICAgICAgaWNvbnM6IHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uU3dpdGNoRG93bjogJ2ljb24tYXJyb3ctZG93bi1jaXJjbGUnLCBwYWdpbmF0aW9uU3dpdGNoVXA6ICdpY29uLWFycm93LXVwLWNpcmNsZScsXG4gICAgICAgICAgICAgICAgcmVmcmVzaDogJ2ljb24tcmVmcmVzaCcsIHRvZ2dsZTogJ2ljb24tbGlzdCcsIGNvbHVtbnM6ICdpY29uLWdyaWQnLCAnZXhwb3J0JzogJ2ljb24tc2hhcmUtYWx0JyxcbiAgICAgICAgICAgICAgICBkZXRhaWxPcGVuOiAnaWNvbi1wbHVzJywgZGV0YWlsQ2xvc2U6ICdpY29uLW1pbnVzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb2x1bW5zOiBbXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ3N0YXRlJywgY2hlY2tib3g6IHRydWUsIGFsaWduOiAnY2VudGVyJywgIHZhbGlnbjogJ21pZGRsZScgfSxcbiAgICAgICAgICAgICAgICB7IGZpZWxkOiAnaWQnLCAgdGl0bGU6ICdJRCcsIHdpZHRoOiA0MCwgYWxpZ246ICdjZW50ZXInLCAgdmFsaWduOiAnbWlkZGxlJywgIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2NvbXBhbnktbmFtZScsICB0aXRsZTogJ0NvbXBhbnkgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsIGVkaXRhYmxlOiB7fSwgJ2NsYXNzJzogJ2VkaXRhYmxlJ30sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ3N0cmVldC1hZGRyZXNzJywgdGl0bGU6ICdTdHJlZXQgQWRkcmVzcycsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsIGVkaXRhYmxlOiB7fSwgJ2NsYXNzJzogJ2VkaXRhYmxlJ30sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ3Bob25lJywgIHRpdGxlOiAnUGhvbmUnLCAgYWxpZ246ICdjZW50ZXInLCBzb3J0YWJsZTogdHJ1ZSwgZWRpdGFibGU6IHt9LCAnY2xhc3MnOiAnZWRpdGFibGUnIH0sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2VtcGxveWVlcycsICB0aXRsZTogJ0VtcGxveWVlcycsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsIGVkaXRhYmxlOiB7fSwgJ2NsYXNzJzogJ2VkaXRhYmxlJ30sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2xpbmsnLCAgdGl0bGU6ICdSZW1vdmUnLCBhbGlnbjogJ2NlbnRlcicsICBmb3JtYXR0ZXI6IGxpbmtSZW1vdmVDb2x1bW5zRm9ybWF0dGVyLFxuICAgICAgICAgICAgICAgICAgICBldmVudHM6IHsgJ2NsaWNrIC5lZGl0YWJsZS1yZW1vdmUnOiBmdW5jdGlvbiAoIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ3JlbW92ZScsIHsgZmllbGQ6ICdpZCcsIHZhbHVlczogWyBhcmdzWzJdLmlkIF0gfSk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzb21ldGltZXMgZm9vdGVyIHJlbmRlciBlcnJvci5cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZXNldFZpZXcnKSwgMjAwICk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdjaGVjay5icy50YWJsZSB1bmNoZWNrLmJzLnRhYmxlIGNoZWNrLWFsbC5icy50YWJsZSB1bmNoZWNrLWFsbC5icy50YWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRyZW1vdmUucHJvcCgnZGlzYWJsZWQnLCAhJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXRTZWxlY3Rpb25zJykubGVuZ3RoKTtcbiAgICAgICAgICAgIHNlbGVjdGlvbnMgPSBnZXRJZFNlbGVjdGlvbnMoIHRoaXMgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdhbGwuYnMudGFibGUnLCBzdHlsZUNoZWNrYm94ZXMpO1xuXG4gICAgICAgICRyZW1vdmUuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGlkcyA9IGdldElkU2VsZWN0aW9ucyggJHRhYmxlWzBdICk7XG4gICAgICAgICAgICAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ3JlbW92ZScsIHsgZmllbGQ6ICdpZCcsIHZhbHVlczogaWRzIH0pO1xuICAgICAgICAgICAgJHJlbW92ZS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkbmV3LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXREYXRhJyk7XG4gICAgICAgICAgICBuZXdJZCA9IG5ld0lkID8gKytuZXdJZCA6IGRhdGEgJiYgZGF0YS5sZW5ndGggJiYgZGF0YVsgZGF0YS5sZW5ndGggLSAxIF0uaWQgPyBkYXRhWyBkYXRhLmxlbmd0aCAtIDEgXS5pZDogMDtcbiAgICAgICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSgnaW5zZXJ0Um93Jywge1xuICAgICAgICAgICAgICAgIGluZGV4OiAwLCByb3c6IHsgaWQ6IG5ld0lkLCAnY29tcGFueS1uYW1lJzogJ2VtcHR5JywgcGhvbmU6ICdlbXB0eScsICdzdHJlZXQtYWRkcmVzcyc6ICdlbXB0eScsIGVtcGxveWVlczogMCB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRuZXcucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRUYWJsZUVkaXRSb3dzKCBlbDogRWxlbWVudCB8IFN0cmluZyApIHtcbiAgICAgICAgbGV0ICR0YWJsZSA9ICQoZWwpO1xuICAgICAgICBpZiAoICEkdGFibGVbMF0gKSByZXR1cm47XG4gICAgICAgIGxldCBuZXdJZDogYW55ID0gMDtcblxuICAgICAgICAkdGFibGUuYm9vdHN0cmFwVGFibGUoe1xuICAgICAgICAgICAgdXJsOiAnL2Fzc2V0cy9kYXRhMi5qc29uJyxcbiAgICAgICAgICAgIG1vYmlsZVJlc3BvbnNpdmU6IHRydWUsIG1pbldpZHRoOiA3NjcsXG4gICAgICAgICAgICBjbGFzc2VzOiAndGFibGUgdGFibGUtbm8tYm9yZGVyZWQnLFxuICAgICAgICAgICAgcGFnaW5hdGlvbjogdHJ1ZSwgcGFnZVNpemU6IDEyLCBwYWdlTGlzdDogJ1tBbGwsIDQwLCAzMCwgMjAsIDEyXScsIHNpZGVQYWdpbmF0aW9uOiAnY2xpZW50Jywgc2hvd1BhZ2luYXRpb25Td2l0Y2g6IHRydWUsXG4gICAgICAgICAgICBzZWFyY2g6IHRydWUsIHNob3dGb290ZXI6IGZhbHNlLCBzaG93UmVmcmVzaDogdHJ1ZSwgc2hvd1RvZ2dsZTogdHJ1ZSwgc2hvd0NvbHVtbnM6IHRydWUsIHNob3dFeHBvcnQ6IHRydWUsIGRldGFpbFZpZXc6IHRydWUsXG4gICAgICAgICAgICBpZEZpZWxkOiAnaWQnLCB0b29sYmFyOiAnI3Rvb2xiYXInLCBtaW5pbXVtQ291bnRDb2x1bW5zOiAnMicsIC8qZXhwb3J0VHlwZXM6IFsgJ2pzb24nLCAneG1sJywgJ3BuZycsICdjc3YnLCAndHh0JywgJ3NxbCcsICdkb2MnLCAnZXhjZWwnLCAneGxzeCcsICdwZGYnXSwqL1xuICAgICAgICAgICAgZGV0YWlsRm9ybWF0dGVyOiBkZXRhaWxGb3JtYXR0ZXIsIHJlc3BvbnNlSGFuZGxlcjogcmVzcG9uc2VIYW5kbGVyLFxuICAgICAgICAgICAgaWNvbnM6IHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uU3dpdGNoRG93bjogJ2ljb24tYXJyb3ctZG93bi1jaXJjbGUnLCBwYWdpbmF0aW9uU3dpdGNoVXA6ICdpY29uLWFycm93LXVwLWNpcmNsZScsXG4gICAgICAgICAgICAgICAgcmVmcmVzaDogJ2ljb24tcmVmcmVzaCcsIHRvZ2dsZTogJ2ljb24tbGlzdCcsIGNvbHVtbnM6ICdpY29uLWdyaWQnLCAnZXhwb3J0JzogJ2ljb24tc2hhcmUtYWx0JyxcbiAgICAgICAgICAgICAgICBkZXRhaWxPcGVuOiAnaWNvbi1wbHVzJywgZGV0YWlsQ2xvc2U6ICdpY29uLW1pbnVzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb2x1bW5zOiBbXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ3N0YXRlJywgY2hlY2tib3g6IHRydWUsIGFsaWduOiAnY2VudGVyJywgIHZhbGlnbjogJ21pZGRsZScgfSxcbiAgICAgICAgICAgICAgICB7IGZpZWxkOiAnaWQnLCAgdGl0bGU6ICdJRCcsIHdpZHRoOiA0MCwgYWxpZ246ICdjZW50ZXInLCAgdmFsaWduOiAnbWlkZGxlJywgIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2NvbXBhbnktbmFtZScsICB0aXRsZTogJ0NvbXBhbnkgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsIGVkaXRhYmxlOiB7fSwgJ2NsYXNzJzogJ2VkaXRhYmxlJ30sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ3N0cmVldC1hZGRyZXNzJywgdGl0bGU6ICdTdHJlZXQgQWRkcmVzcycsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsIGVkaXRhYmxlOiB7fSwgJ2NsYXNzJzogJ2VkaXRhYmxlJ30sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ3Bob25lJywgIHRpdGxlOiAnUGhvbmUnLCAgYWxpZ246ICdjZW50ZXInLCBzb3J0YWJsZTogdHJ1ZSwgZWRpdGFibGU6IHt9LCAnY2xhc3MnOiAnZWRpdGFibGUnIH0sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2VtcGxveWVlcycsICB0aXRsZTogJ0VtcGxveWVlcycsIHNvcnRhYmxlOiB0cnVlLCBhbGlnbjogJ2NlbnRlcicsIGVkaXRhYmxlOiB7fSwgJ2NsYXNzJzogJ2VkaXRhYmxlJ30sXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2xpbmsnLCAgdGl0bGU6ICdFZGl0JywgYWxpZ246ICdjZW50ZXInLCAgZm9ybWF0dGVyOiBsaW5rRWRpdFJvd3NGb3JtYXR0ZXIgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzb21ldGltZXMgZm9vdGVyIHJlbmRlciBlcnJvci5cbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4gJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdyZXNldFZpZXcnKSwgMjAwICk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdjaGVjay5icy50YWJsZSB1bmNoZWNrLmJzLnRhYmxlIGNoZWNrLWFsbC5icy50YWJsZSB1bmNoZWNrLWFsbC5icy50YWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRyZW1vdmUucHJvcCgnZGlzYWJsZWQnLCAhJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdnZXRTZWxlY3Rpb25zJykubGVuZ3RoKTtcbiAgICAgICAgICAgIHNlbGVjdGlvbnMgPSBnZXRJZFNlbGVjdGlvbnMoIHRoaXMgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRhYmxlLm9uKCdhbGwuYnMudGFibGUnLCBzdHlsZUNoZWNrYm94ZXMpO1xuICAgICAgICAkdGFibGUub24oJ3Jlc2V0LXZpZXcuYnMudGFibGUnLCBlZGl0SGFuZGxlci5iaW5kKCAkdGFibGVbMF0gKSk7XG5cbiAgICAgICAgJHJlbW92ZS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgaWRzID0gZ2V0SWRTZWxlY3Rpb25zKCAkdGFibGVbMF0gKTtcbiAgICAgICAgICAgICR0YWJsZS5ib290c3RyYXBUYWJsZSgncmVtb3ZlJywgeyBmaWVsZDogJ2lkJywgdmFsdWVzOiBpZHMgfSk7XG4gICAgICAgICAgICAkcmVtb3ZlLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRuZXcuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSAkdGFibGUuYm9vdHN0cmFwVGFibGUoJ2dldERhdGEnKTtcbiAgICAgICAgICAgIG5ld0lkID0gbmV3SWQgPyArK25ld0lkIDogZGF0YSAmJiBkYXRhLmxlbmd0aCAmJiBkYXRhWyBkYXRhLmxlbmd0aCAtIDEgXS5pZCA/IGRhdGFbIGRhdGEubGVuZ3RoIC0gMSBdLmlkOiAwO1xuICAgICAgICAgICAgJHRhYmxlLmJvb3RzdHJhcFRhYmxlKCdpbnNlcnRSb3cnLCB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IDAsIHJvdzogeyBpZDogbmV3SWQsICdjb21wYW55LW5hbWUnOiAnZW1wdHknLCBwaG9uZTogJ2VtcHR5JywgJ3N0cmVldC1hZGRyZXNzJzogJ2VtcHR5JywgZW1wbG95ZWVzOiAwIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJG5ldy5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZWRpdEhhbmRsZXIoKSB7XG4gICAgICAgIGxldCAkdGFibGUgPSAkKHRoaXMpO1xuICAgICAgICAkKCcuZWRpdGFibGUtY2FuY2VsLCAuZWRpdGFibGUtc3VibWl0JykuaGlkZSgpO1xuXG4gICAgICAgIGxldCAkZWRpdGFibGUgPSAkdGFibGUuZmluZCgnLmVkaXRhYmxlIGEnKTtcbiAgICAgICAgJGVkaXRhYmxlLmVkaXRhYmxlKHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JywgZW1wdHl0ZXh0OiAnJywgc2hvd2J1dHRvbnM6IGZhbHNlLCB1bnNhdmVkY2xhc3M6IG51bGwsIHRvZ2dsZTogJ21hbnVhbCcsIG9uYmx1cjogJ2lnbm9yZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gc3VibWl0RWRpdGFibGUoIGVsOiBIVE1MRWxlbWVudCApIHtcbiAgICAgICAgICAgICQoZWwpLmZpbmQoJy5lZGl0YWJsZWZvcm0nKS5zdWJtaXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICR0YWJsZS5maW5kKCAnLmVkaXQtcm93JyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgJHRyID0gJCggdGhpcyApLnBhcmVudHMoICd0cicgKTtcbiAgICAgICAgICAgIGxldCBidG5zID0gJHRyLmZpbmQoJy5lZGl0YWJsZS1jYW5jZWwsIC5lZGl0YWJsZS1zdWJtaXQnKS5zaG93KCk7XG4gICAgICAgICAgICAkKHRoaXMpLmhpZGUoKTtcblxuICAgICAgICAgICAgJHRyLmZpbmQoICcuZWRpdGFibGUgYScgKS5lYWNoKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCggdGhpcyApLmVkaXRhYmxlKCAnc2hvdycgKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+ICR0ci5maW5kKCcuZm9ybS1jb250cm9sJykuZmlyc3QoKS5mb2N1cygpLCAxMCApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkdHIuZmluZCgnLmVkaXRhYmxlZm9ybScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGUua2V5Q29kZSB8fCBlLndoaWNoKSA9PT0gMTMpIHsgc3VibWl0RWRpdGFibGUoICR0clswXSApOyB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnRucy5jbGljayggZnVuY3Rpb24gKGU6IEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYoICQoIGUudGFyZ2V0ICkuaXMoJy5lZGl0YWJsZS1zdWJtaXQnKSkgc3VibWl0RWRpdGFibGUoICR0clswXSApO1xuICAgICAgICAgICAgICAgICR0ci5maW5kKCAnLmVkaXRhYmxlIGEnICkuZWRpdGFibGUoICdoaWRlJyApO1xuICAgICAgICAgICAgICAgICR0ci5maW5kKCAnLmVkaXQtcm93JyApLnNob3coKTtcbiAgICAgICAgICAgICAgICBidG5zLmhpZGUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SWRTZWxlY3Rpb25zKCBlbDogSFRNTEVsZW1lbnQgKSB7XG4gICAgICAgIHJldHVybiAkLm1hcCgkKGVsKS5ib290c3RyYXBUYWJsZSgnZ2V0U2VsZWN0aW9ucycpLCAoIHJvdzogYW55ICkgPT4gcm93LmlkICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3R5bGVDaGVja2JveGVzKCkge1xuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiYnRTZWxlY3RJdGVtXCJdLCBpbnB1dFtuYW1lPVwiYnRTZWxlY3RHcm91cFwiXSwgaW5wdXRbbmFtZT1cImJ0U2VsZWN0QWxsXCJdLCAuZml4ZWQtdGFibGUtdG9vbGJhciBbdHlwZT1cImNoZWNrYm94XCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoICEgJCh0aGlzKS5oYXNDbGFzcygnY3VzdG9tLWNvbnRyb2wtaW5wdXQnKSkge1xuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2N1c3RvbS1jb250cm9sLWlucHV0Jyk7XG4gICAgICAgICAgICAgICAgbGV0ICRsYWJlbCA9ICQodGhpcykucGFyZW50KCkuaXMoJ2xhYmVsJylcbiAgICAgICAgICAgICAgICAgICAgPyAkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKCdjdXN0b20tY29udHJvbCBjdXN0b20tY2hlY2tib3gnKVxuICAgICAgICAgICAgICAgICAgICA6ICQodGhpcykud3JhcCgnPGxhYmVsIGNsYXNzPVwiY3VzdG9tLWNvbnRyb2wgY3VzdG9tLWNoZWNrYm94XCI+PC9sYWJlbD4nKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAkbGFiZWwuY29udGVudHMoKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGVUeXBlID09PSAzO1xuICAgICAgICAgICAgICAgIH0pLndyYXAoJzxzcGFuIGNsYXNzPVwiY3VzdG9tLWNvbnRyb2wtZGVzY3JpcHRpb25cIj48L3NwYW4+Jyk7XG4gICAgICAgICAgICAgICAgJCgnPHNwYW4gY2xhc3M9XCJjdXN0b20tY29udHJvbC1pbmRpY2F0b3JcIj48L3NwYW4+JykuYXBwZW5kVG8oJGxhYmVsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlcihyZXM6IGFueSkge1xuICAgICAgICAkLmVhY2gocmVzLnJvd3MsIGZ1bmN0aW9uIChpOiBhbnksIHJvdzphbnkgKSB7XG4gICAgICAgICAgICByb3cuc3RhdGUgPSAkLmluQXJyYXkocm93LmlkLCBzZWxlY3Rpb25zKSAhPT0gLTE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRldGFpbEZvcm1hdHRlciggLi4uYXJnczogYW55W10gKSB7XG4gICAgICAgIGxldCBodG1sOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgcm93ID0gYXJnc1sxXTtcbiAgICAgICAgaHRtbC5wdXNoKCc8ZGl2IGNsYXNzPVwicm93IG1iLTFcIj48ZGl2IGNsYXNzPVwiY29sLTNcIj48Yj5DdXN0b208L2I+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC05XCI+Q3VzdG9tIFZhbHVlPC9kaXY+PC9kaXY+Jyk7XG4gICAgICAgICQuZWFjaChyb3csIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBodG1sLnB1c2goJzxkaXYgY2xhc3M9XCJyb3cgbWItMVwiPjxkaXYgY2xhc3M9XCJjb2wtM1wiPjxiPicgKyBrZXkgKyAnOjwvYj48L2Rpdj48ZGl2IGNsYXNzPVwiY29sLTlcIj4nICsgdmFsdWUgKyAnPC9kaXY+PC9kaXY+Jyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaHRtbC5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5rUmVtb3ZlQ29sdW1uc0Zvcm1hdHRlcigpIHtcbiAgICAgICAgcmV0dXJuIGA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1kYW5nZXIgZWRpdGFibGUtcmVtb3ZlXCI+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZVwiPjwvaT48L2E+YDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5rRWRpdFJvd3NGb3JtYXR0ZXIoKSB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8YSBjbGFzcz1cImVkaXQtcm93IGMtZ3JheS1kYXJrXCIgaHJlZj1cIlwiPjxpIGNsYXNzPVwiZmEgZmEtZWRpdCBpY29uLW1yLWNoXCI+PC9pPkVkaXQ8L2E+XG4gICAgICAgICAgICA8YSBocmVmPVwiXCIgY2xhc3M9XCJidG4gYnRuLXNtIGJ0bi1wcmltYXJ5IGVkaXRhYmxlLXN1Ym1pdFwiPjxpIGNsYXNzPVwiZmEgZmEtY2hlY2tcIj48L2k+PC9hPlxuICAgICAgICAgICAgPGEgaHJlZj1cIlwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGVmYXVsdCBlZGl0YWJsZS1jYW5jZWxcIj48aSBjbGFzcz1cImZhIGZhLXJvdGF0ZS1sZWZ0XCI+PC9pPjwvYT5cbiAgICAgICAgYDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXREaXJlY3Rpb25PZlNlbGVjdE9wdGlvbnMoYWxpZ25tZW50OiBhbnkpIHtcbiAgICAgICAgYWxpZ25tZW50ID0gYWxpZ25tZW50ID09PSB1bmRlZmluZWQgPyAnbGVmdCcgOiBhbGlnbm1lbnQudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBzd2l0Y2ggKGFsaWdubWVudCkge1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdsdHInO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAncnRsJztcbiAgICAgICAgICAgIGNhc2UgJ2F1dG8nOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYXV0byc7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAnbHRyJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGltYWdlRm9ybWF0dGVyKHZhbHVlOiBhbnksIHJvdzogYW55KSB7XG4gICAgICAgIGxldCBpbWcgPSAnPGRpdiBjbGFzcz1cInRhYmxlLXVzZXItaW1hZ2VcIj48aSBjbGFzcz1cImljb24tdXNlclwiPjwvaT48L2Rpdj4nO1xuICAgICAgICBpZiggcm93LmltYWdlICkge1xuICAgICAgICAgICAgaW1nID0gJzxpbWcgc3JjPVwiJyArIHJvdy5pbWFnZSArICdcIiBjbGFzcz1cInRhYmxlLXVzZXItaW1hZ2VcIj4nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWc7XG4gICAgfVxufSk7XG5cblxuIl19
