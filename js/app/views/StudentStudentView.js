(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.StudentStudentView = Backbone.View.extend({
        tagName: 'tr',
        events: {
            'click a.student-statistics': 'studentStatistics',
            'click .dashicons-menu': 'toggleStudentMenu',
            'click li.student-submenu-stats': 'studentStatistics'
        },
        initialize: function(options) {
            var self = this;
            this.options = options.options;
            _(this).extend(this.options.gradebook_state);
            this.course = this.courses.findWhere({'selected': true});
            this.listenTo(this.model, 'change:firstname change:lastname', this.render);
            this.listenTo(self.students, 'add remove', this.close);
            this.listenTo(self.assignments, 'add remove change:sorted change:assign_order', this.close);
            this.listenTo(self.courses, 'remove change:selected', this.close);
        },
        render: function() {
            var template = _.template($('#student-student-view-template').html());
            var compiled = template({student: this.model});
            this.$el.html(compiled);
            var gbid = parseInt(this.courses.findWhere({selected: true}).get('id'));
            var x = this.cells.where({
                uid: parseInt(this.model.get('id')),
                gbid: gbid
            });
            x = _.sortBy(x, function(model) { return model.get('assign_order'); });
            var self = this;
            _.each(x, function(cell) {
                var view = new ANGradeBook.Views.StudentCellView({model: cell, options: self.options});
                self.$el.append(view.render().el);
            });
            return this;
        },
        toggleStudentMenu: function() {
            var _student_menu = $('#row-student-id-' + this.model.get('id'));
            if (_student_menu.css('display') === 'none') {
                var view = this;
                _student_menu.toggle(1, function() {
                    var self = this;
                    $(document).one('click', function() {
                        $(self).hide();
                    });
                });
            }
        },
        studentStatistics: function(ev) {
            ev.preventDefault();
            var view = new ANGradeBook.Views.StatisticsView({model: this.model, options: this.options});
        },
        close: function() {
            this.remove();
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
