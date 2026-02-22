(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.EditCourseView = Backbone.View.extend({
        id: 'base-modal',
        className: 'modal fade',
        events: {
            'hidden.bs.modal': 'editCancel',
            'keyup': 'keyPressHandler',
            'click #edit-course-save': 'submitForm',
            'submit #edit-course-form': 'editSave'
        },
        initialize: function(options) {
            this.options = options.options;
            _(this).extend(this.options.gradebook_state);
            this.course = this.model || null;
            $('body').append(this.render().el);
            return this;
        },
        render: function() {
            var self = this;
            var template = _.template($('#edit-course-template').html());
            var compiled = template({course: this.course});
            self.$el.html(compiled);
            this.$el.modal('show');
            _.defer(function() {
                self.inputName = self.$('input[name="name"]');
            });
            return this;
        },
        keyPressHandler: function(e) {
            var self = this;
            switch (e.keyCode) {
                case 27:
                    self.$el.modal('hide');
                    break;
                case 13:
                    self.submitForm();
                    break;
            }
            return this;
        },
        editCancel: function() {
            this.$el.data('modal', null);
            this.remove();
            return false;
        },
        submitForm: function() {
            $('#edit-course-form').submit();
        },
        editSave: function(ev) {
            var self = this;
            var courseInformation = $(ev.currentTarget).serializeObject();
            if (this.course) {
                this.model.save(courseInformation, {wait: true});
                this.$el.modal('hide');
            } else {
                delete(courseInformation['id']);
                var toadds = new ANGradeBook.Models.Course(courseInformation);
                toadds.save(courseInformation, {
                    success: function(model) {
                        self.courses.add(model);
                        self.$el.modal('hide');
                    }
                });
            }
            return false;
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
