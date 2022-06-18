import faker from '@faker-js/faker';
import { Server } from 'mock-socket';

const NUM_WORKS_PER_PAGE = 10;

const mockWebSocketServer = new Server('');

const user = {
  username: 'user',
  password: 'password'
};
const token = 'token';

const categories = [...Array(4)].map((_, i) => ({
  id: i + 1,
  name: faker.commerce.department()
}));

const createWork = () => ({
  id: 1,
  title: faker.commerce.productName(),
  coverFilename: 'cover'
});

const startFromHome = ({
  authenticated
}) => {
  let firstPageRequested = false;
  cy.intercept('POST', '/graphql', (req) => {
    expect(req.body).to.have.property('operationName');
    req.alias = `gql${req.body.operationName}`;
    switch (req.body.operationName) {
      case 'Categories':
        req.reply({
          data: {
            categories: {
              edges: categories.map((category) => ({ node: category }))
            }
          }
        });
        break;
      case 'Works':
        if (!firstPageRequested) {
          expect(req.body).to.have.property('variables').to.not.have.property('after');
          firstPageRequested = true;
        } else {
          expect(req.body).to.have.property('variables').to.have.property('after');
        }
        req.reply({
          data: {
            works: {
              edges: [...Array(NUM_WORKS_PER_PAGE)].map(() => ({ node: createWork() })),
              pageInfo: {
                hasNextPage: true,
                endCursor: 1
              }
            }
          }
        });
        break;
      default:
        throw new Error();
    }
  });

  cy.intercept('GET', '/uploaded/covers/*', { fixture: 'sample.png' });

  cy.visit('/', {
    onBeforeLoad: (window) => {
      cy.stub(window, 'WebSocket', () => mockWebSocketServer);
      if (authenticated) {
        window.localStorage.setItem('authorized', '1');
        window.localStorage.setItem('username', user.username);
        window.localStorage.setItem('accessToken', token);
      }
    }
  });

  if (authenticated) {
    cy.get('[data-test="anonUserIcon"]').should('not.exist');
  } else {
    cy.get('[data-test="anonUserIcon"]');
  }

  cy.wait(['@gqlCategories', '@gqlWorks']);
  cy.wait(500); // delay for infinite loading
};

describe('e2e', () => {
  beforeEach(() => {
    cy.viewport(1024, 768);
  });

  it('visit a protected page', () => {
    startFromHome({
      authenticated: false
    });

    cy.get('[data-test="openUserMenu"]').click();
    cy.get('[data-test="favoritesEntry"]').click();

    cy.hash().should('eq', '#/login');

    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);

    cy.intercept('POST', '/graphql', (req) => {
      expect(req.body).to.have.property('operationName');
      req.alias = `gql${req.body.operationName}`;
      switch (req.body.operationName) {
        case 'Categories':
          req.reply({
            data: {
              categories: {
                edges: categories.map((category) => ({ node: category }))
              }
            }
          });
          break;
        case 'MyFavorites':
          req.reply({
            data: {
              myFavorites: {
                edges: [...Array(NUM_WORKS_PER_PAGE)]
                  .map(() => ({ node: { work: createWork() } })),
                pageInfo: { hasNextPage: false }
              }
            }
          });
          break;
        default:
          throw new Error();
      }
    });

    cy.intercept('/graphql', { method: 'POST', times: 1 }, (req) => {
      expect(req.body).to.have.property('operationName', 'Login');
      expect(req.body).to.have.property('variables').to.deep.include({
        username: user.username,
        password: user.password
      });
      req.reply({
        data: {
          login: {
            accessToken: token,
            user: {
              username: user.username
            }
          }
        }
      });
    });

    cy.get('[data-test="submit"]').click();

    cy.wait(['@gqlCategories', '@gqlMyFavorites']).then(() => {
      expect(localStorage.getItem('authorized')).to.eq('1');
      expect(localStorage.getItem('username')).to.eq(user.username);
      expect(localStorage.getItem('accessToken')).to.eq(token);
    });
    cy.get('[data-test="anonUserIcon"]').should('not.exist');
    cy.hash().should('eq', '#/favorites');
  });

  it('infinite scrolling for work list', () => {
    let totalWorks;

    startFromHome({
      categories,
      hasInfiniteWorks: true
    });

    cy.get('[data-test="workEntry"]')
      .then(($entries) => {
        totalWorks = $entries.length;
      });

    cy.scrollTo('bottom');

    cy.wait(['@gqlWorks']);
    cy.wait(500); // delay for potential loading
    cy.get('[data-test="workEntry"]')
      .then(($entries) => {
        expect($entries.length).to.equal(totalWorks + NUM_WORKS_PER_PAGE);
      });
  });
});
