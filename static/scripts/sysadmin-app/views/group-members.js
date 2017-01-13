define([
    'jquery',
    'underscore',
    'backbone',
    'common',
    'sysadmin-app/views/group-member',
    'sysadmin-app/collection/group-members'
], function($, _, Backbone, Common, GroupMemberView, GroupMemberCollection) {

    'use strict';

    var GroupMembersView = Backbone.View.extend({

        id: 'admin-groups',

        tabNavTemplate: _.template($("#groups-tabnav-tmpl").html()),
        template: _.template($("#group-members-tmpl").html()),

        initialize: function() {
            this.groupMemberCollection = new GroupMemberCollection();
            this.listenTo(this.groupMemberCollection, 'add', this.addOne);
            this.listenTo(this.groupMemberCollection, 'reset', this.reset);
        },

        render: function() {
            var group_id = this.groupMemberCollection.group_id;
            this.$el.html(this.tabNavTemplate({'cur_tab': 'members', 'group_id': group_id}) + this.template());

            this.$table = this.$('table');
            this.$tableBody = $('tbody', this.$table);
            this.$loadingTip = this.$('.loading-tip');
            this.$emptyTip = this.$('.empty-tips');
        },

        initPage: function() {
            this.$table.hide();
            this.$tableBody.empty();
            this.$loadingTip.show();
            this.$emptyTip.hide();
        },

        hide: function() {
            this.$el.detach();
            this.attached = false;
        },

        show: function(group_id) {
            if (!this.attached) {
                this.attached = true;
                $("#right-panel").html(this.$el);
            }

            // init collection
            this.groupMemberCollection.setGroupId(group_id);
            this.render();
            this.showGroupMembers();
        },

        showGroupMembers: function() {
            this.initPage();
            var _this = this;

            this.groupMemberCollection.fetch({
                cache: false,
                reset: true,
                error: function(collection, response, opts) {
                    var err_msg;
                    if (response.responseText) {
                        if (response['status'] == 401 || response['status'] == 403) {
                            err_msg = gettext("Permission error");
                        } else {
                            err_msg = $.parseJSON(response.responseText).error_msg;
                        }
                    } else {
                        err_msg = gettext("Failed. Please check the network.");
                    }
                    Common.feedback(err_msg, 'error');
                }
            });
        },

        reset: function() {
            this.$loadingTip.hide();
            if (this.groupMemberCollection.length > 0) {
                this.groupMemberCollection.each(this.addOne, this);
                this.$table.show();
            } else {
                this.$emptyTip.show();
            }
        },

        addOne: function(member) {
            var view = new GroupMemberView({model: member});
            this.$tableBody.append(view.render().el);
        }
    });

    return GroupMembersView;

});
