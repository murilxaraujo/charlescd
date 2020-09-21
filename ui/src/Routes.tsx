/* eslint-disable @typescript-eslint/camelcase */
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

import React, { Suspense, lazy, useEffect, useState, Fragment } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import routes from 'core/constants/routes';
import { getParam } from 'core/utils/routes';
import {
  setAccessToken,
  getAccessTokenDecoded,
  setRefreshToken,
  isIDMAuthFlow,
  redirectToIDM
} from 'core/utils/auth';
import { useCreateUser, useUser } from 'modules/Users/hooks';
import { saveProfile } from 'core/utils/profile';
import { HTTP_STATUS } from 'core/enums/HttpStatus';
import { useAuth } from 'modules/Auth/hooks';
import { isMicrofrontend } from 'App';

const Main = lazy(() => import('modules/Main'));
const Auth = lazy(() => import('modules/Auth'));
const Forbidden403 = lazy(() => import('modules/Error/403'));
const NotFound404 = lazy(() => import('modules/Error/404'));

const Routes = () => {
  const [enabledRoutes, setEnabledRoutes] = useState(false);
  const isEnabledRoutes = enabledRoutes || !isIDMAuthFlow();
  const { findByEmail, user, error } = useUser();
  const { getTokens, grants } = useAuth();
  const { create, newUser } = useCreateUser();

  useEffect(() => {
    const { email } = getAccessTokenDecoded();

    if (isIDMAuthFlow()) {
      const code = getParam('code');

      if (code) {
        getTokens(code);
      } else if (email) {
        findByEmail(email);
      } else {
        redirectToIDM();
      }
    }
  }, [getTokens, findByEmail]);

  useEffect(() => {
    if (error && error.status === HTTP_STATUS.notFound) {
      const { name, email } = getAccessTokenDecoded();
      create({ name, email });
    }
  }, [error, create]);

  useEffect(() => {
    if (newUser) {
      const { email } = getAccessTokenDecoded();
      findByEmail(email);
    }
  }, [newUser, findByEmail]);

  useEffect(() => {
    if (user) {
      saveProfile(user);
      setEnabledRoutes(true);
    }
  }, [user]);

  useEffect(() => {
    if (grants) {
      setAccessToken(grants['access_token']);
      setRefreshToken(grants['refresh_token']);
      const { email } = getAccessTokenDecoded();
      findByEmail(email);
    }
  }, [grants, findByEmail]);

  const renderRoutes = () => (
    <Fragment>
      <Route path={routes.error403} component={Forbidden403} />
      <Route path={routes.error404} component={NotFound404} />
      <Route path={routes.main} component={Main} />
    </Fragment>
  );

  return (
    <BrowserRouter basename={isMicrofrontend() ? '/charlescd' : '/'}>
      <Suspense fallback="">
        <Switch>
          <Route path={routes.auth} component={Auth} />
          {isEnabledRoutes && renderRoutes()}
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
};

export default Routes;
