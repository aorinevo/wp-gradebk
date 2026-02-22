(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Models.Cell = Backbone.Model.extend({
        defaults: {
            uid: null,
            gbid: null,
            assign_order: null,
            amid: null,
            assign_points_earned: 0,
            selected: false,
            hover: false,
            visibility: true,
            display: false
        },
        url: function() {
            if (this.get('id')) {
                return anGradebookSettings.ajaxurl + '?action=cell&id=' + this.get('id');
            } else {
                return anGradebookSettings.ajaxurl + '?action=cell';
            }
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
