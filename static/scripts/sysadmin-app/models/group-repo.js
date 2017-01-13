define([
    'underscore',
    'backbone',
    'common'
], function(_, Backbone, Common) {

    'use strict';

    var GroupRepo = Backbone.Model.extend({

        getIconUrl: function(size) {
            var is_readonly = this.get('permission') == "r" ? true : false;
            return Common.getLibIconUrl(false, is_readonly, size);
        },

        getIconTitle: function() {
            var icon_title = '';
            if (this.get('permission') == "rw") {
                icon_title = gettext("Read-Write");
            } else {
                icon_title = gettext("Read-Only");
            }

            return icon_title;
        }
    });

    return GroupRepo;
});
