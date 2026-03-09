import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function CategoryMultiSelect({ categories, selected, onChange, placeholder = 'Search and select categories...' }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(cat.name)
  );

  const addCategory = (name: string) => {
    onChange([...selected, name]);
    setSearch('');
    inputRef.current?.focus();
  };

  const removeCategory = (name: string) => {
    onChange(selected.filter((s) => s !== name));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Box */}
      <div
        className={`min-h-[42px] w-full cursor-text rounded-md border px-3 py-2 text-sm transition-all
          ${open ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}`}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <div className="flex flex-wrap gap-1.5">
          {/* Selected Tags */}
          {selected.map((cat) => (
            <span
              key={cat}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {cat}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeCategory(cat); }}
                className="ml-0.5 rounded-full hover:bg-blue-200 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : 'Add more...'}
            className="flex-1 min-w-[120px] bg-transparent outline-none placeholder-gray-400 text-sm"
          />
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`absolute right-3 top-3 h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {/* Search hint */}
          {search && (
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-xs text-gray-500">
              <Search className="h-3 w-3" />
              Searching for "{search}"
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => addCategory(cat.name)}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  {cat.name}
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-center text-sm text-gray-400">
                {search ? `No categories match "${search}"` : 'All categories selected'}
              </li>
            )}
          </ul>

          {/* Selected count footer */}
          {selected.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
              {selected.length} categor{selected.length === 1 ? 'y' : 'ies'} selected
              <button
                type="button"
                onClick={() => onChange([])}
                className="ml-2 text-red-500 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
