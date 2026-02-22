(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.GradeBookStudentApp = Backbone.View.extend({
        events: {
            'click button#add-course': 'editCourse',
            'click #an-courses-container': 'toggleEditDelete'
        },
        initialize: function(options) {
            $('#wpbody-content').append(this.render().el);
            this.courses = new ANGradeBook.Collections.StudentCourseList([]);
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
            var template = _.template($('#student-courses-interface-template').html());
            this.$el.html(template);
            return this;
        },
        showGradebook: function(course) {
            if (course.get('selected') === true) {
                var gradebook = new ANGradeBook.Views.StudentGradebookView({options: this.options});
            }
            return this;
        },
        addCourse: function(course) {
            var view = new ANGradeBook.Views.StudentCourseView({model: course, options: this.options});
            $('#courses').append(view.render().el);
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
