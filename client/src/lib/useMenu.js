import { useEffect, useState } from 'react';
import api from './api.js';

let cache = null;

// Visible header and footer items from the Menu Builder. Returns null until loaded.
export default function useMenu() {
  const [menu, setMenu] = useState(cache);
  useEffect(() => { api.get('/menus').then((r) => { cache = r.data; setMenu(r.data); }).catch(() => {}); }, []);
  return menu;
}
