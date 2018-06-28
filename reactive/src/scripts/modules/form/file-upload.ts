'use strict';
/*!
 * @version: 1.1.1
 * @name: file-upload
 *
 * @author: https://themeforest.net/user/flexlayers
 */
import * as Dropzone from 'dropzone';
import * as EasyPieChart from 'easy-pie-chart';
import 'imageupload';

// Get the template HTML and remove it from the document
$(function () {
    $('.imageupload').imageupload();
    $('.uploads').each(function () {
        let $this = $(this);
        $('.file-upload-btn input').change(function () {
            $(this).parent().siblings('span').html(this.value);
        });

        let previewNode = $this.find('.upload-template');
        if (previewNode[0]) {
            let easypiecharts: any = [];

            let myDropzone = new Dropzone($this.find('.drag-drop')[0], {
                url: '/', // Set the url
                thumbnailWidth: 50,
                thumbnailHeight: 50,
                parallelUploads: 20,
                previewTemplate: previewNode.html(),
                autoQueue: false, // Make sure the files aren't queued until manually added
                previewsContainer: previewNode[0], // Define the container to display the previews
                clickable: [$this.find('.file-input-button')[0], $this.find('.drag-drop')[0], $this.find('.drag-drop h3')[0], $this.find('.drag-drop h6')[0]] // Define the element that should be used as click trigger to select files.
            });
            previewNode.find('li').first().hide();
            myDropzone.on('addedfile', function (file) {
                // Hookup the start button
                let element = file.previewElement.querySelector('.progress-circle');
                let chart = new EasyPieChart(element, {
                    barColor: '#31457a',
                    trackColor: '#e0e6e6',
                    scaleColor: false,
                    lineWidth: 1,
                    lineCap: 'butt',
                    animate: {duration: 300, enabled: true},
                    size: 40
                });

                easypiecharts.push(chart);
                element.setAttribute('data-easypiechart', (easypiecharts.length - 1).toString());
                file.previewElement.querySelector('.start').addEventListener('click', function (e: Event) {
                    myDropzone.enqueueFile(file);
                    e.preventDefault();
                });
            });

            // Update the total progress bar
            // myDropzone.on('totaluploadprogress', function (progress) {
            //     (<HTMLElement>document.querySelector('#total-progress .progress-bar')).style.width = progress + '%';
            // });

            myDropzone.on('uploadprogress', function (file, progress) {
                let element = file.previewElement.querySelector('.progress-circle');
                let chart = easypiecharts[element.getAttribute('data-easypiechart')];

                chart.update(progress);
            });

            myDropzone.on('error', function (file, progress) {
                let element = file.previewElement.querySelector('.progress-circle');
                let chart = easypiecharts[element.getAttribute('data-easypiechart')];
                chart.options.barColor = '#7F260F';
                chart.update(100);

                $(file.previewElement).find('.start')
                    .removeClass('start')
                    .find('i').removeClass()
                    .addClass(function () {
                        return $(this).data('error-icon');
                    }).parents('a').click(function () {
                        myDropzone.removeFile(file);
                        return false;
                    });
            });

            myDropzone.on('success', function (file) {
                // Show the total progress bar when upload starts
                $(file.previewElement).find('.start')
                    .removeClass('start')
                    .find('i').removeClass()
                    .addClass(function () {
                        return $(this).data('success-icon');
                    }).parents('a').click(() => false);
                //(<HTMLElement>document.querySelector('#total-progress')).style.opacity = '1';
            });

            // Hide the total progress bar when nothing's uploading anymore
            // myDropzone.on('queuecomplete', function (progress) {
            //    (<HTMLElement>document.querySelector('#total-progress')).style.opacity = '0';
            // });

            // Setup the buttons for all transfers
            $this.find('.file-start-button').on('click', function () {
                myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
            });
            $this.find('.file-delete-button').on('click', function () {
                myDropzone.removeAllFiles(true);
            });
        }
    });

    $('.dropzone').each(function () {
        new Dropzone( this );
    });
});
