/*
 * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.charlescd.moove.legacy.moove.controller

import io.charlescd.moove.commons.representation.GroupsRepresentation
import io.charlescd.moove.legacy.moove.request.user.AddGroupsRequest
import io.charlescd.moove.legacy.moove.request.user.ResetPasswordRequest
import io.charlescd.moove.legacy.moove.service.KeycloakService
import io.charlescd.moove.legacy.moove.service.UserServiceLegacy
import io.swagger.annotations.Api
import io.swagger.annotations.ApiImplicitParam
import io.swagger.annotations.ApiOperation
import javax.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@Api(value = "User Endpoints", tags = ["User"])
@RestController
@RequestMapping("/users")
class UserController(
    private val userService: UserServiceLegacy,
    private val keycloakService: KeycloakService
) {

    @ApiOperation(value = "Find user groups")
    @GetMapping("/{id}/groups")
    @ResponseStatus(HttpStatus.OK)
    fun findUserGroups(@PathVariable id: String): GroupsRepresentation = keycloakService.findUserGroups(id)

    @ApiOperation(value = "Delete by id")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: String) {
        userService.delete(id)
    }

    @ApiOperation(value = "Reset password")
    @PutMapping("/{email}/reset-password")
    @ResponseStatus(HttpStatus.OK)
    fun resetPassword(@PathVariable email: String, @RequestBody request: ResetPasswordRequest) =
        userService.resetPassword(email, request)

    @ApiOperation(value = "Add groups")
    @ApiImplicitParam(name = "addGroupsRequest", value = "Add groups", required = true, dataType = "AddGroupsRequest")
    @PostMapping("/{id}/groups")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun addGroups(@PathVariable id: String, @Valid @RequestBody addGroupsRequest: AddGroupsRequest) {
        userService.addGroupsToUser(id, addGroupsRequest)
    }

    @ApiOperation(value = "Remove user from group")
    @DeleteMapping("/{userId}/groups/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeUserFromGroup(@PathVariable userId: String, @PathVariable groupId: String) {
        userService.removeUserFromGroup(userId, groupId)
    }
}
