(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.StudentCellView = Backbone.View.extend({
        tagName: 'td',
        initialize: function(options) {
            this.options = options.options;
            _(this).extend(this.options.gradebook_state);
            this.course = this.courses.findWhere({'selected': true});
            this.listenTo(this.assignments, 'change:hover', this.hoverCell);
            this.listenTo(this.assignments, 'change:assign_order', this.shiftCell);
            this.listenTo(this.assignments, 'change:visibility', this.visibilityCell);
            this.listenTo(this.assignments, 'remove', this.cleanUpAssignmentCells);
            this.listenTo(this.assignments, 'add remove change:sorted change:assign_order', this.close);
            this.listenTo(this.students, 'remove', this.cleanUpStudentCells);
            this.listenTo(this.students, 'add remove', this.close);
            this.listenTo(this.courses, 'remove change:selected', this.close);
        },
        render: function() {
            var _assignment = this.assignments.findWhere({id: this.model.get('amid')});
            if (_assignment) {
                this.$el.toggleClass('hidden', !_assignment.get('visibility'));
            }
            var template = _.template($('#student-cell-template').html());
            var compiled = template({cell: this.model});
            this.$el.html(compiled);
            this.input = this.$('.edit');
            return this;
        },
        cleanUpAssignmentCells: function(ev) {
            if (ev.get('id') === this.model.get('amid')) {
                this.cells.remove(this.model);
            }
        },
        cleanUpStudentCells: function(ev) {
            if (ev.get('id') === this.model.get('uid')) {
                this.cells.remove(this.model.get('id'));
            }
        },
        close: function() {
            this.remove();
        },
        shiftCell: function(ev) {
            this.remove();
            if (ev.get('id') === this.model.get('amid')) {
                this.model.set({assign_order: parseInt(ev.get('assign_order'))});
            }
        },
        hoverCell: function(ev) {
            if (this.model.get('amid') === ev.get('id')) {
                this.model.set({hover: ev.get('hover')});
                this.$el.toggleClass('hover', ev.get('hover'));
            }
        },
        visibilityCell: function(ev) {
            if (this.model.get('amid') === ev.get('id')) {
                this.model.set({visibility: ev.get('visibility')});
                this.render();
            }
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
