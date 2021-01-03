function log(msg) {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        console.log(msg);
    }
}

function startVoiceLoading() {
    $('#voiceLoading').show();
}

function stopVoiceLoading() {
    $('#voiceLoading').hide();
}

function showVoiceError(msg) {
    $('#alert-toast').html(msg).collapse('show');

    const switchButton = $('#voiceSwitch');
    if (switchButton.prop('checked')) {
        switchButton.click();
    }
}

function hideVoiceError() {
    $('#alert-toast').html(null).collapse('hide');
}

$(function() {
    let recognizerResolver = createModel();

    // for develop
    // TODO preload when wifi connection
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        recognizerResolver.then(recognizer => {
            recognizer.ensureModelLoaded().then(v => {
                recognizer.warmUpModel();
                console.log(recognizer);
            });
        });
    }

    const voiceSwitchButton = $('#voiceSwitch').change(function() {
        if (this.checked) {
            onVoiceEnabled();
        } else {
            onVoiceDisabled();
        }
    });

    function isOn() {
        return voiceSwitchButton.is(':checked');
    }
    function isOff() {
        return !voiceSwitchButton.is(':checked');
    }

    function onVoiceEnabled() {
        hideVoiceError();
        startVoiceLoading();

        recognizerResolver
          .then(recognizer => {
              if (isOff()) {
                  return Promise.reject('canceled');
              }

              // check that model and metadata are loaded via HTTPS requests.
              return recognizer.ensureModelLoaded()
                .then(() => { return recognizer; });
          }).then(recognizer => {
              if (isOff()) {
                  return Promise.reject('canceled');
              }
              recognizer.warmUpModel();

              if (isOff()) {
                  return Promise.reject('canceled');
              }
              return enableListen(recognizer);
          }).catch(reason => {
              let msg = reason.toLocaleString();
              if (reason instanceof DOMException && reason.name == "NotAllowedError") {
                  msg = "음성인식 권한이 없습니다.";
              }

              showVoiceError(msg);
          }).finally(() => {
              if (isOn()) {
                  stopVoiceLoading();
              }
          });
    }

    function onVoiceDisabled() {
        recognizerResolver.then(recognizer => {
            if (isOff() && recognizer.isListening()) {
                recognizer.stopListening();
            }
        });
        stopVoiceLoading();
        stopPlayingVideoExcept();
    }
});

// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/qnatljHuF/";

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    return recognizer;
}

async function enableListen(recognizer) {
    const classLabels = recognizer.wordLabels(); // get class labels
    log('model - name: ' + recognizer.model.name);
    window.recognizer = recognizer;

    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    return recognizer.listen(result => {
        const scores = result.scores; // probability of prediction for each class
        if (scores[0] > 0.7) {
            return;
        }

        console.log(result);
        debugger;

        const i = tf.argMax(scores).arraySync();
        const label = classLabels[i];
        log(label, scores[i]);

        if (label == 'stop') {
            stopPlayingVideoExcept();
            return;
        }

        const video = $('video[data-name="' + label + '"]').get(0);
        if (video.paused) {
            video.click();
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: false,
        includeRawAudio: true,
        overlapFactor: 0.5
    }).then(function() {
        recognizer.audioDataExtractor.includeRawAudio = true;
    });
}
