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

import React from 'react';
import { render, screen } from 'unit-test/testUtils';
import CardBody from '../';

test('render Card component with content', () => {
  render(<CardBody>hello</CardBody>);

  const linkElement = screen.getByText('hello');
  expect(linkElement).toHaveTextContent('hello');
});

test('render Card component with margins', () => {
  render(<CardBody>hello</CardBody>);

  const linkElement = screen.getByText('hello');
  expect(linkElement).toHaveStyle('margin-left: 17px;');
  expect(linkElement).toHaveStyle('margin-right: 17px;');
});
