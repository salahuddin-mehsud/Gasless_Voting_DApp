import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Vote className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Gasless Vote</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Vote without gas fees using Account Abstraction. Create polls, vote gaslessly, 
              and experience the future of decentralized voting.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@gaslessvote.xyz"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/polls" className="text-gray-400 hover:text-white transition-colors">
                  Browse Polls
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-400 hover:text-white transition-colors">
                  Create Poll
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.alchemy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Alchemy Docs
                </a>
              </li>
              <li>
                <a
                  href="https://ethereum.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Ethereum
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sepolia Explorer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Gasless Vote. Built for Alchemy University.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;