interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  label?: string;
  className?: string;
}

export default function CategoryFilter({
  categories,
  value,
  onChange,
  label = 'Filter by Category:',
  className = 'user-filter-select',
}: CategoryFilterProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ marginRight: '12px', fontSize: '14px', color: 'var(--user-text-muted, #666)' }}>
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
