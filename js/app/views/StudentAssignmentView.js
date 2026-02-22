(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.StudentAssignmentView = Backbone.View.extend({
        tagName: 'th',
        className: 'assignment-tools assignment',
        events: {
            'click .dashicons-menu': 'toggleAssignmentMenu',
            'click li.assign-submenu-stats': 'statsAssignment',
            'click li.assign-submenu-details': 'detailsAssignment',
            'mouseenter div.column-frame': 'mouseEnter',
            'mouseleave div.column-frame': 'mouseLeave'
        },
        initialize: function(options) {
            this.options = options.options;
            _(this).extend(this.options.gradebook_state);
            this.course = this.courses.findWhere({'selected': true});
            this.assignment = this.model;
            this.listenTo(this.assignment, 'change:assign_name', this.render);
            this.listenTo(this.assignment, 'change:sorted', this.sortColumnCSS);
            this.listenTo(this.assignment, 'change:visibility', this.visibilityColumnCSS);
            this.listenTo(this.students, 'add remove', this.close);
            this.listenTo(this.assignments, 'add remove change:sorted change:assign_order', this.close);
            this.listenTo(this.courses, 'remove change:selected', this.close);
        },
        detailsAssignment: function(ev) {
            ev.preventDefault();
            var view = new ANGradeBook.Views.StudentDetailsAssignmentView({model: this.assignment, options: this.options});
        },
        mouseEnter: function() {
            this.$el.addClass('hover');
            this.assignment.set({hover: true});
        },
        mouseLeave: function() {
            this.$el.removeClass('hover');
            this.assignment.set({hover: false});
        },
        toggleAssignmentMenu: function() {
            var _assign_menu = $('#column-assign-id-' + this.model.get('id'));
            if (_assign_menu.css('display') === 'none') {
                var view = this;
                _assign_menu.toggle(1, function() {
                    var self = this;
                    $(document).one('click', function() {
                        $(self).hide();
                        view.model.set({hover: false});
                    });
                });
            }
        },
        render: function() {
            this.visibilityColumnCSS();
            var template = _.template($('#student-assignment-view-template').html());
            var compiled = template({
                assignment: this.assignment,
                min: _.min(this.assignments.models, function(assignment) { return assignment.get('assign_order'); }),
                max: _.max(this.assignments.models, function(assignment) { return assignment.get('assign_order'); })
            });
            this.$el.html(compiled);
            return this;
        },
        sortColumnCSS: function() {
            if (this.assignment.get('sorted')) {
                var desc = this.$el.hasClass('desc');
                this.$el.toggleClass("desc", !desc).toggleClass("asc", desc);
            } else {
                this.$el.removeClass('asc desc');
                this.$el.addClass('asc');
            }
        },
        visibilityColumnCSS: function(ev) {
            if (this.assignment.get('visibility')) {
                this.$el.removeClass('hidden');
            } else {
                this.$el.addClass('hidden');
            }
        },
        statsAssignment: function(ev) {
            ev.preventDefault();
            var view = new ANGradeBook.Views.AssignmentStatisticsView({model: this.assignment, options: this.options});
        },
        close: function() {
            this.remove();
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
