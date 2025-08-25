import React, { useEffect, useState } from 'react';
import './style.css';
import Loader from '../Utility/Loader';

const News = () => {
  const [loading, setLoading] = useState(false);
  const [aiArticles, setAiArticles] = useState([]);
  const [programmingArticles, setProgrammingArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const [aiRes, programmingRes] = await Promise.all([
          fetch('https://dev.to/api/articles?tag=ai'),
          fetch('https://dev.to/api/articles?tag=programming'),
        ]);

        const aiData = await aiRes.json();
        const programmingData = await programmingRes.json();

        setAiArticles(aiData);
        setProgrammingArticles(programmingData);
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  const renderArticles = (articles) =>
    articles.slice(0, 6).map((article) => (
      <div key={article.id} className="card">
        <h3>{article.title}</h3>
        <p>By {article.user.name}</p>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          Read More →
        </a>
      </div>
    ));

  return (
    <div className="articles-container">
      {loading && <Loader />}
      <h1 className="section-heading">Latest News</h1>

      <div className="section">
        <h2>AI News</h2>
        <div className="card-grid">{renderArticles(aiArticles)}</div>
      </div>

      <div className="section">
        <h2>Programming News</h2>
        <div className="card-grid">{renderArticles(programmingArticles)}</div>
      </div>
    </div>
  );
};

export default News;
