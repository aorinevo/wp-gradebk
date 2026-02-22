(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Models.Course = Backbone.Model.extend({
        defaults: {
            name: 'Calculus I',
            school: 'Bergen',
            semester: 'Fall',
            year: '2014',
            selected: false
        },
        url: function() {
            if (this.get('id')) {
                return anGradebookSettings.ajaxurl + '?action=course&id=' + this.get('id');
            } else {
                return anGradebookSettings.ajaxurl + '?action=course';
            }
        },
        export2csv: function() {
            window.location.assign(anGradebookSettings.ajaxurl + '?action=get_csv&id=' + this.get('id') + '&nonce=' + anGradebookSettings.nonce);
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
