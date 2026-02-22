(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Collections.CourseList = Backbone.Collection.extend({
        model: ANGradeBook.Models.Course,
        url: function() {
            return anGradebookSettings.ajaxurl + '?action=get_courses';
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
