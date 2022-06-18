import { MockedProvider, MockSubscriptionLink } from '@apollo/client/testing';
import { mount } from '@cypress/react';
import faker from '@faker-js/faker';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import NewWorkNotification, { AUTO_HIDE_DURATION } from '@/components/layout/NewWorkNotification';

const DELAY_TIME = 500;

let link;

const createWork = ({ id }) => ({
  id,
  title: faker.commerce.productName()
});

describe('NewWorkNotification', () => {
  beforeEach(() => {
    cy.viewport(1024, 768);
    link = new MockSubscriptionLink();
    mount(
      <MemoryRouter initialEntries={['/']}>
        <MockedProvider link={link}>
          <NewWorkNotification />
        </MockedProvider>
      </MemoryRouter>
    );
  });

  it('one notification', () => {
    const workId = 1;
    const work = createWork({ id: workId });

    cy.wait(1000).then(() => {
      link.simulateResult({ result: { data: { workCreated: work } } });
    });
    cy.get(`[data-test="newWorkNotification"][data-test-id="${workId}"]`, { timeout: DELAY_TIME })
      .as('notification')
      .contains(work.title);
    cy.get('a[data-test="newWorkNotificationView"]')
      .should('have.attr', 'href', `/works/${workId}`);

    cy.wait(AUTO_HIDE_DURATION);
    cy.get('@notification', { timeout: DELAY_TIME }).should('not.exist');
  });

  it('close a notification', () => {
    const workId = 1;
    const work = createWork({ id: workId });

    cy.wait(1000).then(() => {
      link.simulateResult({ result: { data: { workCreated: work } } });
    });
    cy.wait(AUTO_HIDE_DURATION / 2);
    cy.get('[data-test="newWorkNotificationClose"]').click();

    cy.get(`[data-test="newWorkNotification"][data-test-id="${workId}"]`, { timeout: DELAY_TIME })
      .should('not.exist');
  });

  it('another notification replaces the preceding one', () => {
    const work1Id = 1;
    const work1 = createWork({ id: work1Id });
    const work2Id = 2;
    const work2 = createWork({ id: work2Id });

    cy.wait(1000).then(() => {
      link.simulateResult({ result: { data: { workCreated: work1 } } });
    });
    cy.get(`[data-test="newWorkNotification"][data-test-id="${work1Id}"]`, { timeout: DELAY_TIME })
      .as('notification1')
      .contains(work1.title);

    cy.wait(AUTO_HIDE_DURATION / 2).then(() => {
      link.simulateResult({ result: { data: { workCreated: work2 } } });
    });
    cy.get('@notification1', { timeout: DELAY_TIME }).should('not.exist');
    cy.get(`[data-test="newWorkNotification"][data-test-id="${work2Id}"]`, { timeout: DELAY_TIME })
      .as('notification2')
      .contains(work2.title);

    cy.wait(AUTO_HIDE_DURATION * (3 / 4));
    cy.get('@notification2', { timeout: DELAY_TIME });

    cy.wait(AUTO_HIDE_DURATION * (1 / 4));
    cy.get('@notification2', { timeout: DELAY_TIME }).should('not.exist');
  });
});
