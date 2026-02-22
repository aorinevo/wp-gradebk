(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Models.Assignment = Backbone.Model.extend({
        defaults: {
            assign_category: '',
            assign_name: 'assign name',
            assign_due: '',
            assign_date: '',
            gbid: null,
            sorted: '',
            visibility: true,
            publish: true,
            selected: false
        },
        url: function() {
            if (this.get('id')) {
                return anGradebookSettings.ajaxurl + '?action=assignment&id=' + this.get('id');
            } else {
                return anGradebookSettings.ajaxurl + '?action=assignment';
            }
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
