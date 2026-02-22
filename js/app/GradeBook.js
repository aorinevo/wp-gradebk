(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.GradeBookApp = Backbone.View.extend({
        events: {
            'click button#add-course': 'editCourse',
            'click #an-courses-container': 'toggleEditDelete'
        },
        initialize: function(options) {
            $('#wpbody-content').append(this.render().el);
            this.courses = new ANGradeBook.Collections.CourseList([]);
            this.cells = new ANGradeBook.Collections.CellList([]);
            this.students = new ANGradeBook.Collections.StudentList([]);
            this.assignments = new ANGradeBook.Collections.AssignmentList([]);
            this.options = options || {};
            this.options.gradebook_state = {courses: this.courses, students: this.students, assignments: this.assignments, cells: this.cells};
            this.courses.fetch();
            this.listenTo(this.courses, 'change:selected', this.showGradebook);
            this.listenTo(this.courses, 'add', this.addCourse);
            return this;
        },
        render: function() {
            var template = _.template($('#courses-interface-template').html());
            this.$el.html(template);
            return this;
        },
        showGradebook: function(course) {
            if (course.get('selected') === true) {
                var gradebook = new ANGradeBook.Views.GradebookView({options: this.options});
            }
            return this;
        },
        editCourse: function(ev) {
            if ($(ev.currentTarget)[0]['id'] === 'add-course') {
                var x = this.courses.findWhere({selected: true});
                if (x) {
                    x.set({selected: false});
                }
            }
            var view = new ANGradeBook.Views.EditCourseView({options: this.options});
            return false;
        },
        addCourse: function(course) {
            var view = new ANGradeBook.Views.CourseView({model: course, options: this.options});
            $('#courses').append(view.render().el);
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
