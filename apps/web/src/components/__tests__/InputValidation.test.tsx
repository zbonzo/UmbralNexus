import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleCreateGameForm } from '../game/SimpleCreateGameForm';
import { SimpleJoinGameForm } from '../game/SimpleJoinGameForm';

describe('Frontend Input Validation Edge Cases', () => {
  describe('Game Creation Form', () => {
    it('should handle empty game name', async () => {
      const onCreate = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });
      
      // Clear and submit
      await userEvent.clear(nameInput);
      await userEvent.click(submitButton);
      
      // Should show validation error
      expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only game name', async () => {
      const onCreate = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });
      
      await userEvent.type(nameInput, '   \t  ');
      await userEvent.click(submitButton);
      
      // Should show validation error
      expect(await screen.findByText(/name cannot be empty/i)).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it('should sanitize XSS attempts in game name', async () => {
      const onCreate = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const playerInput = screen.getByLabelText(/your name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });
      
      await userEvent.type(nameInput, '<script>alert("xss")</script>Game');
      await userEvent.type(playerInput, 'Player');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onCreate).toHaveBeenCalled();
        const call = onCreate.mock.calls[0]?.[0];
        expect(call?.hostName).not.toContain('<script>');
        expect(call?.hostName).not.toContain('</script>');
      });
    });

    it('should handle unicode and emoji in names', async () => {
      const onCreate = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const playerInput = screen.getByLabelText(/your name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });
      
      await userEvent.type(nameInput, '🎮Game名前');
      await userEvent.type(playerInput, '😎Player🎯');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onCreate).toHaveBeenCalledWith({
          hostName: '🎮Game名前',
          playerCap: 4,
          difficulty: 'normal',
        });
      });
    });

    it('should enforce maximum name length', async () => {
      const onCreate = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const longName = 'A'.repeat(100);
      
      await userEvent.type(nameInput, longName);
      
      // Input should be truncated
      expect(nameInput).toHaveValue(expect.stringMatching(/^A{1,50}$/));
    });

    it('should prevent invalid player cap selection', () => {
      render(<SimpleCreateGameForm onCreate={vi.fn()} onCancel={vi.fn()} />);
      
      const playerCapSelect = screen.getByLabelText(/player limit/i);
      
      // Should only have valid options
      const options = playerCapSelect.querySelectorAll('option');
      options.forEach(option => {
        const value = parseInt(option.getAttribute('value') || '0');
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('Join Game Form', () => {
    it('should handle invalid game ID format', async () => {
      const onJoin = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleJoinGameForm onJoin={onJoin} onCancel={onCancel} />);
      
      const gameIdInput = screen.getByLabelText(/game id/i);
      const submitButton = screen.getByRole('button', { name: /join/i });
      
      // Too long
      await userEvent.type(gameIdInput, 'TOOLONG123');
      await userEvent.click(submitButton);
      
      expect(await screen.findByText(/must be 6 characters/i)).toBeInTheDocument();
      expect(onJoin).not.toHaveBeenCalled();
    });

    it('should handle special characters in game ID', async () => {
      const onJoin = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleJoinGameForm onJoin={onJoin} onCancel={onCancel} />);
      
      const gameIdInput = screen.getByLabelText(/game id/i);
      const submitButton = screen.getByRole('button', { name: /join/i });
      
      await userEvent.type(gameIdInput, '<>!@#$');
      await userEvent.click(submitButton);
      
      expect(await screen.findByText(/invalid game id/i)).toBeInTheDocument();
      expect(onJoin).not.toHaveBeenCalled();
    });

    it('should convert game ID to uppercase', async () => {
      const onJoin = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleJoinGameForm onJoin={onJoin} onCancel={onCancel} />);
      
      const gameIdInput = screen.getByLabelText(/game id/i);
      const playerInput = screen.getByLabelText(/your name/i);
      const submitButton = screen.getByRole('button', { name: /join/i });
      
      await userEvent.type(gameIdInput, 'abc123');
      await userEvent.type(playerInput, 'Player');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onJoin).toHaveBeenCalledWith('ABC123', 'Player');
      });
    });

    it('should prevent SQL injection in inputs', async () => {
      const onJoin = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleJoinGameForm onJoin={onJoin} onCancel={onCancel} />);
      
      const playerInput = screen.getByLabelText(/your name/i);
      const gameIdInput = screen.getByLabelText(/game id/i);
      const submitButton = screen.getByRole('button', { name: /join/i });
      
      await userEvent.type(playerInput, "'; DROP TABLE games; --");
      await userEvent.type(gameIdInput, 'ABC123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onJoin).toHaveBeenCalledWith('ABC123', "'; DROP TABLE games; --");
      });
    });
  });

  describe('Form Submission Edge Cases', () => {
    it('should prevent double submission', async () => {
      const onCreate = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const playerInput = screen.getByLabelText(/your name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });
      
      await userEvent.type(nameInput, 'Test Game');
      await userEvent.type(playerInput, 'Player');
      
      // Double click rapidly
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);
      
      // Should only submit once
      await waitFor(() => {
        expect(onCreate).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle form submission during loading', async () => {
      const onCreate = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const playerInput = screen.getByLabelText(/your name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });
      
      await userEvent.type(nameInput, 'Test Game');
      await userEvent.type(playerInput, 'Player');
      await userEvent.click(submitButton);
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/creating/i);
      
      // Try clicking again
      await userEvent.click(submitButton);
      
      // Should still only have one submission
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors gracefully', async () => {
      const onCreate = vi.fn().mockRejectedValue(new Error('Network error'));
      const onCancel = vi.fn();
      render(<SimpleCreateGameForm onCreate={onCreate} onCancel={onCancel} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const playerInput = screen.getByLabelText(/your name/i);
      const submitButton = screen.getByRole('button', { name: /create/i });
      
      await userEvent.type(nameInput, 'Test Game');
      await userEvent.type(playerInput, 'Player');
      await userEvent.click(submitButton);
      
      // Should show error message
      expect(await screen.findByText(/network error/i)).toBeInTheDocument();
      
      // Button should be re-enabled
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Keyboard Navigation Edge Cases', () => {
    it('should handle Enter key submission', async () => {
      const onJoin = vi.fn();
      const onCancel = vi.fn();
      render(<SimpleJoinGameForm onJoin={onJoin} onCancel={onCancel} />);
      
      const gameIdInput = screen.getByLabelText(/game id/i);
      const playerInput = screen.getByLabelText(/your name/i);
      
      await userEvent.type(gameIdInput, 'ABC123');
      await userEvent.type(playerInput, 'Player');
      
      // Press Enter in the last field
      fireEvent.keyPress(playerInput, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await waitFor(() => {
        expect(onJoin).toHaveBeenCalledWith('ABC123', 'Player');
      });
    });

    it('should handle Tab navigation', async () => {
      render(<SimpleCreateGameForm onCreate={vi.fn()} onCancel={vi.fn()} />);
      
      const nameInput = screen.getByLabelText(/host name/i);
      const playerCapSelect = screen.getByLabelText(/player limit/i);
      const difficultySelect = screen.getByLabelText(/difficulty/i);
      
      // Start at first input
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      // Tab to next
      await userEvent.tab();
      expect(document.activeElement).toBe(playerCapSelect);
      
      // Tab to select
      await userEvent.tab();
      expect(document.activeElement).toBe(difficultySelect);
    });
  });
});
