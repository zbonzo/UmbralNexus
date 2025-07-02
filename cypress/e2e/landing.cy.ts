describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the coming soon message', () => {
    cy.contains('h1', 'Umbral Nexus').should('be.visible');
    cy.contains('Coming Soon!').should('be.visible');
  });

  it('has correct styling', () => {
    cy.get('body').should('have.css', 'background-color');
    cy.get('h1').should('have.class', 'text-6xl');
  });
});