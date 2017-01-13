define([
    'underscore',
    'backbone',
    'common',
    'sysadmin-app/models/group-repo'
], function(_, Backbone, Common, GroupRepoModel) {

    'use strict';

    var GroupRepoCollection = Backbone.Collection.extend({

        model: GroupRepoModel,

        setGroupId: function(group_id) {
            this.group_id = group_id;
        },

        url: function () {
            return Common.getUrl({name: 'admin-group-libraries', group_id: this.group_id});
        }
    });

    return GroupRepoCollection;
});
