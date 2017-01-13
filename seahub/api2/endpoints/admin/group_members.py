# Copyright (c) 2012-2016 Seafile Ltd.
import logging

from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from seaserv import seafile_api, ccnet_api

from seahub.group.utils import get_group_member_info, is_group_member
from seahub.avatar.settings import AVATAR_DEFAULT_SIZE

from seahub.api2.authentication import TokenAuthentication
from seahub.api2.throttling import UserRateThrottle
from seahub.api2.utils import api_error

logger = logging.getLogger(__name__)


class AdminGroupMembers(APIView):

    authentication_classes = (TokenAuthentication, SessionAuthentication)
    throttle_classes = (UserRateThrottle,)
    permission_classes = (IsAdminUser,)

    def get(self, request, group_id, format=None):
        """ List all group members

        Permission checking:
        1. only admin can perform this action.
        """

        group_id = int(group_id)
        group = ccnet_api.get_group(group_id)
        if not group:
            error_msg = 'Group %d not found.' % group_id
            return api_error(status.HTTP_404_NOT_FOUND, error_msg)

        try:
            avatar_size = int(request.GET.get('avatar_size',
                AVATAR_DEFAULT_SIZE))
        except ValueError:
            avatar_size = AVATAR_DEFAULT_SIZE

        try:
            members = ccnet_api.get_group_members(group_id)
        except Exception as e:
            logger.error(e)
            error_msg = 'Internal Server Error'
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, error_msg)

        group_members_info = []
        for m in members:
            member_info = get_group_member_info(request, group_id, m.user_name, avatar_size)
            group_members_info.append(member_info)

        return Response(group_members_info)


class AdminGroupMember(APIView):

    authentication_classes = (TokenAuthentication, SessionAuthentication)
    throttle_classes = (UserRateThrottle,)
    permission_classes = (IsAdminUser,)

    def delete(self, request, group_id, email, format=None):
        """ Delete an user from group

        Permission checking:
        1. only admin can perform this action.
        """

        group_id = int(group_id)
        group = ccnet_api.get_group(group_id)
        if not group:
            error_msg = 'Group %d not found.' % group_id
            return api_error(status.HTTP_404_NOT_FOUND, error_msg)

        try:
            if not is_group_member(group_id, email):
                return Response({'success': True})
        except Exception as e:
            logger.error(e)
            error_msg = 'Internal Server Error'
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, error_msg)

        if group.creator_name == email:
            error_msg = '%s is group owner, can not be removed.' % email
            return api_error(status.HTTP_403_FORBIDDEN, error_msg)

        try:
            ccnet_api.group_remove_member(group_id, group.creator_name, email)
            # remove repo-group share info of all 'email' owned repos
            seafile_api.remove_group_repos_by_owner(group_id, email)
        except Exception as e:
            logger.error(e)
            error_msg = 'Internal Server Error'
            return api_error(status.HTTP_500_INTERNAL_SERVER_ERROR, error_msg)

        return Response({'success': True})
