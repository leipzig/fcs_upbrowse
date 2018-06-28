'use strict';
/*!
 * @version: 1.1.1
 * @name: Carousel
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import 'slick-carousel';

$(function () {
    // new Carousel('.new-product-carousel', {interval: 8000});
    // new Carousel('.top-product-carousel', {interval: 6000});

    let $top = $('#top-products');
    let $new = $('#new-products');

    $top.slick({
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 6000,
        speed: 400,
        slidesToShow: 2,
        slidesToScroll: 2,
        rows: 2,
        nextArrow: $top.parents('.panel').find('[data-slide="next"]'),
        prevArrow: $top.parents('.panel').find('[data-slide="prev"]'),
        responsive: [
            {
                arrows: false,
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    $new.slick({
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 8000,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 2,
        rows: 2,
        nextArrow: $new.parents('.panel').find('[data-slide="next"]'),
        prevArrow: $new.parents('.panel').find('[data-slide="prev"]'),
        responsive: [
            {
                arrows: false,
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
});
