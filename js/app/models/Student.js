(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Models.Student = Backbone.Model.extend({
        defaults: {
            firstname: 'john',
            lastname: 'doe',
            selected: false,
            user_login: null
        },
        url: function() {
            if (this.get('id')) {
                return anGradebookSettings.ajaxurl + '?action=student&id=' + this.get('id') + '&gbid=' + this.get('gbid') + '&delete_options=' + this.get('delete_options');
            } else {
                return anGradebookSettings.ajaxurl + '?action=student';
            }
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
