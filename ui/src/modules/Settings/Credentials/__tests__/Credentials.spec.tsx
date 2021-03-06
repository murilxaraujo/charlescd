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

import React, { ReactElement } from 'react';
import { render, fireEvent, wait, screen, act, waitFor } from 'unit-test/testUtils';
import userEvent from '@testing-library/user-event';
import { FetchMock } from 'jest-fetch-mock/types';
import * as StateHooks from 'core/state/hooks';
import { WORKSPACE_STATUS } from 'modules/Workspaces/enums';
import Credentials from '../';
import * as clipboardUtils from 'core/utils/clipboard';
import { Actions, Subjects } from "core/utils/abilities";
import * as MetricProviderHooks from '../Sections/MetricProvider/hooks';
import { Datasources } from '../Sections/MetricProvider/__tests__/fixtures';

interface fakeCanProps {
  I?: Actions;
  a?: Subjects;
  passThrough?: boolean;
  isDisabled?: boolean;
  allowedRoutes?: boolean;
  children: ReactElement;
}

jest.mock('containers/Can', () => {
  return {
    __esModule: true,
    default:  ({children}: fakeCanProps) => {
      return <div>{children}</div>;
    }
  };
});

test('render Credentials default component', async () => {
  (fetch as FetchMock).mockResponseOnce(JSON.stringify({ name: 'workspace' }));
  
  render(<Credentials />);

  const credentialsElement = await screen.findByTestId("credentials");
  expect(credentialsElement).toBeInTheDocument();
});

test('render Credentials items', async () => {
  (fetch as FetchMock).mockResponseOnce(
    JSON.stringify([{ name: 'workspace', nickname: 'action', id: '1' }])
  );
  jest.spyOn(StateHooks, 'useGlobalState').mockImplementation(() => ({
    item: {
      id: '123',
      status: WORKSPACE_STATUS.COMPLETE
    },
    status: 'resolved'
  }));
  
  render(<Credentials />);

  await waitFor(() => expect(screen.getByTestId('contentIcon-workspace')).toBeInTheDocument());
  expect(screen.getByTestId('contentIcon-users')).toBeInTheDocument();
  expect(screen.getByTestId('contentIcon-git')).toBeInTheDocument();
  expect(screen.getByTestId('contentIcon-server')).toBeInTheDocument();
  expect(screen.getByTestId('contentIcon-cd-configuration')).toBeInTheDocument();
  expect(screen.getByTestId('contentIcon-circle-matcher')).toBeInTheDocument();
  expect(screen.getByTestId('contentIcon-metrics')).toBeInTheDocument();
});

test('render User Group credentials', async () => {
  jest.spyOn(StateHooks, 'useGlobalState').mockImplementation(() => ({
    item: {
      id: '123',
      status: WORKSPACE_STATUS.COMPLETE
    },
    status: 'resolved'
  }));
  
  jest.spyOn(MetricProviderHooks, 'useDatasource').mockImplementation(() => ({
    responseAll: [...Datasources],
    getAll: jest.fn
  }));

  render(<Credentials />);
  
  const content = screen.getByTestId('contentIcon-users');
  expect(content).toBeInTheDocument();

  const addUserGroupButton = screen.getByText('Add User group');
  userEvent.click(addUserGroupButton);

  const backButton = screen.getByTestId('icon-arrow-left');
  expect(backButton).toBeInTheDocument();
  
  await act(async () => userEvent.click(backButton));
  expect(backButton).not.toBeInTheDocument();
});

test('render Git Credentials', async () => {
  jest.spyOn(StateHooks, 'useGlobalState').mockImplementation(() => ({
    item: {
      id: '123',
      status: WORKSPACE_STATUS.COMPLETE
    },
    status: 'resolved'
  }));
  render(<Credentials />);

  const addGitButton = await screen.findByText(/Add Git/);
  userEvent.click(addGitButton);

  const backButton = screen.getByTestId('icon-arrow-left');
  expect(backButton).toBeInTheDocument();
});

test('render CD Configuration Credentials', async () => {
  jest.spyOn(StateHooks, 'useGlobalState').mockImplementation(() => ({
    item: {
      id: '123',
      status: WORKSPACE_STATUS.COMPLETE
    },
    status: 'resolved'
  }));
  render(<Credentials />);

  const addCDConfigButton = await screen.findByText('Add CD Configuration');

  userEvent.click(addCDConfigButton);

  const backButton = screen.getByTestId('icon-arrow-left');
  expect(backButton).toBeInTheDocument();
});

test('render Circle Matcher Credentials', async() => {
  jest.spyOn(StateHooks, 'useGlobalState').mockImplementation(() => ({
    item: {
      id: '123',
      status: WORKSPACE_STATUS.COMPLETE
    },
    status: 'resolved'
  }));
  render(<Credentials />);

  const addCircleMatcherButton = await screen.findByText('Add Circle Matcher');
  userEvent.click(addCircleMatcherButton);

  const backButton = screen.getByTestId('icon-arrow-left');
  expect(backButton).toBeInTheDocument();
});

test('click to copy to clipboard', async () => {
  jest.spyOn(StateHooks, 'useGlobalState').mockImplementation(() => ({
    item: {
      id: '123-workspace',
      status: WORKSPACE_STATUS.COMPLETE
    },
    status: 'resolved'
  }));

  const copyToClipboardSpy = jest.spyOn(clipboardUtils, 'copyToClipboard');

  render(<Credentials />);

  const dropdownElement = await screen.findByTestId('icon-vertical-dots');
  userEvent.click(dropdownElement);
  const copyIDElement = screen.getByText('Copy ID');
  
  expect(copyIDElement).toBeInTheDocument();
  
  act(() => userEvent.click(copyIDElement));

  expect(copyToClipboardSpy).toBeCalled();
});
