$.fn.setexperiment = function() {
  var self = this;
  var api_key = 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';

  //for display
  var expdate = moment().format("YYYY-MM-DD");

  //for stamping
  var timestamp = moment().format();

  $("#qq-form #expdate").val(expdate);
  $("#qq-form #timestamp").val(timestamp);
  $(self).find('.experiment-date').text(expdate);
  var moniker_req_string = 'http://api.wordnik.com:80/v4/words.json/randomWords?hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=2&api_key=' + api_key;
  $.get(moniker_req_string,
      function(data) {
          //[{"id":272484,"word":"excitably"}]
          var moniker = data[0]['word'] + ' ' + data[1]['word'];
          $(self).find('.experiment-moniker').text(moniker);
          $("#qq-form #expmoniker").val(moniker);
      });
  var uuid = UUID.generate();
  $(self).find('.experiment-id').text(uuid);
  $("#qq-form #expuuid").val(uuid);
};

$(document).ready(function() {
  $('#experiment').setexperiment();
});

$('#fine-uploader-s3').fineUploaderS3({
  debug: true,
  interceptSubmit: true,
  autoUpload: false,
  template: 'qq-template-s3',
  request: {
      endpoint: "cytovas-instrument-files.s3.amazonaws.com",
      accessKey: "AKIAJSZCBF7KYQRIMOCA"
  },
  signature: {
      endpoint: "/vendor/fineuploader/php-s3-server/endpoint-cors.php"
  },
  uploadSuccess: {
      endpoint: "/vendor/fineuploader/php-s3-server/endpoint-cors.php?success",
      params: {
          isBrowserPreviewCapable: qq.supportedFeatures.imagePreviews
      }
  },
  iframeSupport: {
      localBlankPagePath: "success.html"
  },
  cors: {
      expected: true
  },
  chunking: {
      enabled: true
  },
  resume: {
      enabled: true
  },
  deleteFile: {
      enabled: false,
      method: "POST",
      endpoint: "/vendor/fineuploader/php-s3-server/endpoint-cors.php"
  },
  validation: {
      itemLimit: 200,
      sizeLimit: 1500000000
  },
  thumbnails: {
      placeholders: {
          notAvailablePath: "not_available-generic.png",
          waitingPath: "waiting-generic.png"
      }
  },
  callbacks: {
      onComplete: function(id, name, response) {
          var previewLink = qq(this.getItemByFileId(id)).getByClass('preview-link')[0];

          if (response.success) {
              previewLink.setAttribute("href", response.tempLink)
          }
      },
      onSubmit: function(id, filename) {
          if (!($('#assaychoice').text())) {
              bootbox.alert(qq.format("Please select an assay"), function() { bootbox.hideAll() });
              return (false);
          }
          if (!($('#specieschoice').text())) {
              bootbox.alert(qq.format("Please select a species"), function() { bootbox.hideAll() });
              return (false);
          }
      },
      onSubmitted: function(id, filename) {
          var typesfuzzy = FuzzySet(trials[$('#trialchoice').text()]["types"], use_levenshtein = false);
          var best_guess_types = typesfuzzy.get(filename, null, 0)[0][1];
          console.log("guessing..." + best_guess_types);

          var type_choice = '';
          if ($('#tubetypechoice').text() == "") {
              type_choice = best_guess_types;
          }
          else {
              type_choice = $('#tubetypechoice').text();
          }
          this.setParams({
              "trial": $('#trialchoice').text(),
              "assay": $('#assaychoice').text(),
              "tubetype": type_choice,
              "species": $('#specieschoice').text()
          }, id);

          boxofinterest = "qq-file-id-" + id;
          $("." + boxofinterest + " .checkedtrialchoice").text($('#trialchoice').text());
          $("." + boxofinterest + " .checkedassaychoice").text($('#assaychoice').text());
          // not sure about this behavior
          //$("." + boxofinterest + " .checkedtubechoice").text(best_guess_types);
          $("." + boxofinterest + " .checkedspecieschoice").text($('#specieschoice').text());
      }
  }
});
$('#addSubmit').click(function() {
  $('#fine-uploader-s3').fineUploaderS3('uploadStoredFiles');
});
//if they click on the trial itself set that and clear out the assay
$("#assay > li a.has-arrow").on("click", function() {
  $('#trialchoice').text($(this).text());
  $('#assaychoice').text(null);
});

//if they click on the assay itself set the trial and assay
$("#assay > li > ul > li > a").on("click", function() {
  $('#trialchoice').text($(this).parent().parent().parent().find(".has-arrow").text());
  $('#assaychoice').text($(this).text());
});

//$("#tubetype > li > ul > li > a").on("click", function() { $('#tubetypechoice').text($(this).text()); });
$("#tubetype > li > ul > li > ul > li > a:not('.noclick')").on("click", function() { $('#tubetypechoice').text($(this).text()); });
$("#tubetype > li > ul > li > ul > li > ul > li > a").on("click", function() { $('#tubetypechoice').text($(this).text()); });

$("#species > li > ul > li > a").on("click", function() { $('#specieschoice').text($(this).text()); });


$('a.preview-link').on("click", function() { alert(this) });
$("#applychoices").on("click", function() {
  $("div.qq-file-info input:checked").siblings(".checkedtrialchoice").text($('#trialchoice').text());
  $("div.qq-file-info input:checked").siblings(".checkedassaychoice").text($('#assaychoice').text());
  $("div.qq-file-info input:checked").siblings(".checkedtubechoice").text($('#tubetypechoice').text());
});

$('#button-reset').click(function() {
  $('#fine-uploader-s3').fineUploaderS3('clearStoredFiles');
  $('#experiment').setexperiment();
  return false;
})
