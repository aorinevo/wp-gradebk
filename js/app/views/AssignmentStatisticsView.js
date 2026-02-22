(function($, Backbone, _, ANGradeBook) {
    'use strict';
    ANGradeBook.Views.AssignmentStatisticsView = Backbone.View.extend({
        id: 'base-modal',
        className: 'modal fade',
        events: {
            'hidden.bs.modal': 'editCancel',
            'keyup': 'keyPressHandler'
        },
        initialize: function(options) {
            this.options = options.options;
            _(this).extend(this.options.gradebook_state);
            $('body').append(this.render().el);
            return this;
        },
        drawPieChart: function(data) {
            var datag = new google.visualization.DataTable();
            datag.addColumn('string', 'Grades');
            datag.addColumn('number', 'Number');
            datag.addRows([
                ['A', data['grades'][0]],
                ['B', data['grades'][1]],
                ['C', data['grades'][2]],
                ['D', data['grades'][3]],
                ['F', data['grades'][4]]
            ]);
            var optionsg = {
                'title': data['assign_name'],
                'width': '300',
                'height': '300',
                'backgroundColor': 'none'
            };
            var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
            chart.draw(datag, optionsg);
        },
        displayPieChart: function() {
            var self = this;
            var assignment = this.model;
            $.get(anGradebookSettings.ajaxurl, {
                action: 'get_pie_chart',
                amid: assignment.get('id'),
                gbid: assignment.get('gbid'),
                nonce: anGradebookSettings.nonce
            }, function(data) {
                self.drawPieChart({grades: data['grades'], assign_name: assignment.get('assign_name')});
            }, 'json');
            return this;
        },
        render: function() {
            var self = this;
            var assignment = this.model;
            var template = _.template($('#stats-assignment-template').html());
            var compiled = template({assignment: assignment});
            self.$el.html(compiled);
            google.charts.setOnLoadCallback(function() {
                self.displayPieChart();
            });
            this.$el.modal('show');
            return this;
        },
        editCancel: function() {
            this.$el.data('modal', null);
            this.remove();
            return false;
        },
        keyPressHandler: function(e) {
            if (e.keyCode == 27) this.editCancel();
            if (e.keyCode == 13) this.submitForm();
            return this;
        }
    });
})(jQuery, Backbone, _, ANGradeBook);
