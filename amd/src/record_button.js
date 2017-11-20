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
define(['jquery'], function($) {
    var rb = {
        init: function () {
            $('body').on('click', '[data-action="record"]', function () {
                var text;
                if ($(this).hasClass('btn-primary')) {
                    text = $(this).text().trim();
                    $(this).removeClass('btn-primary').addClass('btn-danger');
                    $(this).html($(this).html().replace(text, $(this).data('text')));
                    $(this).find('i').removeClass('fa-microphone').addClass('fa-stop');
                    $(this).data('text', text);
                } else {
                    text = $(this).text().trim();
                    $(this).removeClass('btn-danger').addClass('btn-primary');
                    $(this).html($(this).html().replace(text, $(this).data('text')));
                    $(this).find('i').removeClass('fa-stop').addClass('fa-microphone');
                    $(this).data('text', text);
                }
            });
        }
    };

    return rb;
});
