'use strict';
/*!
 * @version: 1.1.1
 * @name: view
 *
 * @author: https://themeforest.net/user/flexlayers
 */

export default class View {
    static readonly $uploadTrigger = $('.photo-editor-upload-trigger');
    static readonly $upload = $('.photo-editor-upload');
    static readonly $imageInput = $('.photo-editor-upload-trigger input');
    static readonly $editable = $('.photo-editor-editable');
    static readonly $buttons = $('.photo-editor-buttons');
    static readonly $img = $('.photo-editor-editable img');
    static readonly $toolbar = $('.photo-editor-toolbar');
    static readonly $productImages = $('.product-images .tab-content');
    static readonly $restore = View.$buttons.find('[data-action="restore"]');
    static readonly $remove = View.$buttons.find('[data-action="remove"]');
    static readonly $clear = View.$buttons.find('[data-action="clear"]');
    static readonly $crop = View.$buttons.find('[data-action="crop"]');
    static readonly $download = View.$buttons.find('[data-action="download"]');
    static readonly $save = View.$buttons.find('.product-save-image');

    constructor() {}

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    bindButtonClick( handler: any ) {
        View.$buttons.on('click','button', (e) => {
            handler(e.target);
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    bindCropButtonClick( handler: any ) {
        View.$toolbar.on('click', 'button', (e) => {
            handler(e.target);
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    bindInputChange( handler: any ) {
        View.$imageInput.on('change', (e) => {
            handler(e.target);
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    bindImageChange( handler: any ) {
        View.$productImages.on('click', 'img', (e: Event) => {
            handler(e);
        });
        return this;
    }

    /**
     * @param {Function} handler Function called on synthetic event.
     */
    bindSaveImage( handler: any ) {
        View.$save.on('click', (e: Event) => {
            View.$img.clone().attr('height', 200).prependTo(View.$productImages.find('#this-prod-images'));
            handler(e);
        });
        return this;
    }

    removePreview() {
        View.$upload.find('.dz-preview').remove();
        return this;
    }

    /**
     * @param {Function} handler Init Drag & Drop.
     */
    setDrop( handler: any ) {
        handler(View.$upload.get(0));
        return this;
    }

    /**
     * @param {boolean} mode Show or hide the element.
     */
    upload ( mode: boolean ) {
        View.$uploadTrigger.toggle(mode);
        return this;
    }

    /**
     *
     * @param mode Show or hide the element.
     * @param src uploaded image src
     * @param name uploaded image name
     * @param handler Colled when image is loaded
     * @returns {View}
     */
    edit (mode: boolean, src: string = '', name: string = '', handler = (e: any) => {}) {
        View.$editable.toggle(mode);

        View.$img.attr({
            src: src,
            alt: name
        }).on('load', (e: Event) => {
            handler(e);
        });

        return this;
    }

    /**
     * @param mode Show or hide the element.
     * @returns {View}
     */
    clear ( mode: boolean ) {
        View.$clear.toggle(mode);
        return this;
    }

    /**
     * @param mode Show or hide the element.
     * @returns {View}
     */
    restore ( mode: boolean ) {
        View.$restore.toggle(mode);
        return this;
    }

    /**
     * @param mode Show or hide the element.
     * @returns {View}
     */
    remove ( mode: boolean ) {
        View.$remove.toggle(mode);
        return this;
    }

    /**
     *
     * @param mode Show or hide the element.
     * @param data New image details
     * @returns {View}
     */
    crop ( mode: boolean, data: any = null) {
        View.$crop.toggle(mode);

        if (data) {
            let url = data.url.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
            View.$download.attr({
                href: url,
                download: data.name
            }).show();

        } else {
            View.$download.hide();
        }
        return this;
    }

    setCropSizes( data: any) {
        if( data ) {
            $('.croping-size').html(data.width + ' x ' + data.height);
        } else {
            $('.croping-size').html('');
        }
        return this;
    }

    setScroll( handler: any ) {
        handler(View.$productImages.get(0));
    }

    bindUpdateScroll( handler: any ) {
        $('.product-images a[data-toggle="tab"]').on('shown.bs.tab', function () {
            handler(View.$productImages.get(0));
        })
    }
}
