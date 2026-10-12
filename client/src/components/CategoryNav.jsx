import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ChevronDown } from 'lucide-react';

const cat = (n) => `/shop?category=${encodeURIComponent(n)}`;
const flag = (f) => `/shop?flag=${f}`;
const kids = (...names) => names.map((label) => ({ label, to: cat(label) }));

// Labels match the category names in the database. An item with `children` shows a ▾ arrow and a dropdown.
// An item with both `to` and `children` (Snacks) is a link plus a separate arrow button.
export const DEFAULT_NAV = [
  { label: 'Home Features', children: [{ label: 'Featured Products', to: flag('featured') }, { label: 'Special Offers', to: flag('offer') }, { label: 'Best Sellers', to: flag('best') }, { label: 'New Arrivals', to: flag('new') }] },
  { label: 'Offer Zone', to: flag('offer') },
  { label: 'Honey', to: cat('Honey') },
  { label: 'Oil & Ghee', children: kids('Cooking Oil', 'Ghee') },
  { label: 'Dates', children: kids('Dates', 'Dry Fruits', 'Peanut Butter') },
  { label: 'Spices', to: cat('Spices') },
  { label: 'Nuts & Seeds', children: kids('Seeds') },
  { label: 'Beverage', children: kids('Beverages', 'Coffee', 'Tea', 'Mineral Water', 'Soft Drinks') },
  { label: 'Snacks', to: cat('Snacks'), children: kids('Biscuits', 'Noodles', 'Oats', 'Breakfast Items', 'Instant Food', 'Frozen Food', 'Jam', 'Jelly', 'Tomato Ketchup', 'Sauces', 'Mayonnaise') },
  { label: 'Rice', to: cat('Rice') },
  { label: 'Flours & Lentils', children: kids('Flour & Atta', 'Lentils', 'Sugar', 'Salt') },
  { label: 'Personal & Home Care', children: kids('Baby Food', 'Eggs', 'Milk Powder', 'Cleaning Supplies', 'Detergent', 'Dish Wash', 'Tissue', 'Shampoo', 'Soap', 'Toothpaste') },
];

const itemClass = 'flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:text-[#8c6747] focus-visible:text-[#8c6747]';
const subClass = 'block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#8c6747]/10 hover:font-medium hover:text-[#8c6747] focus-visible:bg-[#8c6747]/10 focus-visible:text-[#8c6747]';

export default function CategoryNav({ items = DEFAULT_NAV }) {
  const [open, setOpen] = useState(null); // { i, left, top, width } for the sub-menu that is open
  const [allOpen, setAllOpen] = useState(false); // the "All" dropdown
  const root = useRef(null);
  const itemRefs = useRef([]);
  const stamp = useRef(0);

  const closeAll = useCallback(() => { setOpen(null); setAllOpen(false); }, []);

  // Close everything when clicking outside, pressing Escape, or resizing the window
  useEffect(() => {
    const outside = (e) => { if (root.current && !root.current.contains(e.target)) closeAll(); };
    const esc = (e) => { if (e.key === 'Escape') closeAll(); };
    const resize = () => setOpen(null);
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', esc);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('resize', resize);
    };
  }, [closeAll]);

  // The sub-menu is positioned with `fixed` so the horizontally scrolling row cannot clip it.
  const openMenu = (i) => {
    const el = itemRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(items[i].children.length > 8 ? 416 : 232, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    stamp.current = Date.now();
    setAllOpen(false);
    setOpen({ i, left, top: r.bottom, width });
  };
  // A click toggles. A touch tap also fires a hover event first, so a click right after opening is ignored.
  const toggleMenu = (i) => (open?.i === i && Date.now() - stamp.current > 400 ? setOpen(null) : openMenu(i));

  const current = open ? items[open.i] : null;

  return (
    <nav ref={root} aria-label="Categories" onMouseLeave={() => setOpen(null)} className="relative border-y border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => { setOpen(null); setAllOpen((v) => !v); }}
          aria-expanded={allOpen}
          aria-haspopup="true"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-[#8c6747] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#7a5a3d]"
        >
          <LayoutGrid size={18} />
          All
          <ChevronDown size={16} className={`transition-transform duration-200 ${allOpen ? 'rotate-180' : ''}`} />
        </button>

        <ul onScroll={() => setOpen(null)} className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {items.map((it, i) => {
            const has = !!it.children?.length;
            const isOpen = open?.i === i;
            const chevron = <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />;
            return (
              <li
                key={it.label}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="shrink-0"
                onMouseEnter={() => (has ? openMenu(i) : setOpen(null))}
              >
                {has && !it.to ? (
                  <button type="button" aria-haspopup="true" aria-expanded={isOpen} onClick={() => toggleMenu(i)} className={itemClass}>
                    {it.label}{chevron}
                  </button>
                ) : (
                  <div className="flex items-center">
                    <Link to={it.to} onClick={closeAll} className={itemClass}>{it.label}</Link>
                    {has && (
                      <button type="button" aria-haspopup="true" aria-expanded={isOpen} aria-label={`${it.label} sub-menu`} onClick={() => toggleMenu(i)} className="-ml-2 rounded-md p-2 hover:text-[#8c6747]">
                        {chevron}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* "All" dropdown: every primary category with its sub-categories */}
      {allOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white shadow-xl">
          <div className="mx-auto max-h-[70vh] max-w-7xl overflow-y-auto px-4 py-5">
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((it) => (
                <div key={it.label}>
                  {it.to
                    ? <Link to={it.to} onClick={closeAll} className="font-bold text-gray-900 hover:text-[#8c6747]">{it.label}</Link>
                    : <p className="font-bold text-gray-900">{it.label}</p>}
                  {it.children?.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {it.children.map((c) => <li key={c.label}><Link to={c.to} onClick={closeAll} className="text-sm text-gray-600 hover:text-[#8c6747]">{c.label}</Link></li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-menu for the hovered or clicked item */}
      {current && (
        <ul
          style={{ top: open.top, left: open.left, width: open.width }}
          className={`fixed z-50 max-h-[70vh] overflow-y-auto rounded-b-lg border border-gray-200 bg-white py-1.5 shadow-xl ${current.children.length > 8 ? 'grid grid-cols-2' : ''}`}
        >
          {current.children.map((c) => (
            <li key={c.label}><Link to={c.to} onClick={closeAll} className={subClass}>{c.label}</Link></li>
          ))}
        </ul>
      )}
    </nav>
  );
}
