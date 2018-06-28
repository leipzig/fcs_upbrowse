'use strict';
/*!
 * @version: 1.1.1
 * @name: controller
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import View from './view';
import * as Cropper from 'cropperjs';
import * as Dropzone from 'dropzone';
import * as Ps from 'perfect-scrollbar';

export default class Controller {
    constructor(
        private view: View,
        private cropping: boolean = false,
        private url: string = '',
        private name: string = '',
        private type: string = '',
        private image: any = '',
        private cropper: any = '',
        private originalUrl: any = '',
        private data: any = '',
        private canvasData: any = '',
        private cropBoxData: any = '',
        private dropzone: any = '',
        private scrollBox: any = ''
    ) {
        view.bindButtonClick(this.click.bind(this));
        view.bindCropButtonClick(this.cropClick.bind(this));
        view.bindInputChange(this.change.bind(this));
        view.bindImageChange(this.imageChange.bind(this));
        view.setDrop( this.setDragDrop.bind(this) );
        view.bindSaveImage( this.remove.bind(this) );
        view.setScroll( this.setScroll.bind(this) );
        view.bindUpdateScroll( this.updateScroll.bind(this) );

        this.view.upload ( true );
        this.view.edit ( false );
        this.view.clear ( this.cropping );
        this.view.restore ( false );
        this.view.remove ( false );
        this.view.crop ( false );
    }

    /**
     * Trigger appropriate actions
     *
     * @param {!HTMLElement} target Clicked button
     */
    click( target: HTMLElement ) {
        const action = $(target).data('action') || $(target).parent().data('action');
        switch (action) {
            case 'restore':
                this.restore();
                break;

            case 'remove':
                this.remove();
                break;

            case 'clear':
                this.clear();
                break;

            case 'crop':
                this.crop();
                break;
        }
    }

    /**
     * Create Drop zone and handle reading
     * @param {HTMLElement} el Drop zone Element
     */
    setDragDrop( el: HTMLElement) {
        if ( !el ) return;
        let me = this;
        this.dropzone = new Dropzone(el, {
            url: '/', autoQueue: false,
            autoProcessQueue: false,
            init: function() {
                this.on("addedfile", function(file: any) {
                    if( me.cropper ) {
                        return;
                    }
                    me.read(file);
                    me.view.removePreview();
                });
            }
        });
    }

    /**
     * Trigger cropper actions
     *
     * @param {!HTMLElement} target Cropper buttons
     */
    cropClick( target: HTMLElement ) {
        const cropper = this.cropper;
        if (!cropper) {
            return;
        }

        const action = $(target).data('action') || $(target).parent().data('action');
        switch (action) {
            case 'move':
            case 'crop':
                cropper.setDragMode(action);
                break;

            case 'zoom-in':
                cropper.zoom(0.1);
                break;

            case 'zoom-out':
                cropper.zoom(-0.1);
                break;

            case 'rotate-left':
                cropper.rotate(-90);
                break;

            case 'rotate-right':
                cropper.rotate(90);
                break;

            case 'flip-horizontal':
                cropper.scaleX(-this.cropper.getData().scaleX || -1);
                break;

            case 'flip-vertical':
                cropper.scaleY(-this.cropper.getData().scaleY || -1);
                break;

            // No default
        }
    }

    /**
     * Trigger read actions
     *
     * @param {!HTMLInputElement} target Clicked button
     */
    change( target: HTMLInputElement ) {
        const files = target.files;

        this.read(files && files[0], () => {
            target.value = '';
        });
    }

    /**
     * Read the file from the input
     * @param file Loading file
     * @param callback
     */
    read (file: any, callback = () => {}) {
        if (file) {
            if (/^image\/\w+$/.test(file.type)) {
                let reader = new FileReader();

                reader.onload = () => {
                    this.view.upload( false );
                    this.view.remove( true );
                    this.type = file.type;
                    this.name = file.name;
                    this.url = reader.result;
                    this.view.edit(true, this.url, this.name, this.load.bind(this));

                    callback();
                };

                reader.readAsDataURL(file);
            } else {
                window.alert('Please choose an image file.');
                callback();
            }
        } else {
            callback();
        }
    }

    imageChange(e: Event) {
        if (this.cropper) {
            this.clear();
            this.remove();
        }
        this.view.upload( false );
        this.view.remove( true );
        this.url = $(e.target).attr('src');
        this.name = this.url.replace(/^.*[\\\/]/, '');

        this.view.edit(true, this.url, this.name, this.load.bind(this));
    }

    /**
     *
     * @param e Event object of the loaded image
     */
    load (e: Event) {
        if (!this.image) {
            this.image = e.target;
            this.start();
        }
    }

    /**
     * Start the cropper
     */
    start () {
        const _this = this;
        this.view.restore(false);
        if (this.cropper) {
            return;
        }

        this.cropper = new Cropper(this.image, {
            autoCrop: false,
            dragMode: 'move',
            background: false,
            ready: function () {
                if (_this.data) {
                    this.cropper
                        .crop()
                        .setData(_this.data)
                        .setCanvasData(_this.canvasData)
                        .setCropBoxData(_this.cropBoxData);
                    _this.data = null;
                    _this.canvasData = null;
                    _this.cropBoxData = null;
                }
            },
            crop: function (data: any) {
                if (data.detail.width > 0 && data.detail.height > 0) {
                    _this.cropping = true;
                    _this.view.crop( true );
                    _this.view.clear( true );
                    _this.view.remove( false );
                    _this.view.setCropSizes(this.cropper.getCropBoxData())
                }
            }
        });
    }

    /**
     * Stop the cropper
     */
    stop () {
        if( this.cropper ) {
            this.view.restore(true);
            this.view.crop(false, {url: this.url, name: this.name});
            this.cropper.destroy();
            this.cropper = '';
            this.view.setCropSizes('')
        }
    }

    /**
     * Clear the cropper
     */
    clear() {
        this.cropping = false;
        this.crop();
        this.cropper.clear();
        this.view.setCropSizes('')
    }

    /**
     * Calcuates the cropped image details and call stop()
     */
    crop () {
        this.view.crop( false );
        this.view.clear( false );
        this.view.upload( false );
        this.view.remove( true );
        this.view.setCropSizes('');

        if (this.cropping) {
            const cropper = this.cropper;
            const type = this.type;
            this.originalUrl = this.url;
            this.data = cropper.getData();
            this.canvasData = cropper.getCanvasData();
            this.cropBoxData = cropper.getCropBoxData();
            this.url = cropper.getCroppedCanvas(type === 'image/png' ? null : {
                fillColor: '#fff'
            }).toDataURL(type);
            this.view.edit(true, this.url, this.name);
            this.cropping = false;
            this.stop();
        }
    }

    /**
     * Restore the cropped image
     */
    restore() {
        if (!this.cropper) {
            this.image = null;
            this.url = this.originalUrl;
            this.originalUrl = '';
            this.view.edit( true, this.url, this.name );
            this.view.setCropSizes('')
        }
    }

    /**
     * Restore the image
     */
    remove () {
        // Disallow to delete image when cropping
        if (this.cropping) {
            return;
        }
        this.view.edit( false );
        this.view.upload( true );
        this.view.remove( false );
        this.view.restore(false);
        this.view.crop(false);
        this.data = null;
        this.image = null;
        this.type = '';
        this.name = '';
        this.url = '';
        this.originalUrl = '';
        if( this.cropper ) {
            this.cropper.destroy();
            this.cropper = '';
        }
        this.view.setCropSizes('');
        this.updateScroll(this.scrollBox);
    }

    setScroll( el: HTMLElement) {
        if(!el ) return;
        this.scrollBox = el;
        Ps.initialize(el, {
            theme: 'visible-theme',
            suppressScrollY: true,
            useBothWheelAxes: true,
            wheelPropagation: true
        });
    }

    updateScroll(el: HTMLElement, scroll: number = 0) {
        if(!el ) return;
        el.scrollLeft = scroll;
        Ps.update(el);
    }
}
