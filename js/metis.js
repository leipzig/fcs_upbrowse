$(function() {
    $('#assay').metisMenu({ preventDefault: true });
    $('#tubetype').metisMenu({ preventDefault: true });
    $('#species').metisMenu({ preventDefault: true });
});

$(function() {
    $('.metismenu a').not('.has-arrow').on('click', function() {
        $(this).parent().siblings().children().removeClass("activated");
        $(this).toggleClass('activated')
    });
});