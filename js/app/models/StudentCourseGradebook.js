(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Models.StudentCourseGradebook = Backbone.Model.extend({
        url: function() {
            return anGradebookSettings.ajaxurl + '?action=get_student_gradebook_entire&gbid=' + parseInt(this.get('id'));
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
