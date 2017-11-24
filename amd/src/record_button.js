// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This class manages the confirmation pop-up (also called the pre-flight check)
 * that is sometimes shown when a use clicks the start attempt button.
 *
 * This is also responsible for opening the pop-up window, if the quiz requires to be in one.
 *
 * @module    mod_accentrecognizer/record_button
 * @class     RecordButton
 * @package   mod_accentrecognizer
 * @copyright 2017 Kristobal Junta
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/notification', 'core/templates', 'core/str'], function($, notification, templates, str) {

    var recorder = false;
    var outputEl = document.body;

    function setButtonState (state) {
        var button = $('[data-action="record"]');
        if ('default' === state) {
            str.get_string('accentrecognizer_record', 'mod_accentrecognizer')
                .done(function (text) {
                    var icon = document.createElement('i');
                    icon.className = 'fa fa-microphone fa-2x';
                    icon.style.verticalAlign = 'middle';

                    var markup = icon.outerHTML + ' ' + text;

                    button.removeClass('btn-danger btn-warning').addClass('btn-primary');
                    button.html(markup);
                    button.prop('disabled', false);
                });
        } else if ('recording' === state) {
            str.get_string('accentrecognizer_stop', 'mod_accentrecognizer')
                .done(function (text) {
                    var icon = document.createElement('i');
                    icon.className = 'fa fa-stop fa-2x';
                    icon.style.verticalAlign = 'middle';

                    var markup = icon.outerHTML + ' ' + text;

                    button.removeClass('btn-primary btn-warning').addClass('btn-danger');
                    button.html(markup);
                    button.prop('disabled', false);
                });
        } else if ('sending' === state) {
            str.get_string('accentrecognizer_sending', 'mod_accentrecognizer')
                .done(function (text) {
                    var icon = document.createElement('i');
                    icon.className = 'fa fa-spinner fa-2x fa-spin';
                    icon.style.verticalAlign = 'middle';

                    var markup = icon.outerHTML + ' ' + text;

                    button.removeClass('btn-danger btn-primary').addClass('btn-warning');
                    button.html(markup);
                    button.prop('disabled', true);
                });
        }
        button.data('state', state);
    }

    function createAudioElement(blobUrl) {
        var downloadEl = document.createElement('a');
        downloadEl.style = 'display: block';
        downloadEl.innerHTML = 'download';
        downloadEl.download = 'audio.webm';
        downloadEl.href = blobUrl;
        var audioEl = document.createElement('audio');
        audioEl.controls = true;
        var sourceEl = document.createElement('source');
        sourceEl.src = blobUrl;
        sourceEl.type = 'audio/webm';
        audioEl.appendChild(sourceEl);

        outputEl.innerHTML = '';
        outputEl.appendChild(audioEl);
        outputEl.appendChild(downloadEl);
    }

    function setupRecorder(outEl) {
        if (outEl) { outputEl = outEl; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            recorder = new MediaRecorder(stream);
        }).catch(notification.exception);
    }

    function startRecorder () {
        if (!recorder) {
            notification.exception('Error using recorder!');
            return false;
        }

        var chunks = [];
        recorder.ondataavailable = function (e) {
            // add stream data to chunks
            chunks.push(e.data);
            // if recorder is 'inactive' then recording has finished
            if (recorder.state == 'inactive') {
                // convert stream data chunks to a 'webm' audio format as a blob
                var blob = new Blob(chunks, { type: 'audio/webm' });
                // convert blob to URL so it can be assigned to a audio src attribute
                createAudioElement(URL.createObjectURL(blob));

                // send blob to backend
                var fd = new FormData();
                var blobUrl = URL.createObjectURL(blob).split('/');
                var blobName = blobUrl[blobUrl.length - 1];
                fd.append('file', blob, blobName);
                $.post({
                    'url': 'http://localhost:5000/classify',
                    'data': fd,
                    processData: false,
                    contentType: false,
                })
                .done(function (results) {
                    var closestAcc = ['None', -100];
                    for (var k in results) { // TODO: separate to function
                        if (results[k] > closestAcc[1]) {
                            closestAcc = [k, results[k]];
                        }
                    }

                    var context = {
                        'closestAccent': closestAcc[0],
                        'engSimilarity': parseInt(results.EN * 100)
                    };

                    setButtonState('default');
                    templates.render('mod_accentrecognizer/recognition_results', context)
                        .then(function (html) {
                            outputEl.innerHTML = html;
                        })
                        .fail(notification.exception);
                });
            }
        };
        recorder.start(1000);
    }

    function stopRecorder () {
        if (!recorder) {
            notification.exception('Error using recorder!');
            return false;
        }

        recorder.stop();
    }

    function setHandlers () {
        $('body').on('click', '[data-action="record"]', function () {
            var button = $(this);

            if (button.data('state') === 'default') {
                setButtonState('recording');
                startRecorder();
            } else if (button.data('state') === 'recording') {
                setButtonState('sending');
                stopRecorder();
            }
        });
    }

    var rb = {
        init: function () {
            setupRecorder(document.querySelector('[data-role="record-output"]'));
            setHandlers();
        }
    };

    return rb;
});
