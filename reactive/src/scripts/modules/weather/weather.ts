'use strict';
/*!
 * @version: 1.1.1
 * @name: weather-class
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import * as ResizeSensor from 'css-element-queries/src/ResizeSensor';

export class Weather {
    private img: any;
    private x: number;
    private imgW: number;
    private imgH: number;
    private clearX: number;
    private clearY: number;
    private ctx: any;
    private CanvasXSize: number;
    private CanvasYSize: number;
    private static requestAnimFrame(callback: any) {
        if ( window.requestAnimationFrame ) {
            window.requestAnimationFrame(callback)
        } else if (window.webkitRequestAnimationFrame ) {
            window.webkitRequestAnimationFrame(callback)
        } else {
            window.setTimeout(callback, 1000 / 60)
        }
    }

    /**
     *
     * @param {string | Element} selector - Canvas element
     * @param {string} image - image being drown in the canvas
     * @param {number} scale - scale of the image
     * @param {number} dx - animation step in X - axis
     * @param {number} y - Vertical offset
     */
    constructor(
        private selector: String | Element,
        private image: string,
        private scale: number = 1.3,
        private dx: number = .07,
        private y: number = -4.5
    ) {
        this.img = new Image();
        this.img.src = this.image;
        this.x = 0;

        $(this.ready.bind(this));
        this.img.onload = this.load.bind(this);
    }

    private ready() {
        let $canvas = $(this.selector);
        $canvas.attr('width', $canvas.parent().width()).attr('height', $canvas.parent().height());
        this.CanvasXSize = $canvas.width();
        this.CanvasYSize = $canvas.height();
        let $parent = $canvas.parents('.panel-wrap');
        if($parent.parent().hasClass('grid-stack')) {
            $canvas.parents('.grid-stack-item').on('grid-stack-item-updated', this.handleResize.bind(this))
        } else {
            new ResizeSensor($canvas.parent(), this.handleResize.bind(this));
        }
    }

    private handleResize() {
        let $canvas = $(this.selector);
        $canvas.attr('width', $canvas.parent().width()).attr('height', $canvas.parent().height());
        this.CanvasXSize = $canvas.width();
        this.CanvasYSize = $canvas.height();
        this.x = 0;
    }

    private load() {
        this.imgW = this.img.width * this.scale;
        this.imgH = this.img.height * this.scale;
        if (this.imgW > this.CanvasXSize) {
            this.x = this.CanvasXSize - this.imgW;
        } // image larger than canvas
        if (this.imgW > this.CanvasXSize) {
            this.clearX = this.imgW;
        } else {
            this.clearX = this.CanvasXSize;
        }
        // image larger than canvas
        if (this.imgH > this.CanvasYSize) {
            this.clearY = this.imgH;
        } else {
            this.clearY = this.CanvasYSize;
        }
        // Get Canvas Element
        if( $(this.selector).length ) {
            this.ctx = (<HTMLCanvasElement>$(this.selector).get(0)).getContext('2d');
            this.animloop();
        }
    };

    private animloop() {
        Weather.requestAnimFrame(this.animloop.bind(this));
        this.draw();
    };

    private draw() {
        //Clear Canvas
        this.ctx.clearRect(0, 0, this.clearX, this.clearY);
        //If image is <= Canvas Size
        if (this.imgW <= this.CanvasXSize) {
            //reset, start from beginning
            if (this.x > (this.CanvasXSize)) {
                this.x = 0;
            }
            //draw aditional image
            if (this.x > (this.CanvasXSize - this.imgW)) {
                this.ctx.drawImage(this.img, this.x - this.CanvasXSize + 1, this.y, this.imgW, this.imgH);
            }
        } else { //If image is > Canvas Size
            //reset, start from beginning
            if (this.x > (this.CanvasXSize)) {
                this.x = this.CanvasXSize - this.imgW;
            }
            //draw aditional image
            if (this.x > (this.CanvasXSize - this.imgW)) {
                this.ctx.drawImage(this.img, this.x - this.imgW + 1, this.y, this.imgW, this.imgH);
            }
        }
        //draw image
        this.ctx.drawImage(this.img, this.x, this.y, this.imgW, this.imgH);

        //amount to move
        this.x += this.dx;
    }
}




