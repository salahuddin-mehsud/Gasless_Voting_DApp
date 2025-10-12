import React from 'react';
import { Google, Github } from 'lucide-react';
import Button from '../ui/Button.jsx';

const SocialLogin = ({ onGoogleLogin, onGithubLogin, loading = false }) => {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGoogleLogin}
        disabled={loading}
      >
        <Google className="h-5 w-5 mr-2" />
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGithubLogin}
        disabled={loading}
      >
        <Github className="h-5 w-5 mr-2" />
        Continue with GitHub
      </Button>
    </div>
  );
};

export default SocialLogin;