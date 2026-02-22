(function($) {
    'use strict';

    window.ANGradeBook = window.ANGradeBook || {};
    ANGradeBook.Models = {};
    ANGradeBook.Collections = {};
    ANGradeBook.Views = {};

    // Automatically append nonce to all AJAX requests to admin-ajax.php
    $.ajaxPrefilter(function(options) {
        if (options.url && options.url.indexOf(anGradebookSettings.ajaxurl) !== -1) {
            options.url += (options.url.indexOf('?') !== -1 ? '&' : '?') + 'nonce=' + anGradebookSettings.nonce;
        }
    });

    // Load Google Charts packages
    if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', {packages: ['corechart']});
    }

    // jQuery serializeObject helper
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

})(jQuery);
