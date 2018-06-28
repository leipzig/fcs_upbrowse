'use strict';
/*!
 * @version: 1.1.1
 * @name: tables
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'jquery-ui/ui/widgets/sortable';
import 'bootstrap-table';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js';
import 'tableexport.jquery.plugin';
import 'bootstrap-table/src/extensions/editable/bootstrap-table-editable';
import 'bootstrap-table/src/extensions/export/bootstrap-table-export';
import 'bootstrap-table/src/extensions/mobile/bootstrap-table-mobile';
import './bootstrap-table-group-by';
import './bootstrap-table-filter-control';
import 'imageupload'
import * as moment from 'moment';

//import io from 'socket.io-client';

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/#Usage_with_TypeScript
import AWS = require('aws');


$(function () { //console.log($.fn.bootstrapTable.defaults)
    // locals
    let $remove = $('#remove-table-row'),
        $new = $('#new-table-row'),
        $submitjob = $('#submit-job'),
        selections: any[];

    // Global options
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editableform.buttons = `
            <button type="submit" class="btn btn-sm btn-primary editable-submit ml-2"><i class="fa fa-check"></i></button>
            <button type="button" class="btn btn-sm btn-default editable-cancel"><i class="fa fa-rotate-left"></i></button>`;

    initNewProd( '#new-prod-table' );
    initFCS( '#fcs' );
    initGroupFCS( '#group-fcs' );
        
        
    initTopCustom( '#top-custom-table' );

    initRoleTable( '#table-roles' );
    initUserTable( '#table-users' );

    initTableAdvancedFilters( '#table-advanced-filters' );
    initTableNewInModal( '#table-new-in-modal' );
    initTableEditRows( '#table-editable-rows' );
    initTableEditColumns( '#table-editable-columns' )

    var socket = io('http://uploader.cytovas.com:8080');
    //socket.on('news', function (data) {
    //    console.log(data);
    //    socket.emit('my other event', { my: 'data' });
    //jspm install npm:socket.io-client -f && jspm run socket.io-client});
    
    function decodeURIFormatter(value, row, index) {
        return decodeURIComponent(value);
    }      
    
    function initGroupFCS( el: Element | String ) {
        let $table = $(el);
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [],
            columns = [
                { field: 'keyCheck', checkbox: true, align: 'center',  valign: 'middle' },
                { field: 'keyName',title: 'Key',  visible: false, sortable: true, align: 'left', formatter: decodeURIFormatter },
                { field: 'expuuid', title: 'Exp UUID',  visible: false, sortable: true, align: 'left' },
                { field: 'qqfilename', title: 'Original Filename', sortable: true, align: 'left', formatter: decodeURIFormatter },
                { field: 'trial', title: 'Trial', sortable: true, align: 'left' },
                { field: 'assay', title: 'Assay', sortable: true, align: 'left' },
                { field: 'tubetype', title: 'Tube type', sortable: true, align: 'left', formatter: decodeURIFormatter  },
                { field: 'composite', title: 'Composite', visible: false, sortable: true, align: 'left', formatter: decodeURIFormatter },
            ];

        $table.bootstrapTable({
            url: 'http://uploader.cytovas.com:8080/uploads',
            mobileResponsive: true, minWidth: 767,
            classes: 'table table-no-bordered',
            pagination: true, pageSize: 20, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2', /*exportTypes: [ 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],*/
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            groupBy: true, groupByField: 'composite',
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });

        // sometimes footer render error.
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );
        
        
        //put the contents of #bt-table-modal into the table.parent
        //see .modal-body in table-group-rows.hbs
        //append an anonymous function that returns html, very clever
        $('#bt-table-modal').appendTo($table.parent()).find('.modal-body').append(
         '<div id="experiment-type" class="ui selection simple-select select-dropdown mb-4 mr-4">' +
         '<i class="select-dropdown icon"></i>' +
         '<div class="default text">Analysis type</div>' +
         '<div class="menu">' +
         '<div class="item" data-value="titration">Antibody Titration</div>' +
         '<div class="item" data-value="voltration">Gain Voltage Titration</div>' +
         '<div class="item" data-value="case-control">Case-control EV Analysis</div>' +
         '</div></div>'
        );
        $('#bt-table-modal').find('.select-dropdown').selectDropdown();
        
        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function (e: Event) {
            //light up the remove button
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);
        $table.on('reset-view.bs.table', editHandler.bind( $table[0] ));
        
        // try to fix the urlencoded group
        $table.on('all.bs.table sort.bs.table', function (e: Event) {
            $('.info td:nth-child(3)').each( function( index ){
                $(this).html(decodeURIComponent($(this).html()));
            });
        });

        $remove.click(function () {
            let ids = getIdSelections( $table[0] );
            alert('trying to remove'+ids);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
            styleCheckboxes();
        });

        $new.click(function () {
            let data = $table.bootstrapTable('getData');
            let selections = $table.bootstrapTable('getAllSelections');
            console.log(selections);
            let $modal = $('#bt-table-modal').modal('show');
            
            $new.prop('disabled', false);
        });
        
        $submitjob.click(function() {
            let selections = $table.bootstrapTable('getAllSelections');
            console.log(selections);
            var data = {};
            data.selections = selections;
            
            //titration or otherwise
            data.experiment_type = $("#experiment-type .selected").data('value')
            $.ajax({
						type: 'POST',
						data: JSON.stringify(data),
				        contentType: 'application/json',
                        url: 'http://uploader.cytovas.com:8080/analysis/experiment',						
                        success: function(data) {
                            console.log('success');
                            console.log(JSON.stringify(data));
                        }
            });
        });
    }

////////////////////////////////////







    function initFCS( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [];
        let data = '';
        //"qqfilename":"Compensation%20Controls_450%2C2f%2C50%20Violet%20Stained%20Control_018.fcs",
        //"expuuid":"7192da80-8134-498f-a987-34419351bc6b",
        //"assay":"EV",
        //"tubetype":"Violet%20Stained",
        //"trial":"Events",
        //"expdate":"Tue%20Sep%2026%202017%2011%3A52%3A31%20GMT-0400%20(EDT)",
        //"expmoniker":"flaid%20yeggmen",
        //"keyName":"9771f882-17e4-4e3e-bcff-51f67b55302c.fcs"
        let columns =  [
            { field: 'keyName', title: 'Key', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'qqfilename', title: 'Original Filename', sortable: true, align: 'left', formatter: decodeURIFormatter },
            { field: 'expuuid', title: 'Exp UUID', sortable: true, align: 'left' },
            { field: 'trial', title: 'Trial', sortable: true, align: 'left' },
            { field: 'assay', title: 'Assay', sortable: true, align: 'left' },
            { field: 'tubetype', title: 'Tube type', sortable: true, align: 'left', formatter: decodeURIFormatter  },
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
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
            
            $('.info td:nth-child(3)').html(decodeURIComponent($('.info td:nth-child(3)').html()));
        });

        $table.on('all.bs.table', styleCheckboxes);
    }

    function htmlDecode(value){ 
        return $('<em/>').html(value).text(); 
    }

    function initTopCustom( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [];
        let data = '';
        let columns =  [
            { field: 'id',  title: 'ID', width: 40, align: 'left',  valign: 'middle',  sortable: true },
            { field: 'name', title: 'Name', sortable: true, align: 'center'},
            { field: 'items',  title: 'Items', sortable: true, align: 'center'},
            { field: 'date',  title: 'Submit Date',  align: 'center', sortable: true },
            { field: 'total',  title: 'Total', sortable: true, align: 'center'},
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
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);
    }
    
    
    function initNewProd( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [];
        let data = '';
        let columns =  [
            { field: 'id',  title: 'ID', width: 40, align: 'left',  valign: 'middle',  sortable: true },
            { field: 'product', title: 'Product', sortable: true, align: 'center', formatter: (item: any) => {
                return `
                    <a class="c-gray" href="product-single.html">${item}</a>
                `;
            }},
            { field: 'items',  title: 'Items', sortable: true, align: 'center'},
            { field: 'date',  title: 'Submit Date',  align: 'center', sortable: true },
            { field: 'price',  title: 'Price', sortable: true, align: 'center'},
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
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);
    }

    function initRoleTable( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [];
        let data = '';
        let columns =  [
            { field: 'state', checkbox: true, align: 'center',  valign: 'middle' },
            // { field: 'id',  title: 'ID', width: 40, align: 'center',  valign: 'middle',  sortable: true },
            { field: 'image', title: 'Image', formatter: imageFormatter,  align: 'center' },
            { field: 'name',  title: 'Name', sortable: true, align: 'center'},
            { field: 'email',  title: 'Email',  align: 'center', sortable: true },
            { field: 'capabilities',  title: 'Capabilities', sortable: true, align: 'center'},
            { field: 'job-title',  title: 'Job Title', sortable: true, align: 'center'},
            { field: 'link',  title: 'Remove', align: 'center',  formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function ( ...args: any[]) {
                    $table.bootstrapTable('remove', { field: 'id', values: [ args[2].id ] });
                }}
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data1.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 10, pageList: '[All, 40, 25, 15, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: false,
            idField: 'id', /*toolbar: '#role-toolbar',*/ minimumCountColumns: '2', /*exportTypes: [ 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],*/
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
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );
        $table.on('post-body.bs.table', function () {

        });

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);
    }

    function initUserTable( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [];
        let columns =  [
            { field: 'state', checkbox: true, align: 'center',  valign: 'middle' },
            // { field: 'id',  title: 'ID', width: 40, align: 'center',  valign: 'middle',  sortable: true },
            { field: 'image', title: 'Image', formatter: imageFormatter,  align: 'center' },
            { field: 'name',  title: 'Name', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
            { field: 'email',  title: 'Email',  align: 'center', sortable: true, editable: {}, 'class': 'editable' },
            { field: 'credit-card',  title: 'Credit Card #', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
            { field: 'job-title',  title: 'Job Title', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
            { field: 'link',  title: 'Remove', align: 'center',  formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function ( ...args: any[]) {
                    $table.bootstrapTable('remove', { field: 'id', values: [ args[2].id ] });
                }}
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data1.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 8, pageList: '[All, 40, 25, 15, 8]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: false,
            idField: 'id', toolbar: '#user-toolbar', minimumCountColumns: '2', /*exportTypes: [ 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],*/
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });

        // sometimes footer render error.
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);
        $('#bt-table-modal').appendTo($table.parent()).find('.modal-body').append( () => {
            cols = columns.slice(2);
            cols.pop();
            let html: any[] = [];

            $.each( cols, function (key, value: any) {
                html.push('<div class="row mb-3"><div class="col-4 text-right"><b>' + value.title + ':</b></div><div class="col-8"><input class="form-control bt-modal-input-' + value.field + '" /></div></div>');
            });
            return html.join('');
        });

        $remove.click(function () {
            let ids = getIdSelections( $table[0] );
            alert(ids);
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });

        $new.click(function () {
            let data = $table.bootstrapTable('getData');
            let $modal = $('#bt-table-modal').modal('show');
            $modal.find('.imageupload').imageupload();
            $modal.find('.add-data').off().click(() => {
                newId = newId ? ++newId : data && data.length && data[ data.length - 1 ].id ? data[ data.length - 1 ].id: 0;
                let $inputs = $modal.find('input');
                let image = $modal.find('.imageupload img').attr('src');
                $table.bootstrapTable('insertRow', { index: 0,
                    row: {
                        id: newId,
                        image: image,
                        'name': (<any>$inputs[3]).value ? (<any>$inputs[3]).value : 'empty',
                        email: (<any>$inputs[4]).value ? (<any>$inputs[4]).value : 'empty',
                        'credit-card': (<any>$inputs[5]).value ? (<any>$inputs[5]).value : 'empty',
                        'job-title': (<any>$inputs[6]).value ? (<any>$inputs[6]).value : 'empty'
                    }
                });

                if( (<any>$modal.find('input[type="checkbox"]')[0]).checked === false ) {
                    $inputs.val('');
                    $modal.modal('hide');
                }
            });
            $new.prop('disabled', false);
        });
    }


    function initTableAdvancedFilters( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [];
        let columns =  [
            { field: 'state', checkbox: true, align: 'center' },
            { field: 'id', title: 'ID', align: 'center', visible: false },
            { field: 'name',  title: 'Name', sortable: true, align: 'center', editable: {}, 'class': 'editable', filterControl: 'input', filterControlPlaceholder: '' },
            { field: 'email',  title: 'Email',  align: 'center', sortable: true, editable: {}, 'class': 'editable', filterControl: 'input', filterControlPlaceholder: '' },
            { field: 'credit-card',  title: 'Credit Card #', sortable: true, align: 'center', editable: {}, 'class': 'editable', filterControl: 'input', filterControlPlaceholder: ''},
            { field: 'job-title',  title: 'Job Title', sortable: true, align: 'center', filterControl: 'select', filterStrictSearch: true},
            { field: 'date',  title: 'Registration Date', align: 'center',  sortable: true, editable: {}, 'class': 'editable', filterControl: 'date' },
            { field: 'link',  title: 'Remove', align: 'center',  formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function ( ...args: any[]) {
                    $table.bootstrapTable('remove', { field: 'id', values: [ args[2].id ] });
                }}
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data3.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 10, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2', /*exportTypes: [ 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],*/
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            filterControl: true, filterShowClear: true,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus', clear: 'icon-trash'
            },
            columns: columns,
            filterTemplate: {
                input: function (that: any, field: any, isVisible: any, placeholder: any) {
                    return $.fn.bootstrapTable.utils.sprintf('<input type="text" class="form-control bootstrap-table-filter-control-%s" style="width: 100%; visibility: %s" placeholder="%s">', field, isVisible, placeholder);
                },
                select: function (that: any, field: any, isVisible: any) {
                    return $.fn.bootstrapTable.utils.sprintf(`<div class="ui fluid select-dropdown form-control selection" tabindex="0"><select class="bootstrap-table-filter-control-%s" style="width: 100%; visibility: %s" dir="%s"></select><i class="select-dropdown icon"></i><div class="text"></div><div class="menu" tabindex="-1"></div></div>`,
                        field, isVisible, getDirectionOfSelectOptions(undefined));
                },
                date: function (that: any, field: any, isVisible: any) {
                    return `<div class="bs-datepicker input-daterange date-filter-control bootstrap-table-filter-control-${field}" style="width: 100%; visibility: ${isVisible}">`
                        + '<input type="text" class="form-control w-100 mb-1" />'
                        + '<input type="text" class="form-control w-100" />'
                        + '</div>';
                }
            },
        });

        let date: any;

        // sometimes footer render error.
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('load-success.bs.table column-search.bs.table search.bs.table column-switch.bs.table', function () {
            if ( ! date ) date = $table.bootstrapTable('getData');
            if( ! $table.find('.bs-datepicker').find('input').val() ) return;
            $table.bootstrapTable('load', $.grep( date, function (row: any) {
                return Date.parse(row.date) >= Date.parse($table.find('.bs-datepicker input').val())
                    && Date.parse(row.date) <= Date.parse($table.find('.bs-datepicker input').last().val());
            }));
        });

        $table.on('post-header.bs.table', function () {
            $table.find('.bs-datepicker')
                .bsDatepicker({'autoclose':true, 'clearBtn': true, filterControlPlaceholder: '', 'todayHighlight': true})
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
            let $modal = $('#bt-table-modal');
            if ( $modal.hasClass('modal-constructed') ) return;

            $modal.addClass('modal-constructed').appendTo($table.parent()).find('.modal-body').append( () => {
                cols = columns.slice(2,6);
                let html: any[] = [];
                $.each( cols, function (key, value: any) {
                    if ( value.field === 'job-title') {
                        html.push( '<div class="row mb-3"><div class="col-4 text-right"><b>' + value.title + ':</b></div><div class="col-8">'
                            + '<select class="ui form-control select-dropdown fluid search bt-modal-input-' + value.field + '">'
                            + $('.bootstrap-table-filter-control-job-title').html()
                            + '</select></div></div>');
                        return
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
                })
            });

        $table.on('all.bs.table', styleCheckboxes);

        $remove.click(function () {
            let ids = getIdSelections( $table[0] );
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });

        $new.click(function () {
            let data = $table.bootstrapTable('getData');
            let $modal = $('#bt-table-modal').modal('show');
            $modal.find('.add-data').off().click( () => {
                newId = newId ? ++newId : data && data.length && data[ data.length - 1 ].id ? data[ data.length - 1 ].id: 0;
                let $inputs = $modal.find('input');
                let $selects = $modal.find('select');
                $table.bootstrapTable('insertRow', { index: 0,
                    row: {
                        id: newId,
                        'name': (<any>$inputs[0]).value ? (<any>$inputs[0]).value : 'empty',
                        email: (<any>$inputs[1]).value ? (<any>$inputs[1]).value : 'empty',
                        'job-title': (<any>$selects[0]).value ? (<any>$selects[0]).value : 'empty',
                        'credit-card': (<any>$inputs[2]).value ? (<any>$inputs[2]).value : 'empty',
                        'date': moment().format('l')
                    }
                });

                if( (<any>$modal.find('input[type="checkbox"]')[0]).checked === false ) {
                    $inputs.val('');
                    $modal.modal('hide');
                }
            });
            $new.prop('disabled', false);
        });
    }

    function initTableNewInModal( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;
        let cols = [];
        let columns =  [
            { field: 'state', checkbox: true, align: 'center',  valign: 'middle' },
            { field: 'id',  title: 'ID', width: 40, align: 'center',  valign: 'middle',  sortable: true },
            { field: 'name',  title: 'Name', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
            { field: 'email',  title: 'Email',  align: 'center', sortable: true, editable: {}, 'class': 'editable' },
            { field: 'credit-card',  title: 'Credit Card #', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
            { field: 'job-title',  title: 'Job Title', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
            { field: 'link',  title: 'Remove', align: 'center',  formatter: linkRemoveColumnsFormatter,
                events: { 'click .editable-remove': function ( ...args: any[]) {
                    $table.bootstrapTable('remove', { field: 'id', values: [ args[2].id ] });
                }}
            }
        ];
        $table.bootstrapTable({
            url: '/assets/data1.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table',
            pagination: true, pageSize: 10, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2', /*exportTypes: [ 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],*/
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: columns
        });

        // sometimes footer render error.
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);
        $('#bt-table-modal').appendTo($table.parent()).find('.modal-body').append( () => {
            cols = columns.slice(2);
            cols.pop();
            let html: any[] = [];
            $.each( cols, function (key, value: any) {
                html.push('<div class="row mb-3"><div class="col-4 text-right"><b>' + value.title + ':</b></div><div class="col-8"><input class="form-control bt-modal-input-' + value.field + '" /></div></div>');
            });
            return html.join('');
        });

        $remove.click(function () {
            let ids = getIdSelections( $table[0] );
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });

        $new.click(function () {
            let data = $table.bootstrapTable('getData');
            let $modal = $('#bt-table-modal').modal('show');
            $modal.find('.add-data').off().click(() => {
                newId = newId ? ++newId : data && data.length && data[ data.length - 1 ].id ? data[ data.length - 1 ].id: 0;
                let $inputs = $modal.find('input');
                $table.bootstrapTable('insertRow', { index: 0,
                    row: {
                        id: newId,
                        'name': (<any>$inputs[0]).value ? (<any>$inputs[0]).value : 'empty',
                        email: (<any>$inputs[1]).value ? (<any>$inputs[1]).value : 'empty',
                        'job-title': (<any>$inputs[2]).value ? (<any>$inputs[2]).value : 'empty',
                        'credit-card': (<any>$inputs[3]).value ? (<any>$inputs[3]).value : 'empty'
                    }
                });

                if( (<any>$modal.find('input[type="checkbox"]')[0]).checked === false ) {
                    $inputs.val('');
                    $modal.modal('hide');
                }
            });
            $new.prop('disabled', false);
        });
    }

    function initTableEditColumns( el: Element | String ) {
        let $table = $( el );
        if ( !$table[0] ) return;
        let newId: any = 0;

        $table.bootstrapTable({
            url: '/assets/data2.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table table-no-bordered',
            pagination: true, pageSize: 10, pageList: '[All, 40, 30, 20, 10]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2', /*exportTypes: [ 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],*/
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: [
                { field: 'state', checkbox: true, align: 'center',  valign: 'middle' },
                { field: 'id',  title: 'ID', width: 40, align: 'center',  valign: 'middle',  sortable: true },
                { field: 'company-name',  title: 'Company Name', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
                { field: 'street-address', title: 'Street Address', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
                { field: 'phone',  title: 'Phone',  align: 'center', sortable: true, editable: {}, 'class': 'editable' },
                { field: 'employees',  title: 'Employees', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
                { field: 'link',  title: 'Remove', align: 'center',  formatter: linkRemoveColumnsFormatter,
                    events: { 'click .editable-remove': function ( ...args: any[]) {
                        $table.bootstrapTable('remove', { field: 'id', values: [ args[2].id ] });
                    }}
                }
            ]
        });

        // sometimes footer render error.
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);

        $remove.click(function () {
            let ids = getIdSelections( $table[0] );
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });

        $new.click(function () {
            let data = $table.bootstrapTable('getData');
            newId = newId ? ++newId : data && data.length && data[ data.length - 1 ].id ? data[ data.length - 1 ].id: 0;
            $table.bootstrapTable('insertRow', {
                index: 0, row: { id: newId, 'company-name': 'empty', phone: 'empty', 'street-address': 'empty', employees: 0 }
            });
            $new.prop('disabled', false);
        });
    }

    function initTableEditRows( el: Element | String ) {
        let $table = $(el);
        if ( !$table[0] ) return;
        let newId: any = 0;

        $table.bootstrapTable({
            url: '/assets/data2.json',
            mobileResponsive: true, minWidth: 767,
            classes: 'table table-no-bordered',
            pagination: true, pageSize: 12, pageList: '[All, 40, 30, 20, 12]', sidePagination: 'client', showPaginationSwitch: true,
            search: true, showFooter: false, showRefresh: true, showToggle: true, showColumns: true, showExport: true, detailView: true,
            idField: 'id', toolbar: '#toolbar', minimumCountColumns: '2', /*exportTypes: [ 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'xlsx', 'pdf'],*/
            detailFormatter: detailFormatter, responseHandler: responseHandler,
            icons: {
                paginationSwitchDown: 'icon-arrow-down-circle', paginationSwitchUp: 'icon-arrow-up-circle',
                refresh: 'icon-refresh', toggle: 'icon-list', columns: 'icon-grid', 'export': 'icon-share-alt',
                detailOpen: 'icon-plus', detailClose: 'icon-minus',
            },
            columns: [
                { field: 'state', checkbox: true, align: 'center',  valign: 'middle' },
                { field: 'id',  title: 'ID', width: 40, align: 'center',  valign: 'middle',  sortable: true },
                { field: 'company-name',  title: 'Company Name', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
                { field: 'street-address', title: 'Street Address', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
                { field: 'phone',  title: 'Phone',  align: 'center', sortable: true, editable: {}, 'class': 'editable' },
                { field: 'employees',  title: 'Employees', sortable: true, align: 'center', editable: {}, 'class': 'editable'},
                { field: 'link',  title: 'Edit', align: 'center',  formatter: linkEditRowsFormatter }
            ]
        });

        // sometimes footer render error.
        setTimeout( () => $table.bootstrapTable('resetView'), 200 );

        $table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
            selections = getIdSelections( this );
        });

        $table.on('all.bs.table', styleCheckboxes);
        $table.on('reset-view.bs.table', editHandler.bind( $table[0] ));

        $remove.click(function () {
            let ids = getIdSelections( $table[0] );
            $table.bootstrapTable('remove', { field: 'id', values: ids });
            $remove.prop('disabled', true);
        });

        $new.click(function () {
            let data = $table.bootstrapTable('getData');
            newId = newId ? ++newId : data && data.length && data[ data.length - 1 ].id ? data[ data.length - 1 ].id: 0;
            $table.bootstrapTable('insertRow', {
                index: 0, row: { id: newId, 'company-name': 'empty', phone: 'empty', 'street-address': 'empty', employees: 0 }
            });
            $new.prop('disabled', false);
        });
    }

    function editHandler() {
        let $table = $(this);
        $('.editable-cancel, .editable-submit').hide();

        let $editable = $table.find('.editable a');
        $editable.editable({
            type: 'text', emptytext: '', showbuttons: false, unsavedclass: null, toggle: 'manual', onblur: 'ignore'
        });

        function submitEditable( el: HTMLElement ) {
            $(el).find('.editableform').submit();
        }

        $table.find( '.edit-row' ).on( 'click', function () {
            let $tr = $( this ).parents( 'tr' );
            let btns = $tr.find('.editable-cancel, .editable-submit').show();
            $(this).hide();

            $tr.find( '.editable a' ).each( function () {
                $( this ).editable( 'show' );
                setTimeout(() => $tr.find('.form-control').first().focus(), 10 );
            });
            $tr.find('.editableform').each(function () {
                $(this).on('keydown', function (e) {
                    if ((e.keyCode || e.which) === 13) { submitEditable( $tr[0] ); }
                })
            });
            btns.click( function (e: Event) {
                if( $( e.target ).is('.editable-submit')) submitEditable( $tr[0] );
                $tr.find( '.editable a' ).editable( 'hide' );
                $tr.find( '.edit-row' ).show();
                btns.hide();
                return false;
            });
            return false;
        });
    }

    function getIdSelections( el: HTMLElement ) {
        return $.map($(el).bootstrapTable('getSelections'), ( row: any ) => row.id );
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

    function responseHandler(res: any) {
        $.each(res.rows, function (i: any, row:any ) {
            row.state = $.inArray(row.id, selections) !== -1;
        });
        return res;
    }

    function detailFormatter( ...args: any[] ) {
        let html: any[] = [];
        let row = args[1];
        html.push('<div class="row mb-1"><div class="col-3"><b>Custom</b></div><div class="col-9">Custom Value</div></div>');
        $.each(row, function (key, value) {
            html.push('<div class="row mb-1"><div class="col-3"><b>' + key + ':</b></div><div class="col-9">' + value + '</div></div>');
        });
        return html.join('');
    }

    function linkRemoveColumnsFormatter() {
        return `<a href="javascript:void(0)" class="btn btn-sm btn-danger editable-remove"><i class="fa fa-close"></i></a>`;
    }

    function linkEditRowsFormatter() {
        return `
            <a class="edit-row c-gray-dark" href=""><i class="fa fa-edit icon-mr-ch"></i>Edit</a>
            <a href="" class="btn btn-sm btn-primary editable-submit"><i class="fa fa-check"></i></a>
            <a href="" class="btn btn-sm btn-default editable-cancel"><i class="fa fa-rotate-left"></i></a>
        `;
    }

    function getDirectionOfSelectOptions(alignment: any) {
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

    function imageFormatter(value: any, row: any) {
        let img = '<div class="table-user-image"><i class="icon-user"></i></div>';
        if( row.image ) {
            img = '<img src="' + row.image + '" class="table-user-image">';
        }
        return img;
    }
});


