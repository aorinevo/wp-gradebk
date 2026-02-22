(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.StudentDetailsAssignmentView = Backbone.View.extend({
        id: 'base-modal',
        className: 'modal fade',
        initialize: function() {
            $('body').append(this.render().el);
            return this;
        },
        render: function(options) {
            var self = this;
            var assignment = this.model;
            var template = _.template($('#student-details-assignment-template').html());
            var compiled = template({assignment: assignment});
            self.$el.html(compiled);
            this.$el.modal('show');
            return this;
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
