(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Collections.StudentCourseList = Backbone.Collection.extend({
        model: ANGradeBook.Models.StudentCourse,
        url: function() {
            return anGradebookSettings.ajaxurl + '?action=get_student_courses';
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
