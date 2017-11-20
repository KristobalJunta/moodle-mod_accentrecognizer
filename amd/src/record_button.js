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
define(['jquery', 'core/notification'], function($, notification) {

    var recorder = false;
    var outputEl = document.body;

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
            var text;
            if ($(this).hasClass('btn-primary')) {
                text = $(this).text().trim();
                $(this).removeClass('btn-primary').addClass('btn-danger');
                $(this).html($(this).html().replace(text, $(this).data('text')));
                $(this).find('i').removeClass('fa-microphone').addClass('fa-stop');
                $(this).data('text', text);

                startRecorder();
            } else {
                text = $(this).text().trim();
                $(this).removeClass('btn-danger').addClass('btn-primary');
                $(this).html($(this).html().replace(text, $(this).data('text')));
                $(this).find('i').removeClass('fa-stop').addClass('fa-microphone');
                $(this).data('text', text);

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
