
import React, { useState, useEffect } from "react";
import "../styles/Main.css";

function Main() {

  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchLatestRecipe = async () => {
      try {
        const res = await fetch("https://project2-data.onrender.com/recipes?_sort=date&_order=desc&_limit=1");
        const data = await res.json();
        setRecipe(data[0]);
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
      }
    };

    fetchLatestRecipe();
  }, []);

  const projects = [
    {
      title: "Website",
      description: "",
      link: "",
    },
    {
      title: "Website",
      description: "",
      link: "",
    },
    {
      title: "Website",
      description: "",
      link: "",
    },
    
  ];

  

  return (
    <div className="home-container">
      <section className="welcome-section">
        <h1>Welcome to Recipe Manager App</h1>
        <p>
          You can create, view, edit, delete, and organize your
          favorite recipes!
        </p>
      </section>

      <section className="featured-recipe-section">
        <h2>Featured Recipe</h2>
        {recipe ? (
        <div className="recipe-card">
          <div className="recipe-card-content">
            <h3>{recipe.title}</h3>
            <p>
              <strong>Description:</strong> {recipe.description}
            </p>
            <p>
              <strong>Ingredients:</strong> {recipe.ingredients}
            </p>
            <p>
              <strong>Steps:</strong> {recipe.steps}
            </p>
            <p>
              <strong>Tags:</strong> {recipe.tags}
            </p>
            <p>
              <strong>Difficulty:</strong> {recipe.difficulty}
            </p>
          </div>
        </div>
        ) : (
          <p>Loading latest recipe...</p>
        )}
      </section>

      <section className="projects-section">
        <h2 className="projects-heading">Projects from Web and Mobile 1 Course</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-item">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                View Project
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Main;
