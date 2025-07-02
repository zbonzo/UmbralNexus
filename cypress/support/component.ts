// Component testing support file
import './commands';

// Import your global CSS
import '../../apps/web/src/styles/globals.css';

// Import any global providers or setup needed for component tests
import { mount } from 'cypress/react18';

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount);