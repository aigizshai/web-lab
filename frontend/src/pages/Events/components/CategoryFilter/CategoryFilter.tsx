// src/components/CategoryFilter/CategoryFilter.tsx
import type { EventCategory } from '../../../../types/event';
import styles from './CategoryFilter.module.scss';

interface CategoryFilterProps {
  categories: EventCategory[];
  selectedCategory: EventCategory | 'all';
  onCategoryChange: (category: EventCategory | 'all') => void;
}

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) => {
  const allCategories: (EventCategory | 'all')[] = ['all', ...categories];

  return (
    <div className={styles.categoryFilter}>
      <div className={styles.filterHeader}>
        <h4>Фильтр по категориям</h4>
        {selectedCategory !== 'all' && (
          <button 
            onClick={() => onCategoryChange('all')}
            className={styles.clearButton}
          >
            Сбросить
          </button>
        )}
      </div>
      
      <div className={styles.categories}>
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.active : ''
            }`}
            title={category === 'all' ? 'Все категории' : category}
          >
            <span className={styles.categoryIcon}>
              {getCategoryIcon(category)}
            </span>
            <span className={styles.categoryName}>
              {getCategoryDisplayName(category)}
            </span>
            {selectedCategory === category && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>
      
      <div className={styles.selectedInfo}>
        {selectedCategory !== 'all' && (
          <>
            <span className={styles.selectedLabel}>Выбрано:</span>
            <span className={styles.selectedCategory}>
              {getCategoryDisplayName(selectedCategory)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// Иконки для категорий
const getCategoryIcon = (category: EventCategory | 'all'): string => {
  switch (category) {
    case 'встреча':
      return '👥';
    case 'день рождения':
      return '🎂';
    case 'праздник':
      return '🎉';
    case 'концерт':
      return '🎵';
    case 'лекция':
      return '📚';
    case 'выставка':
      return '🖼️';
    case 'другое':
      return '📌';
    case 'all':
      return '📋';
    default:
      return '📅';
  }
};

// Отображаемые названия категорий
const getCategoryDisplayName = (category: EventCategory | 'all'): string => {
  switch (category) {
    case 'встреча':
      return 'Встречи';
    case 'день рождения':
      return 'Дни рождения';
    case 'праздник':
      return 'Праздники';
    case 'концерт':
      return 'Концерты';
    case 'лекция':
      return 'Лекции';
    case 'выставка':
      return 'Выставки';
    case 'другое':
      return 'Другое';
    case 'all':
      return 'Все категории';
    default:
      return category;
  }
};

export default CategoryFilter;