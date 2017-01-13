define([
    'jquery',
    'underscore',
    'backbone',
    'common',
    'app/views/widgets/hl-item-view'
], function($, _, Backbone, Common, HLItemView) {

    'use strict';

    var GroupMemberView = HLItemView.extend({

        tagName: 'tr',

        template: _.template($('#group-member-item-tmpl').html()),

        events: {
            'click .member-delete-btn': 'deleteGroupMember'
        },

        initialize: function() {
            HLItemView.prototype.initialize.call(this);
        },

        deleteGroupMember: function() {
            var _this = this;
            var email = this.model.get('email');
            var popupTitle = gettext("Delete Member");
            var popupContent = gettext("Are you sure you want to delete %s ?").replace('%s', '<span class="op-target ellipsis ellipsis-op-target" title="' + Common.HTMLescape(email) + '">' + Common.HTMLescape(email) + '</span>');
            var yesCallback = function() {
                $.ajax({
                    url: Common.getUrl({
                        'name': 'admin-group-member',
                        'group_id': _this.model.get('group_id'),
                        'email': email,
                    }),
                    type: 'DELETE',
                    beforeSend: Common.prepareCSRFToken,
                    dataType: 'json',
                    success: function() {
                        _this.$el.remove();
                        Common.feedback(gettext("Success"), 'success');
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        Common.ajaxErrorHandler(xhr, textStatus, errorThrown);
                    },
                    complete: function() {
                        $.modal.close();
                    }
                });
            };
            Common.showConfirm(popupTitle, popupContent, yesCallback);
            return false;
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }

    });

    return GroupMemberView;
});
