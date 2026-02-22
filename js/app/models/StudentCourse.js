(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Models.StudentCourse = Backbone.Model.extend({
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
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
