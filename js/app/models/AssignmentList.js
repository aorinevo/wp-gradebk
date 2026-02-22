(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Collections.AssignmentList = Backbone.Collection.extend({
        model: ANGradeBook.Models.Assignment
    });
})(jQuery, Backbone, _, ANGradeBook);
