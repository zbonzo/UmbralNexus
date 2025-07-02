/// <reference types="cypress" />

// Custom commands for Umbral Nexus E2E tests

// Example: Join a game
Cypress.Commands.add('joinGame', (gameId: string, playerName: string) => {
  cy.visit(`/join/${gameId}`);
  cy.get('[data-testid="player-name-input"]').type(playerName);
  cy.get('[data-testid="join-game-button"]').click();
});

// Example: Create a new game
Cypress.Commands.add('createGame', (gameName: string, playerCap: number = 10) => {
  cy.visit('/');
  cy.get('[data-testid="create-game-button"]').click();
  cy.get('[data-testid="game-name-input"]').type(gameName);
  cy.get('[data-testid="player-cap-slider"]').invoke('val', playerCap).trigger('change');
  cy.get('[data-testid="create-game-submit"]').click();
});

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      joinGame(gameId: string, playerName: string): Chainable<void>
      createGame(gameName: string, playerCap?: number): Chainable<void>
    }
  }
}

export {};