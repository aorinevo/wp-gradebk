(function($, Backbone, _, ANGradeBook) {
    'use strict';
    // Legacy view - kept for compatibility but not currently used
    ANGradeBook.Views.StudentStatisticsView = Backbone.View.extend({
        id: 'base-modal',
        className: 'modal fade',
        events: {
            'hidden.bs.modal': 'editCancel'
        },
        initialize: function() {
            $('body').append(this.render().el);
            return this;
        },
        render: function() {
            var self = this;
            var student = this.model;
            var template = _.template($('#stats-student-template').html());
            var compiled = template({student: student});
            self.$el.html(compiled);
            this.$el.modal('show');
            return this;
        },
        editCancel: function() {
            this.$el.data('modal', null);
            this.remove();
            return false;
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
