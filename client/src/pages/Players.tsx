import React from 'react';
import { Link, useLocation } from 'wouter';

const Players = () => {
  const [location] = useLocation();

  return (
    <div className="players-menu">
      <nav>
        <ul>
          <li>
            <Link href="/players/buscar-jugador">
              <a className={location === '/players/buscar-jugador' ? 'active' : ''}>
                Buscar Jugador
              </a>
            </Link>
          </li>
          <li>
            <Link href="/players/mas-apostadores">
              <a className={location === '/players/mas-apostadores' ? 'active' : ''}>
                Más Apostadores
              </a>
            </Link>
          </li>
          <li>
            <Link href="/players/mas-ganadores">
              <a className={location === '/players/mas-ganadores' ? 'active' : ''}>
                Más Ganadores
              </a>
            </Link>
          </li>
          <li>
            <Link href="/players/jugadores-activos">
              <a className={location === '/players/jugadores-activos' ? 'active' : ''}>
                Jugadores Activos
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Players;