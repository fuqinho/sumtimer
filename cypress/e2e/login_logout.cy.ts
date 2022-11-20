describe('Login / Logout', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.logout();
  });

  it('can toggle log-in button visibility', () => {
    // Login programmatically.
    cy.login();

    // Login button disappears.
    cy.get('#btn-signin').should('not.exist');
    // There should be 8 preset activities.
    cy.get('.q-item.activity').should('have.length', 8);

    // Logout
    cy.logout();
    cy.get('#btn-signin').should('exist');
  });

  it('can show/hide preset activities.', () => {
    cy.login();

    // There should be 8 preset activities.
    cy.get('.q-item.activity').should('have.length', 8);
    cy.get('.q-item.activity').first().contains('General work');
    cy.get('.q-item.activity').last().contains('House cleaning');

    cy.logout();
    // Preset activities should disappear.
    cy.get('.q-item.activity').should('not.exist');
  });
});
