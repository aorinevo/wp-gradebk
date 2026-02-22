(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Collections.CellList = Backbone.Collection.extend({
        model: ANGradeBook.Models.Cell
    });
})(jQuery, Backbone, _, ANGradeBook);
