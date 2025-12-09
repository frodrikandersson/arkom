import { stackClientApp } from '../../config/stack';

interface AuthButtonsProps {
  isLoggedIn: boolean;
  userName?: string | null;
}

export const AuthButtons = ({ isLoggedIn, userName }: AuthButtonsProps) => {
  if (isLoggedIn) {
    return (
      <div>
        <p>Welcome, {userName || 'User'}!</p>
        <button onClick={() => stackClientApp.signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <a href="/handler/sign-in">Sign In</a>
      {' | '}
      <a href="/handler/sign-up">Sign Up</a>
    </div>
  );
};