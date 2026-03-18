import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([
    { 
      id: 1, 
      title: 'Web design', 
      icon: '💻', 
      color: '#4CAF50',
      count: 0 
    },
    { 
      id: 2, 
      title: 'Graphic design', 
      icon: '❤️', 
      color: '#2196F3',
      count: 0 
    },
    { 
      id: 3, 
      title: 'Web development', 
      icon: '🔍', 
      color: '#2196F3',
      count: 0 
    },
    { 
      id: 4, 
      title: 'Human Resource', 
      icon: '🏆', 
      color: '#9C27B0',
      count: 0 
    },
    { 
      id: 5, 
      title: 'Support', 
      icon: '🏠', 
      color: '#00BCD4',
      count: 0 
    },
    { 
      id: 6, 
      title: 'Android Development', 
      icon: '🌍', 
      color: '#FF9800',
      count: 0 
    }
  ]);
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategoryJobCounts() {
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('status', '==', 'active'), orderBy('postedAt', 'desc'));
        const jobsSnapshot = await getDocs(q);
        const allJobs = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Count jobs per category
        const newCategories = [...categories];
        allJobs.forEach(job => {
          if (job.category) {
            const categoryIndex = newCategories.findIndex(
              category => category.title.toLowerCase() === job.category.toLowerCase()
            );
            if (categoryIndex !== -1) {
              newCategories[categoryIndex].count++;
            }
          }
        });

        setCategories(newCategories);
      } catch (error) {
        console.error('Error fetching job counts by category:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryJobCounts();
  }, []);

  const handleCategoryClick = (category) => {
    navigate({
      pathname: '/jobs',
      search: `?category=${encodeURIComponent(category.title)}`
    });
  };

  return (
    <section className="categories section" id="categories">
      <div className="container">
        <div className="section-title">
          <h2>Browse Categories</h2>
          <p>Most popular categories of portal, sorted by popularity</p>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <div 
              className="category-card" 
              key={category.id} 
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-icon" style={{ backgroundColor: category.color }}>
                <span>{category.icon}</span>
              </div>
              <h3>{category.title}</h3>
              <p>({category.count} jobs)</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;