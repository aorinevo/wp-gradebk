(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Models.CourseGradebook = Backbone.Model.extend({
        url: function() {
            return anGradebookSettings.ajaxurl + '?action=get_gradebook_entire&gbid=' + parseInt(this.get('id'));
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
