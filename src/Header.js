import React from 'react';
import { Link } from 'react-router-dom';

// Componente Header con los enlaces del menú
const Header = () => {
  return (
    <header>
      <nav>
        <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'space-around' }}>
        <li><Link to="/">Main</Link></li>
          <li><a href="#about">Lend Tokens</a></li>
          <li><Link to="/my-balance">My Balance</Link></li>
          <li><Link to="/admin">Administration</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;