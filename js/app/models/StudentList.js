(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Collections.StudentList = Backbone.Collection.extend({
        model: ANGradeBook.Models.Student,
        comparator: function(model) {
            return model.get('lastname');
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
